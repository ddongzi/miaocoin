const { write } = require("fs-extra");
const WebSocket = require("ws");
const EventEmitter = require("events");
const { getLocalIP } = require("../util/netUtil");
const Block = require("../blockchain/block");

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
  
  NOTIFY_SYNC: 9 // 主动通知同步
};

class P2P {
  constructor(port, node) {
    this.port = port;
    this.node = node;

    this.wsurl = "ws://" + getLocalIP() + ":" + port;
    console.log(`P2P constructor , wsurl: ${this.wsurl}`);
    this.emitter = new EventEmitter();

    this.sockets = []; // 客户端套接字：保持连接 （自己为服务端）

    this.peers = new Map(); // 服务端对端： <wsurl,socket>

    this.initServer(); // 服务端角色
    this.initClient(); // 客户端角色
  }

  // 初始化自己客户端角色
  initClient() {
    // 连接到引导节点：
    const socket = this.connectPeer("ws://172.17.0.2:4000");
  }

  initServer() {
    this.server = new WebSocket.Server({ port: this.port });
    this.server.on("connection", (socket, req) => {
      this.sockets.push(socket);
      console.log(`client connected .`);

      // 连接关闭时触发
      socket.on("close", function () {
        console.log("Client disconnected");
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
    console.log(`P2p listening on ws://localhost:${this.port}`);
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
      console.log(`Received requst message :  ${data}`);

      switch (message.type) {
        case MessageType.QUERY_LATEST:``
          this.queryLatestBlock(ws);
          break;
        case MessageType.QUERY_ALL:
          this.queryAllBlocks(ws);
          break;
        case MessageType.RESPONSE_BLOCKCHAIN:
          this.receiveNewBlock(message.data);
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
          // 节点P2P服务上线
          let peerwsurl = message.data.wsurl;
          this.updatePeers([peer]);
          break;
        case MessageType.NEW_BLOCK:
          // 收到 新块
          this.node.blockchain.receiveNewBlock(Block.fromJson(message.data));
          break;
        case MessageType.NOTIFY_SYNC:
          // 向指定peer请求同步
          const peerurl = message.data.wsurl
          this.node.requestSync(peerurl)
          break
        }
    });
  };
  // 更新对等节点列表并连接新的节点
  updatePeers(peers) {
    // 找出新的对等节点
    const newPeers = peers.filter((peer) => !this.peers.keys().includes(peer));
    for(let newPeer of newPeers) {
      const socket = connectPeer(newPeer)
      this.peers.set(newPeer,socket)
    }
    console.log(`update peers ${JSON.stringfy(newPeers)}`)
  }

  // 作为客户端，发起连接，接受回复
  connectPeer(peer) {
    console.log(`Connecting to ${peer}`);
    //peer : 'ws://localhost:8080'
    const socket = new WebSocket(peer);

    socket.on("open", () => {
      this.peers.set(peer,socket)
      socket.send(
        JSON.stringify({
          type: MessageType.PEER_P2P_UP,
          description: "peer p2p service up",
          data: {
            wsurl: this.wsurl, // 发送自己服务地址
          },
        })
      );
      // console.log(`push socket: ${this.peers.length}`);
    });
    socket.on("error", (error) => {
      console.error("WebSocket error observed:", error);
    });
    this.initResponseMessageHandler(socket);

    return socket;
  }
  // 作为客户端，向某个对端（服务端）发送消息
  sendPeer(peer,msg) {
    // 检查socket状态
    if (this.peers.has(peer)) {
      this.peers.get(peer).send(JSON.stringfy(msg))
    } else {
      //
      console.log(`send peer ${peer} not recorded`)
    }
  }

  // 作为客户端，处理响应
  initResponseMessageHandler(socket) {
    socket.on("message", (data) => {
      const message = JSON.parse(data);
      console.log(`Received response message :  ${data}`);

      switch (message.type) {
        case MessageType.RESPONSE_BLOCKCHAIN:
          this.node.receiveNewBlock(message.data);
          break;
        case MessageType.RESPONSE_SYNC_BLOCKCHAIN:
          this.node.blockchain.updateBlockchainFromSync(
            JSON.stringify(message.data)
          );
          break;

      }
    });
  }
  // 广播：
  broadcast(msg) {
    console.log(
      `broadcast ${JSON.stringify(msg)}, sockets : ${this.peers.length}`
    );
    // 向各peer服务地址发出请求
    for (var socket of this.peers.values()) {
      socket.send(JSON.stringify(msg))    
    }
     
  }
}
module.exports = { P2P, MessageType };
