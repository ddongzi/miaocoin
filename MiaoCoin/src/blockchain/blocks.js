// blocks.js 反序列化正确构建数组对象,防止类型丢失
const Logger = require('../util/log')
const logger = new Logger(__filename)
const Block = require("./block");

class Blocks extends Array {
    // data:JSON解析的obj []
    static fromJson(data){
        // logger.log(`Blocks from JSON: ${JSON.stringify(data)}`);
        let blocks = new Blocks();
        data.forEach(element => {
            blocks.push(Block.fromJson(element))
        }); 
        return blocks;
    }
}
module.exports = Blocks