const WebSocket = require('ws');


const MessageType = {
    QUERY_LATEST: 0, // 查询最新区块
    QUERY_ALL: 1,   // 查询整个区块链 ：在节点初次加入时同步
    RESPONSE_BLOCKCHAIN: 2, // 回复上面请求
    QUERY_TRANSACTION_POOL: 3,  // 查询节点的交易池
    RESPONSE_TRANSACTION_POOL: 4
};

class P2P {
    
    constructor(port,node) {
        this.port = port
        this.sockets = []
        this.initServer()
        this.node = node
    }
    initServer() {
        this.server = new WebSocket.Server({port: this.port})
        this.server.on('connection', (socket) => {
            console.log('Client connected');
            this.sockets.push(socket)
            
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
            socket.send('Welcome new client!');
        })
        console.log(`P2p listening on ws://localhost:${this.port}`);
    }
    initConnection(socket) {
        this.initMessageHandler(socket)
    }
    initMessageHandler(socket) {
        socket.on('message', (data) => {
            const message = JSON.parse(data);
            console.log(`Received message from ${message.type}, ${JSON.stringify(message.data)}`);

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
                    this.queryTransactionPool(ws);
                    break;
                case MessageType.RESPONSE_TRANSACTION_POOL:
                    // 收到未确认的交易
                    const receiveTransactions = message.data
                    receiveTransactions.forEach((tx) =>{
                        this.node.receiveNewTransaction(tx);
                        this.node.broadCastTransactionPool()
                    })
                    socket.send("Response successfully received")
                    break;
            }
        });
    }
    initClient(socket) {
        this.sockets.push(socket);
    }
    connectPeer(peer) {
        console.log(`Connecting to ${peer}`);
        //peer : 'ws://localhost:8080'
        const socket = new WebSocket(peer);
        socket.on('open', () => {
            this.initClient(socket)
        });
        socket.on('error', (error) => {
            console.error('WebSocket error observed:', error);
        });
    }
    
}
module.exports = P2P