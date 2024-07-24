const Blocks = require("../blockchain/blocks")

// 节点间同步信息，方便序列化处理
class SyncMessage{
    constructor(blocks,utxouts,peers) {
        this.blocks = blocks
        this.utxouts = utxouts
        this.peers = peers // ws地址 数组
    }
    static serialize(message) {
        return JSON.stringify(message)
    }
    static deserialize(data) {
        return new SyncMessage(Blocks.fromJson(JSON.parse(data).blocks), 
            JSON.parse(data).utxouts,
            JSON.parse(data).peers)
    }
}
module.exports = SyncMessage