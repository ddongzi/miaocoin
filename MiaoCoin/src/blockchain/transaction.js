const { COINBASE_AMOUNT } = require("../config");
const MiaoCrypto = require("../util/miaoCrypto");
class TxInput {
  constructor(txOutId, txOutIndex, signature) {
    this.txOutId = txOutId; // 与该输入相关的之前交易ID
    this.txOutIndex = txOutIndex; // 表示在先前交易中，该输出的索引。
    this.signature = signature; // 交易内容签名结果
  }
}
class TxOutput {
  constructor(address, amount) {
    this.address = address;
    this.amount = amount;
  }
}
class UTxOutput {
  constructor(txOutId, txOutIndex, address, amount) {
    this.txOutId = txOutId; // 同交易ID
    this.txOutIndex = txOutIndex; // 所在交易OUTPUT中的索引
    this.address = address;
    this.amount = amount;
  }
}
class Transaction {
  constructor() {
    this.id = null;
    this.hash = null;

    this.publicKey = null;

    this.inputs = [];
    this.outputs = [];
  }

  // 生成交易ID
  static getTransactionId(transaction) {
    const inputContent = transaction.inputs
      .map((t) => t.txOutId + t.txOutIndex)
      .reduce((a, b) => a + b, "");
    const outputContent = transaction.outputs
      .map((t) => t.address + t.amount)
      .reduce((a, b) => a + b, "");

    // console.log("Input Content:", inputContent);
    // console.log("Output Content:", outputContent);
    // console.log("Concatenated Content:", inputContent + outputContent);
    return MiaoCrypto.hash(inputContent + outputContent);
  }

  // 在未花费交易输出列表中 根据交易ID和index ，找到 utxout
  static findUnspentTxOut(id, index, unspentTxOutputs) {
    return unspentTxOutputs.find(
      (t) => t.txOutId === id && t.txOutIndex === index
    );
  }

  //  交易者对 inputs/index 进行签名
  signatureTXInputs(privateKey, index) {
    const dataToSign = this.id;
    this.inputs[index].signature = MiaoCrypto.sign(dataToSign, privateKey);
    return this.inputs[index].signature;
  }

  // 交易有效性验证
  isValidTransactionStructure(transaction) {
    if (typeof transaction.id !== "string") {
      console.error("Invalid transaction ID");
      return false;
    }
  }

  isValidTransaction(transaction) {
    if (this.getTransactionId(transaction) !== transaction.id) {
      console.error("Invalid transaction ID");
      return false;
    }
  }

  toHash() {
    return MiaoCrypto.hash(
      JSON.stringify(this.id + this.hash + JSON.stringify(this.data))
    );
  }
  static fromJson(data) {
    // console.log(`Transaction from JSON: ${JSON.stringify(data)}`);  // 打印出反序列化前的数据
    let tx = new Transaction();
    Object.keys(data).forEach((key) => {
      tx[key] = data[key];
    });
    tx.hash = tx.toHash();
    return tx;
  }

  // 地址验证
  static isValidAddress(address) {
    return true;
  }

  // 生成最初交易
  static generateConinBaseTransaction(minerAddress, blockIndex) {
    const t = new Transaction();
    const txIn = new TxInput();
    txIn.signature = "";
    txIn.txOutId = "";
    txIn.txOutIndex = blockIndex;

    t.inputs = [txIn];
    t.outputs = [new TxOutput(minerAddress, COINBASE_AMOUNT)];
    t.id = Transaction.getTransactionId(t);
    // console.log(`Coinbase transaction created.... ${JSON.stringify(t)}`);

    return t;
  }
}
module.exports = { Transaction, TxInput, TxOutput, UTxOutput };
