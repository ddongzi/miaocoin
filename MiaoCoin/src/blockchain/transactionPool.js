
class TransactionPool {
    constructor() {
        this.transactions = []
    }
    addToTransaction(transaction) {
        this.transactions.push(transaction)
    }
}