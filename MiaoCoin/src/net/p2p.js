const { write } = require("fs-extra");
const WebSocket = require("ws");
const EventEmitter = require("events");
const { getLocalIP } = require("../util/netUtil");
const Block = require("../blockchain/block");
const Logger = require('../util/log')
const logger = new Logger(__filename)
const MessageType = {
  QUERY_LATEST: 0, // 查询最新区块
  QUERY_ALL: 1, // 查询整个区块链 ：在节点初次加入时同步
  RESPONSE_BLOCKCHAIN: 2, // 回复上面请求
  QUERY_TRANSACTION_POOL: 3, // 查询节点的交易池
  RESPONSE_TRANSACTION_POOL: 4,

  REQUEST_SYNC_BLOCKCHAIN: 5, // 请求同步区块链
  RESPONSE_SYNC_BLOCKCHAIN: 6, // 收到区块链同步的回复

  NEW_BLOCK: 7, // 发掘到新的区块
  PEER_P2P_UP: 8, // 节点主动上报自己的服务地址
  NOTIFY_SYNC: 9, // 主动通知同步
  PEER_P2P_UP_FORBIDDEN_ROOT:10 // 节点上线 禁止root 失败！

};

class P2P {
  constructor(port, node) {
    this.port = port;
    this.node = node;

    this.wsurl = "ws://" + getLocalIP() + ":" + port;
    logger.log(`P2P constructor , wsurl: ${this.wsurl}`);
    this.emitter = new EventEmitter();

    this.sockets = []; // 客户端套接字：保持连接 （自己为服务端）

    this.peers = new Map(); // 服务端对端： <wsurl,socket>,不包含自己

    this.initServer(); // 服务端角色
    this.initClient(); // 客户端角色
  }

  // 初始化自己客户端角色
  initClient() {
    // 连接到引导节点：目前就是root， root自己不联自己
    if (!this.node.isroot) {
      this.updatePeers(["ws://127.0.0.1:4000"]);
    }
  }

  initServer() {
    this.server = new WebSocket.Server({ port: this.port });
    this.server.on("connection", (socket, req) => {
      this.sockets.push(socket);
      logger.log(`client connected .`);

      // 连接关闭时触发
      socket.on("close", function () {
        logger.log("Client disconnected");
      });

      // 发生错误时触发
      socket.on("error", function (error) {
        console.error("WebSocket error observed:", error);
      });
      this.initConnection(socket);
      // 发送欢迎消息给客户端
      socket.send(
        JSON.stringify({
          type: -1,
          description: "welcome client",
        })
      );
    });
    logger.log(`P2p listening on ws://${this.wsurl}:${this.port}`);
  }

  // 作为服务端，初始化与客户端请求
  initConnection(socket) {
    this.initRequestMessageHandler(socket);
    this.initRequestMessageHandler.bind(this);
  }
  // 作为服务端，处理请求
  initRequestMessageHandler = (socket) => {
    socket.on("message", (data) => {
      const message = JSON.parse(data);
      logger.log(`Received requst message :  ${data}`);

      switch (message.type) {
        case MessageType.QUERY_LATEST:
          this.queryLatestBlock(ws);
          break;
        case MessageType.QUERY_ALL:
          this.queryAllBlocks(ws);
          break;
        case MessageType.RESPONSE_BLOCKCHAIN:
          (() => {
             this.node.blockchain.receiveNewBlock(message.data);
          })()
          break;
        case MessageType.QUERY_TRANSACTION_POOL:
          const msg = this.node.queryTransactionPool();
          break;
        case MessageType.RESPONSE_TRANSACTION_POOL:
          // 收到未确认的交易
          this.node.responseTransactionPool(message.data);
          break;
        case MessageType.REQUEST_SYNC_BLOCKCHAIN:
          // 收到同步区块链请求
          const resmsg = this.node.blockchain.getBlockchainSyncData();
          socket.send(JSON.stringify(resmsg));
          break;
        case MessageType.PEER_P2P_UP:
          // 节点P2P服务上线. 
          // 严重合法性， 比如 禁止root
          let {isroot, wsurl} = message.data;
          if (isroot) {
            socket.send(JSON.stringify({
              'type': MessageType.PEER_P2P_UP_FORBIDDEN_ROOT,
              'data': {}
            }))
          } else {
            this.updatePeers([wsurl]);
          }
          break;
        case MessageType.NEW_BLOCK:
          // 收到 新块
          ( ()=>{
             this.node.blockchain.receiveNewBlock(Block.fromJson(message.data));
          })()
          break;
        case MessageType.NOTIFY_SYNC:
          // 向指定peer请求同步
          const peerurl = message.data.wsurl;
          this.node.requestSync(peerurl);
          break;
      }
    });
  };
  // 更新对等节点列表并连接新的节点
  updatePeers(peers) {
    // 找出新的对等节点
    var newPeers = peers.filter((peer) => {
      for (let url of this.peers.keys()) {
        if (url === peer) {
          return false;
        }
      }
      return true;
    });
    newPeers = newPeers.filter((peer) => peer !== this.wsurl);
    logger.log(`new peers  ${JSON.stringify(newPeers)}`);
    for (let newPeer of newPeers) {
      const socket = this.connectPeer(newPeer);
    }
    logger.log(`update peers ${[...this.peers.keys()]}`);
  }

  // 作为客户端，发起连接，接受回复
  connectPeer(peer) {
    logger.log(`Connecting to ${peer}`);
    //peer : 'ws://localhost:8080'
    const socket = new WebSocket(peer);

    this.peers.set(peer, socket);

    socket.on("open", () => {
      logger.log(`socket on : ${peer}`);
      this.broadcast({
        type: MessageType.PEER_P2P_UP,
        description: "peer p2p service up",
        data: {
          wsurl: this.wsurl, // 发送自己服务地址
          root: this.node.isroot
        },
      });
    });
    socket.on("error", (error) => {
      console.error("WebSocket error observed:", error);
    });
    this.initResponseMessageHandler(socket);

    return socket;
  }
  // 作为客户端，向某个对端（服务端）发送消息
  sendPeer(peer, msg) {
    // 检查socket状态
    if (this.peers.has(peer)) {
      this.peers.get(peer).send(JSON.stringify(msg));
    } else {
      //
      logger.log(`send peer ${peer} not recorded`);
    }
  }

  // 作为客户端，处理响应
  initResponseMessageHandler(socket) {
    socket.on("message", (data) => {
      const message = JSON.parse(data);
      logger.log(`Received response message :  ${data}`);

      switch (message.type) {
        case MessageType.RESPONSE_BLOCKCHAIN:

          ( ()=>{
             this.node.blockchain.receiveNewBlock(message.data);
          })()
          break;
        case MessageType.RESPONSE_SYNC_BLOCKCHAIN:
          this.node.blockchain.updateBlockchainFromSync(
            JSON.stringify(message.data)
          );
          break;
        case MessageType.PEER_P2P_UP_FORBIDDEN_ROOT:
          // 下线
          process.exit(-1);
          break
      }
    });
  }
  // 广播： msg为对象类型
  broadcast(msg) {
    logger.log(
      `broadcast ${JSON.stringify(msg)}, sockets : ${this.peers.size}`
    );
    // 向各peer服务地址发出请求
    for (var peer of this.peers.keys()) {
      const socket = this.peers.get(peer);
      if (socket.readyState === WebSocket.OPEN) {
        logger.log(`broadcast to ${peer}`);
        socket.send(JSON.stringify(msg));
      } else {
        let intervalId = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            clearInterval(intervalId);
            socket.send(JSON.stringify(msg));
          } else {
            logger.log(`WebSocket not open. ${peer} Retrying...`);
          }
        }, 1000 * 5); // 5s 重试
      }
    }
  }
}
module.exports = { P2P, MessageType };
