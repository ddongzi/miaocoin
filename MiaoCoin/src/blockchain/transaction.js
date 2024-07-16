const { COINBASE_AMOUNT } = require('../config');
const MiaoCrypto = require('../util/miaoCrypto');
class TxInput {
    constructor(txOutId, txOutIndex,signature) {
        this.txOutId = txOutId // 与该输入相关的之前交易ID
        this.txOutIndex = txOutIndex // 表示在先前交易中，该输出的索引。
        this.signature = signature // 交易内容签名结果
    }
}
class TxOutput {
    constructor(address, amount) {
        this.address = address
        this.amount = amount
    }
}
class UTxOutput {
    constructor(txOutId, txOutIndex, address,amount) {
        this.txOutId = txOutId // 同交易ID
        this.txOutIndex = txOutIndex // 所在交易OUTPUT中的索引
        this.address = address
        this.amount = amount
    }
}
class Transaction {
    constructor() {
        this.id = null
        this.hash = null

        this.inputs= []
        this.outputs = []
        
    }

    // 生成交易ID
    static getTransactionId(transaction) {
        const inputContent = transaction.inputs.map((t) => t.txOutId + t.txOutIndex)
            .reduce((a,b) => a+b, '')
        const outputContent = transaction.outputs.map((t) =>t.address + t.amount)
            .reduce((a,b) => a+b,'')
        return MiaoCrypto.hash(inputContent + outputContent)
    }
    
    // 在未花费交易输出列表中 根据交易ID和index ，找到 utxout
    findUnspentTxOut(id,index,unspentTxOutputs) {
        return unspentTxOutputs.find((t) => t.txOutId === id && t.txOutIndex === index)
    }
    
    //  交易者对 inputs/index 进行签名
    signatureTXInputs(privateKey,index) {
        const dataToSign = this.id
        this.inputs[index].signature = MiaoCrypto.sign(dataToSign,privateKey)
        return this.inputs[index].signature
    }

    // 新的交易来更新 utxOuts
    updateUnspentTxOutput(utxOuts,transactions) {
        const newUnspentTxOutputs = transactions.map((t,index) => {
            return new UTxOutput(t.id, index, t.outputs[index].address, t.outputs[index].amount)
        }).reduce((a,b) => a.concat(b), []);
        const consumedTxOutputs = transactions.map((t) => {
            return new UTxOutput(t.txOutId, t.txOutIndex, '',0)
        })
        const resultingUnspentTxOuts = utxOuts.filter((utxout) => {
            return !this.findUnspentTxOut(utxout.id, utxout.index, consumedTxOutputs) // 保留没有被消费的
        }).concat(newUnspentTxOutputs);
    }

    // 交易有效性验证
    isValidTransactionStructure(transaction) {
        if (typeof transaction.id !== 'string') {
            console.error("Invalid transaction ID")
            return false
        }
    }

    isValidTransaction(transaction) {
        if (this.getTransactionId(transaction) !== transaction.id) {
            console.error("Invalid transaction ID")
            return false
        }
    }

    toHash() {
        return MiaoCrypto.hash(JSON.stringify(this.id + this.hash + JSON.stringify(this.data)))
    }
    static fromJson(data) {
        let tx = new Transaction()
        Object.keys(data).forEach(key => {
            tx[key] = data[key]
        })
        tx.hash = tx.toHash()
        return tx
    }

    // 地址验证
    static isValidAddress(address) {
        return true
    }

    // 生成最初交易
    static generateConinBaseTransaction(address,blockIndex) {
        const t = new Transaction()
        const txIn = new TxInput();
        txIn.signature = '';
        txIn.txOutId = '';
        txIn.txOutIndex = blockIndex;
    
        t.inputs = [txIn];
        t.outputs = [new TxOutput(address, COINBASE_AMOUNT)];
        t.id = Transaction.getTransactionId(t);
        console.log(`Coinbase transaction created. ${JSON.stringify(t)}`);
        return t;
    }
}
module.exports = {Transaction, TxInput, TxOutput, UTxOutput}