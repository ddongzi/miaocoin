// Transactions.js 反序列化正确构建数组对象,防止类型丢失

const {Transaction} = require("./transaction");

class Transactions extends Array {
    // data:JSON解析的obj []
    static fromJson(data){
        let transactions = new Transactions();
        data.forEach(element => {
            transactions.push(Transaction.fromJson(element))
        }); 
        return transactions;
    }
}
module.exports = Transactions