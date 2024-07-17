const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const BlockChain = require('../blockchain/blockchain')
const P2P = require('./p2p')
const { myWallet } = require('../blockchain/wallet')
class HttpServer {
    constructor(port,node) {
        this.node = node
        this.blockchain = node.blockchain
        this.p2p = node.p2p

        this.port = port

        this.app = express()
        this.app.use(bodyParser.json())

        this.app.set('views', './views')
        this.app.set('view engine', 'pug')
        this.app.get('/blocks', (req, res) => {
            res.send(this.blockchain.blocks);
        })
        this.app.get('/mineBlock', (req, res) => {
            const newBlock = blockchain.generateNextBlock('test')
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
        this.app.post('/mineTransaction', (req,res) => {
            const address = req.body.address;
            const amount = req.body.amount;
            const resp = this.blockchain.generateNextBlockWithTransaction(address, amount);
            res.send(resp);
        })
        this.app.post('/sendTransaction',(req,res) => {
            const address = req.body.address;
            const amount = req.body.amount;
            const tx = this.blockchain.generateTransactionToPool(address,amount);
            res.send(tx)
        })
        this.listen('localhost', this.port)
    }
    
    listen(host, port) {
        return new Promise((resolve, reject) => {
            this.server = this.app.listen(port, host, (err) => {
                if (err) reject(err);
                console.info(`Listening http on : http://localhost:${this.server.address().port}`);
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

