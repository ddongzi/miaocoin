const BlockChain = require("../blockchain/blockchain");
const Miner = require("../miner/miner");
const HttpServer = require("../net/httpServer");
const {P2P,MessageType} = require("../net/p2p");

class Node {
    constructor() {
        // 空的区块链
        this.blockchain = new BlockChain(this)
    }

    requestSync() {
        console.log('request sync ....')
        this.p2p.broadcast({
            'type': MessageType.REQUEST_SYNC_BLOCKCHAIN,
            'description': 'timer sync',
            'data': 'request_sync_blockchain.'
        })
    }
    initNetwork(p2p,http) {
        this.p2p = p2p
        this.http = http

        // 连接到引导节点：
        this.p2p.connectPeer('ws://172.17.0.2:4000')


        // 定时同步
        this.syncTimer = function () {
            setInterval(() => this.requestSync(), 5000)
        }
        this.syncTimer()
    }

    // 初始化矿工
    initMiner() {
        this.miner = new Miner(this)
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