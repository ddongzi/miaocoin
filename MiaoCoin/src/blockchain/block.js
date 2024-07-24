// block.js
const MiaoCrypto = require('../util/miaoCrypto');
const Transaction = require('./transaction');
class Block{
    constructor(index, timestamp, difficulty = 1, nouce = 1, data,previoushash = "",hash) {
        this.index = index;
        this.previoushash = previoushash;
        this.timestamp = timestamp;
        this.data = data; // transactions data
        this.hash = hash;
        this.difficulty = difficulty;
        this.nouce = nouce
        console.log(`Block constructor ${JSON.stringify(this)}`);
    }
    toHash() {
        return Block.caculateHash(this.index, this.timestamp,JSON.stringify(this.data),
            this.previoushash, this.difficulty, this.nouce
        )
    }

    static fromJson(data) {
        let block = new Block();
        Object.keys(data).forEach(key => {
            if (key === 'transactions' && data[key]) {
                block[key] = Transaction.fromJson(data[key])
            } else {
                block[key] = data[key];
            }
        })
        return block;
    }
    static caculateHash(index,timestamp,data,previoushash,difficulty,nouce) {
        
        return MiaoCrypto.hash(index + previoushash + timestamp +difficulty + nouce + JSON.stringify(this.data));

    }
}
module.exports = Block;