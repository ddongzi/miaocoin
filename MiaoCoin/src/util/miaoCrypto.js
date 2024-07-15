const {createHash, randomBytes} = require('crypto');

class MiaoCrypto {
    static hash(data) {
        const hash = createHash('sha256')
            .update(data)
            .digest('hex');
        return hash;
    }
    
    static randomId(size = 64) {
        return randomBytes(Math.floor(size / 2)).toString('hex');
    }
}
module.exports = MiaoCrypto