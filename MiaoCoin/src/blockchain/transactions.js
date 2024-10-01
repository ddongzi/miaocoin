// Transactions.js 反序列化正确构建数组对象,防止类型丢失

const {Transaction} = require("./transaction");
const Logger = require('../util/log')
const logger = new Logger(__filename)
class Transactions extends Array {
    // data:JSON解析的obj []
    static fromJson(data){
        // logger.log(`Transactions from JSON: ${JSON.stringify(data)}`);  // 打印出反序列化前的数据
        if (!Array.isArray(data)) {
            console.error("Invalid Transactions data")
            return data; // 创世区块不是数组
        }
        let transactions = new Transactions();
        data.forEach(element => {
            transactions.push(Transaction.fromJson(element))
        }); 
        return transactions;
    }
}
module.exports = Transactions