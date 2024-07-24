const Blocks = require("../blockchain/blocks")

// 节点间同步信息，方便序列化处理
class SyncMessage{
    constructor(blocks,utxouts) {
        this.blocks = blocks
        this.utxouts = utxouts
    }
    static serialize(message) {
        return JSON.stringify(message)
    }
    static deserialize(data) {
        return new SyncMessage(Blocks.fromJson(JSON.parse(data).blocks), JSON.parse(data).utxouts)
    }
}
module.exports = SyncMessage