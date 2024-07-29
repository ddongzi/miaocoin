const Transactions = require("./transactions");

class TransactionPool {
    constructor() {
        this.transactions = new Transactions()
        this.maxSize = 1; // 最多3个未确认的交易
    }
    add(transaction) {
        this.transactions.push(transaction)
    }
    getAll() {
        return this.transactions;
    }
    next() {
        return this.transactions.shift();
    }
    clear() {
        this.transactions = new Transactions();
    }
    size() {
        return this.transactions.length;
    }
    isFull() {
        return this.size() >= this.maxSize;
    }
}
module.exports = TransactionPool