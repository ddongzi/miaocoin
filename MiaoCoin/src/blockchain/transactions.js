// transcations.js 反序列化正确构建数组对象,防止类型丢失

const Transcation = require("./transaction");

class Transcations extends Array {
    // data:JSON解析的obj []
    static fromJson(data){
        let transactions = new Transcations();
        data.forEach(element => {
            transactions.push(Transcation.fromJson(element))
        }); 
        return transactions;
    }
}
module.exports = Transcations