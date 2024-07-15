const express = require('express')
const bodyParser = require('body-parser')
const swaggerUI = require('swagger-ui-express')
const swaggerDocument = require('./swagger.json')
const path = require('path')
const miaoBlockChain = require('../blockchain/blockchain')
class HttpServer {
    constructor(node = null, blockChain) {
        this.node = node
        this.blockChain = blockChain

        this.app = express()
        this.app.use(bodyParser.json())

        this.app.set('views', path.join(__dirname, 'views'));
        this.app.set('view engine', 'pug')

        this.app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument))

        this.app.get('/blockchain', (req, res) => {
            console.log(`get : ${this.blockChain}`)
            res.render('blockchain/index.pug', {
                blocks: blockChain.blocks
            })
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