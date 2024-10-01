const MiaoCrypto = require("../util/miaoCrypto");
const Logger = require('../util/log')
const logger = new Logger(__filename)
class Message {

    constructor(type, data) {
        this.type = type;
        this.data = data;
        this.id = MiaoCrypto.randomId() // 消息ID缓存,防止重复
    }

}