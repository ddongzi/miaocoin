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

    static sign(data, privateKey) {
        const signer = crypto.createSign('SHA256');
        signer.update(data).end(); // 提供签名数据并结束输入
        return signer.sign(privateKey, 'hex');
    }
}
module.exports = MiaoCrypto