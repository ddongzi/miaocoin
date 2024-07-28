const MiaoCrypto = require("../util/miaoCrypto");

class Message {

    constructor(type, data) {
        this.type = type;
        this.data = data;
        this.id = MiaoCrypto.randomId() // 消息ID缓存
    }
}