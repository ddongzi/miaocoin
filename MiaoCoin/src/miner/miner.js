const { pathExists, readFileSync, writeFileSync, existsSync } = require("fs-extra")
const MiaoCrypto = require("../util/miaoCrypto")
const { MessageType } = require("../net/p2p")

// 每个节点上都有矿工角色。  负责签名产生区块
const DATA_PATH = '/home/dong/JSCODE/MiaoCoin/data/miner'
const PRIVATE_KEY_FILE = '/privatekey.pem'
const PUBLIC_KEY_FILE = '/publickey.pem'

class Miner {
    constructor (node) {
        this.init()

        this.address = this.publicKey
        this.node = node
    }
    init() {
        this.loadKeys()
        this.timer = setInterval(() => this.mine(), 1000 * 60 * MiaoCrypto.randomInt(1,10))
    }
    // 主动定时1分支去请求产生区块
    mine() {
        console.log(`Miner is mining...`)
        const newBlock = this.node.blockchain.generateNextBlockWithMine()
        console.log(`Miner done.`)
        // 广播
        this.node.p2p.broadcast({
            'type': MessageType.NEW_BLOCK,
            'description': 'new block',
            'data': newBlock
        })
    }
    // 初始化加载 矿工密钥
    loadKeys(){
        // 读取私钥和公钥
        const privateKeyPath = DATA_PATH + PRIVATE_KEY_FILE
        const publicKeyPath = DATA_PATH + PUBLIC_KEY_FILE
        if (!existsSync(publicKeyPath) || !existsSync(privateKeyPath)) {
            const {privateKey, publicKey}  = MiaoCrypto.generateKeyPair()
            writeFileSync(publicKeyPath,publicKey)
            writeFileSync(privateKeyPath,privateKey)
        }
        this.privateKey = MiaoCrypto.pemToHex(readFileSync(privateKeyPath, 'utf8'))
        this.publicKey = MiaoCrypto.pemToHex(readFileSync(publicKeyPath, 'utf8'))
        console.log(`Miner loaded keys: ${this.publicKey}`)
    }
}

module.exports = Miner