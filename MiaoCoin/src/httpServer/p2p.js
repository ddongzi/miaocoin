const WebSocket = require('ws');


class P2P {
    
    constructor(port) {
        this.port = port
        this.sockets = []
        this.initServer()
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

            // 发送欢迎消息给客户端
            socket.send('Welcome new client!');
        })
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