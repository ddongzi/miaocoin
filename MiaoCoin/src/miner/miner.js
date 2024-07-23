const { pathExists, readFileSync, writeFileSync } = require("fs-extra")
const MiaoCrypto = require("../util/miaoCrypto")

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
        this.timer = setInterval(() => this.mine(), 1000 * 60 * 10)
    }
    // 初始化加载 矿工密钥
    loadKeys(){
        // 读取私钥和公钥
        const privateKeyPath = DATA_PATH + PRIVATE_KEY_FILE
        const publicKeyPath = DATA_PATH + PUBLIC_KEY_FILE
        if (!pathExists(publicKeyPath) || !pathExists(privateKeyPath)) {
            const {privateKey, publicKey}  = MiaoCrypto.generateKeyPair()
            writeFileSync(publicKeyPath,publicKey)
            writeFileSync(privateKeyPath,privateKey)
        }
        this.privateKey = readFileSync(privateKeyPath, 'utf8')
        this.publicKey = readFileSync(publicKeyPath, 'utf8')
    }
}

module.exports = Miner