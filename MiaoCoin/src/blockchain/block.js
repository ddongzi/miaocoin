// block.js
const MiaoCrypto = require('../util/miaoCrypto');
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
    async toHash() {

        return await Block.caculateHash(this.index, this.timestamp,this.data,
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
    /**
     * 
     * @param {*} index 
     * @param {*} timestamp 
     * @param {*} data 
     * @param {*} previoushash 
     * @param {*} difficulty 
     * @param {*} nouce 
     * @returns {string} hex encoded string
     */
    static async caculateHash(index,timestamp,data,previoushash,difficulty,nouce) {
        // console.log(`caculateHash ${index + previoushash + timestamp +difficulty + nouce + JSON.stringify(data)}`)
        const hashBuffer = await MiaoCrypto.hash(index + previoushash + timestamp +difficulty + nouce + JSON.stringify(data));
        return MiaoCrypto.arrayBufferToHex(hashBuffer)
    }
}
module.exports = Block;