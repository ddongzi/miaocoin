const MiaoCrypto = require('../util/miaoCrypto');
class Transcation {
    constructor() {
        this.id = null
        this.hash = null
        this.data = {
            inputs :[],
            outputs : []
        }
    }
    toHash() {
        return MiaoCrypto.hash(JSON.stringify(this.id + this.hash + JSON.stringify(this.data)))
    }
    static fromJson(data) {
        let transcation = new Transcation()
        Object.keys(data).forEach(key => {
            transcation[key] = data[key]
        })
        transcation.hash = transcation.toHash()
        return transcation
    }
}
module.exports = Transcation