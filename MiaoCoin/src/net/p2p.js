const { write } = require('fs-extra');
const WebSocket = require('ws');
const EventEmitter = require('events');


const MessageType = {
    QUERY_LATEST: 0, // 查询最新区块
    QUERY_ALL: 1,   // 查询整个区块链 ：在节点初次加入时同步
    RESPONSE_BLOCKCHAIN: 2, // 回复上面请求
    QUERY_TRANSACTION_POOL: 3,  // 查询节点的交易池
    RESPONSE_TRANSACTION_POOL: 4,
    REQUEST_SYNC_BLOCKCHAIN: 5, // 请求同步区块链
    RESPONSE_SYNC_BLOCKCHAIN:6  // 收到区块链同步的回复
};

class P2P {
    
    constructor(port,node) {
        this.port = port
        this.node = node

        this.emitter = new EventEmitter()

        this.sockets = []
        this.initServer()

    }
    initServer() {
        this.server = new WebSocket.Server({port: this.port})
        this.server.on('connection', (socket, req) => {
            this.sockets.push(socket)

            const rip = req.socket.remoteAddress; // 
            const rport = req.socket.remotePort;
            console.log(`client connected .IP : ${rip} PORT : ${rport}`);
            
            // 连接关闭时触发
            socket.on('close', function () {
                console.log('Client disconnected');
            });

            // 发生错误时触发
            socket.on('error', function (error) {
                console.error('WebSocket error observed:', error);
            });
            this.initConnection(socket)
            // 发送欢迎消息给客户端
            socket.send(JSON.stringify({
                'type': -1,
                'description':'welcome client'
            }));
        })
        console.log(`P2p listening on ws://localhost:${this.port}`);
    }
    initConnection(socket) {
        this.initRequestMessageHandler(socket)
    }
    // 作为服务端，处理请求
    initRequestMessageHandler(socket) {
        socket.on('message', (data) => {

            const message = JSON.parse(data);
            console.log(`Received message :  ${JSON.stringify(message)}`);

            switch (message.type) {
                case MessageType.QUERY_LATEST:
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
                    this.node.responseTransactionPool(message.data)
                    break;
                case MessageType.REQUEST_SYNC_BLOCKCHAIN:
                    // 收到同步区块链请求
                    const resmsg = this.node.blockchain.getBlockchainSyncData()
                    socket.send(JSON.stringify(resmsg))
                    break;

            }
        });
    }
    initClient(socket) {
        this.sockets.push(socket);
    }
    // 作为客户端，发起连接，接受回复
    connectPeer(peer) {
        console.log(`Connecting to ${peer}`);
        //peer : 'ws://localhost:8080'
        const socket = new WebSocket(peer);

        socket.on('open', () => {
            this.initClient(socket)
            console.log(`push socket: ${this.sockets.length}`)
        });
        socket.on('error', (error) => {
            console.error('WebSocket error observed:', error);
        });
        this.initResponseMessageHandler(socket);
    }

    // 作为客户端，处理响应
    initResponseMessageHandler(socket) {
        socket.on('message', (data) => {
            const message = JSON.parse(data);
            console.log(`Received message from ${socket.url} :  ${JSON.stringify(message)}`);

            switch (message.type) {
                case MessageType.RESPONSE_BLOCKCHAIN:
                    this.node.receiveNewBlock(message.data)
                    break;
                case MessageType.RESPONSE_SYNC_BLOCKCHAIN:
                    this.node.blockchain.updateBlockchainFromSync(message.data)
                    break;
            }
        });
    }
    // 广播： 
    broadcast(msg) {
        console.log(`broadcast ${JSON.stringify(msg)}, sockets : ${this.sockets.length}`);
        this.sockets.forEach(socket => socket.send(JSON.stringify(msg)))
    }


}
module.exports = {P2P,MessageType}