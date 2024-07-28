// block.js
const MiaoCrypto = require('../util/myCrypto');
const Transaction = require('./transaction');
const Transactions = require('./transactions');
class Block{
    constructor(index, timestamp, difficulty = 1, nouce = 1, data,previoushash = "",hash) {
        this.index = index;
        this.previoushash = previoushash;
        this.timestamp = timestamp;
        this.data = data; // transactions data
        this.hash = hash;
        this.difficulty = difficulty;
        this.nouce = nouce
        // console.log(`Block constructor ${JSON.stringify(this)}`);
    }
    toHash() {

        return Block.caculateHash(this.index, this.timestamp,this.data,
            this.previoushash, this.difficulty, this.nouce
        )
    }

    // 传入JSON object 
    static fromJson(blockJsonObj) {
        // console.log(`Block from JSON: ${JSON.stringify(blockJsonObj)}`);
        let block = new Block();
        Object.keys(blockJsonObj).forEach(key => {
            if (key === 'data' && blockJsonObj[key]) {
                block[key] = Transactions.fromJson(blockJsonObj[key])
            } else {
                block[key] = blockJsonObj[key];
            }
        })
        return block;
    }
    static caculateHash(index,timestamp,data,previoushash,difficulty,nouce) {
        
        return MiaoCrypto.hash(index + previoushash + timestamp +difficulty + nouce + JSON.stringify(this.data));

    }
}
module.exports = Block;