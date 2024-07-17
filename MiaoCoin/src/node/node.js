const BlockChain = require("../blockchain/blockchain");
const HttpServer = require("../httpServer/httpServer");
const P2P = require("../httpServer/p2p");

class Node {
    constructor(blockchain) {
        this.blockchain = blockchain;
        this.txPool = blockchain.pool;   //
    }
    initNetwork(p2p,http) {
        this.p2p = p2p
        this.http = http
    }
    
    broadCastTransactionPool() {
        console.log(`broadCastTransactionPool ing...`)
    }

    receiveNewTransaction(tx) {
        // 接收到新的交易，添加到本地的交易池中
        console.log('Receive new transaction', tx);

        this.txPool.push(tx);
    }
}
const bc = new BlockChain('miao')
const node = new Node(bc)
const p2p = new P2P(4000,node)
const http = new HttpServer(3000,node)
node.initNetwork(p2p,http)