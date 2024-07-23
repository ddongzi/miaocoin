// 每个节点上都有矿工角色。  负责签名产生区块
class Miner {
    constructor (node) {
        this.privateKey = null
        this.publicKey = null
        this.address = this.publicKey
        this.node = node
    }
}

module.exports = Miner