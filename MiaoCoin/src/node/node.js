const BlockChain = require("../blockchain/blockchain");
const HttpServer = require("../httpServer/httpServer");
const {P2P,MessageType} = require("../httpServer/p2p");

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
    responseTransactionPool(transactions) {
        // 1. 尝试将tx放入池子
        transactions.forEach(tx => {
            this.blockchain.addToTransactionPool(tx)
        });
        console.log(`responseTransactionPool finished...`)
    }
    receiveNewTransaction(tx) {
        // 接收到新的交易，添加到本地的交易池中
        console.log('Receive new transaction', tx);

        this.txPool.push(tx);
    }
    // 返回未确认交易池消息
    queryTransactionPool() {
        return {
            'type': MessageType.RESPONSE_TRANSACTION_POOL,
            'data':this.blockchain.pool
        }
    }

    // 1. 广播 未确认交易
    broadcastTransactionPool() {
        this.p2p.broadcast(this.queryTransactionPool())
    }
}

module.exports = Node