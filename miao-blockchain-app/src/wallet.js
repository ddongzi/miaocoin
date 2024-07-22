const { existsSync, writeFile, writeFileSync, readFileSync } = require("fs-extra");
const MiaoCrypto = require("../../MiaoCoin/src/util/miaoCrypto");
const {Transaction, TxInput,TxOutput,UTxOutput} = require("../../MiaoCoin/src/blockchain/transaction");
const { WALLET_PATH } = require("../../MiaoCoin/src/config");

const PRIVATEKEY_FILE = WALLET_PATH + '/privkey.pem';
const PUBLICKEY_FILE = WALLET_PATH + '/pubkey.pem';

class Wallet {
    constructor(name) {
        this.name = name
        this.init()
    }

    init() {
        if (!existsSync(PRIVATEKEY_FILE) || !existsSync(PUBLICKEY_FILE)) {
            const {privateKey, publicKey} = MiaoCrypto.generateKeyPair();
            writeFileSync(PRIVATEKEY_FILE, privateKey)
            writeFileSync(PUBLICKEY_FILE, publicKey)
            console.log(`Private or public key file not found, creating new ones...`);

        }
        this.privateKey = readFileSync(PRIVATEKEY_FILE)
        this.publicKey = readFileSync(PUBLICKEY_FILE)
        this.address = MiaoCrypto.pemToHex(this.publicKey)
    }



}
// 固定钱包
const myWallet = new Wallet('MyWallet')
module.exports = {Wallet,myWallet}
