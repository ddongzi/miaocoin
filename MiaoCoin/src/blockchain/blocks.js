// blocks.js 反序列化正确构建数组对象,防止类型丢失

const Block = require("./block");

class Blocks extends Array {
    // data:JSON解析的obj []
    static fromJson(data){
        console.log(`Blocks from JSON: ${data}`)
        let blocks = new Blocks();
        data.forEach(element => {
            blocks.push(Block.fromJson(element))
        }); 
        return blocks;
    }
}
module.exports = Blocks