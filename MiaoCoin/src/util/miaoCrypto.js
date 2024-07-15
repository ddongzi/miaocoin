const {createHash} = require('crypto');

class MiaoCrypto {
    static hash(data) {
        const hash = createHash('sha256')
            .update(data)
            .digest('hex');
        return hash;
    }
}
module.exports = MiaoCrypto