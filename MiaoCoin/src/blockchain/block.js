// block.js
const MiaoCrypto = require('../util/miaoCrypto');
class Block{
    constructor(index, timestamp, data,previoushash = "") {
        this.index = index;
        this.previoushash = previoushash;
        this.timestamp = timestamp;
        this.data = data;
    }
    toHash() {
        return MiaoCrypto.hash(this.index + this.previoushash + this.timestamp + JSON.stringify(this.data));
    }

    static fromJson(data) {
        let block = new Block();
        Object.keys(data).forEach(key => {
            block[key] = data[key];
        })
        return block;
    }
}
module.exports = Block;