const BlockChain = require("../blockchain/blockchain");
const Miner = require("../miner/miner");
const HttpServer = require("../net/httpServer");
const { P2P, MessageType } = require("../net/p2p");
const { getLocalIP } = require("../util/netUtil");

const nodeConfig = require("../../data/node/nodeConfig.json")

class Node {

  constructor({root = false}) {
    // TODO 节点标识
    
    console.log(`Node construct from config. Root: ${root}`);
    
    this.node_config = {
      'root':root
    }
  }
  requestSync(peer = "") {
    console.log("request sync ....");
    const msg = {
      type: MessageType.REQUEST_SYNC_BLOCKCHAIN,
      description: "request_sync_blockchain",
      data: {
        wsurl: this.p2p.wsurl, // 发送自己服务地址
      },
    };
    if (peer.length === 0) {
        this.p2p.broadcast(msg);
    } else {
      this.p2p.sendPeer(peer, msg);
    }
  }

  // 初始化区块链
  initBlockChain(blockchain) {
    this.blockchain = blockchain
    blockchain.init() 
  }

  // 初始化网络 p2p和http服务
  initNetwork(p2p, http) {
    this.p2p = p2p;
    this.http = http;

    // 节点上线时候请求同步
    this.requestSync();
  }

  // 初始化矿工
   initMiner() {
    this.miner =  Miner.create(this);
    console.log(`initMiner ${this.miner}`)
  }

  broadCastTransactionPool() {
    console.log(`broadCastTransactionPool ing...`);
  }
  responseTransactionPool(transactions) {
    // 1. 尝试将tx放入池子
    transactions.forEach((tx) => {
      this.blockchain.addToTransactionPool(tx);
    });
    console.log(`responseTransactionPool finished...`);
  }
  receiveNewTransaction(tx) {
    // 接收到新的交易，添加到本地的交易池中
    console.log("Receive new transaction", tx);

    this.txPool.push(tx);
  }
  // 返回未确认交易池消息
  queryTransactionPool() {
    return {
      type: MessageType.RESPONSE_TRANSACTION_POOL,
      data: this.blockchain.pool,
    };
  }

  // 1. 广播 未确认交易
  broadcastTransactionPool() {
    this.p2p.broadcast(this.queryTransactionPool());
  }
}

module.exports = Node;
