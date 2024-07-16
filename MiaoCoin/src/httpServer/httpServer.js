const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const miaoBlockChain = require('../blockchain/blockchain')
const P2P = require('./p2p')
class HttpServer {
    constructor(node = null, blockChain) {
        this.node = node
        this.blockChain = blockChain
        this.p2p = new P2P(4000)
        this.app = express()
        this.app.use(bodyParser.json())

        this.app.get('/blocks', (req, res) => {
            res.send(blockChain.blocks)
        })
        this.app.post('/mineBlock', (req, res) => {
            const newBlock = blockChain.generateNextBlock('test')
            res.send(newBlock)
        })
        this.app.get('/peers', (req,res) => {
            res.send(this.p2p.sockets.map((s) => s._socket.remoteAddress + ':' + s._socket.remotePort))
        })
        this.app.post('/addPeer', (req, res) => {
            const peer = req.body.peer
            console.log(`post Connecting to ${peer}`);
            this.p2p.connectPeer(peer)
            res.send('Connected to peer')
        })

    }
    
    listen(host, port) {
        return new Promise((resolve, reject) => {
            this.server = this.app.listen(port, host, (err) => {
                if (err) reject(err);
                console.info(`Listening http on port: ${this.server.address().port}, to access the API documentation go to http://${host}:${this.server.address().port}/api-docs/`);
                resolve(this);
            });
        });
    }

    stop() {
        return new Promise((resolve, reject) => {
            this.server.close((err) => {
                if (err) reject(err);
                console.info('Closing http');
                resolve(this);
            });
        });
    }
}

module.exports = HttpServer;

console.log(miaoBlockChain.blocks)
const miaoServer = new HttpServer({id:1, address:"localshot"},miaoBlockChain)
miaoServer.listen('localhost', 3300)