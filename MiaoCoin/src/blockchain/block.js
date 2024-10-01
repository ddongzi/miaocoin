// block.js
const MiaoCrypto = require('../util/miaoCrypto');
const Transaction = require('./transaction');
const Transactions = require('./transactions');
const Logger = require('../util/log')
const logger = new Logger(__filename)

class Block{
    constructor(index, timestamp, difficulty = 1, nouce = 1, data,previoushash = "",hash) {
        this.index = index;
        this.previoushash = previoushash;
        this.timestamp = timestamp;
        this.data = data; // transactions data
        this.hash = hash;
        this.difficulty = difficulty;
        this.nouce = nouce
        // logger.log(`Block constructor ${JSON.stringify(this)}`);
    }


    // 传入JSON object 
    static fromJson(blockJsonObj) {
        let block = new Block();
        Object.keys(blockJsonObj).forEach(key => {
            if (key === 'data' && blockJsonObj[key]) {
                block[key] = Transactions.fromJson(blockJsonObj[key])
            } else {
                block[key] = blockJsonObj[key];
            }
        })
        // logger.log(`[Block] Block from JSON: \n
        //     Before:${JSON.stringify(blockJsonObj)}\n
        //     After:${JSON.stringify(block)}`);

        return block;
    }
    /**
     * 
     * @param {*} index 
     * @param {*} timestamp 
     * @param {*} data 
     * @param {*} previoushash 
     * @param {*} difficulty 
     * @param {*} nouce 
     * @returns {string} HASH
     */
    static  caculateHash(index,timestamp,data,previoushash,difficulty,nouce) {
        // logger.log(`caculateHash ${index + previoushash + timestamp +difficulty + nouce + JSON.stringify(data)}`)
        return  MiaoCrypto.hash(index + previoushash + timestamp +difficulty + nouce + JSON.stringify(data));
         
    }
    toHash() {
        return  Block.caculateHash(this.index, this.timestamp,this.data,
            this.previoushash, this.difficulty, this.nouce
        )
    }
}
module.exports = Block;