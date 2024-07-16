// block.js
const MiaoCrypto = require('../util/miaoCrypto');
const Transcation = require('./transaction');
class Block{
    constructor(index, timestamp, difficulty = 1, nouce = 1, data,previoushash = "",hash) {
        this.index = index;
        this.previoushash = previoushash;
        this.timestamp = timestamp;
        this.data = data;
        this.hash = hash;
        this.difficulty = difficulty;
        this.nouce = nouce
    }
    toHash() {
        return MiaoCrypto.hash(this.index + this.previoushash + this.timestamp + JSON.stringify(this.data));
    }

    static fromJson(data) {
        let block = new Block();
        Object.keys(data).forEach(key => {
            if (key === 'transactions' && data[key]) {
                block[key] = Transcation.fromJson(data[key])
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