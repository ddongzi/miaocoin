const { existsSync, writeFile, writeFileSync, readFileSync } = require("fs-extra");
const {BASE_PATH} =  require("../config");
const MiaoCrypto = require("../util/miaoCrypto");
const {Transaction, TxInput,TxOutput,UTxOutput} = require("./transaction");

const PRIVATEKEY_FILE = BASE_PATH + 'src/'+ 'privkey.pem';
const PUBLICKEY_FILE = BASE_PATH +'src/'+ 'pubkey.pem';

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
            console.log(`Private or public key file not found, creating new ones... ${privateKey} ${publicKey}`);

        }
        this.privateKey = MiaoCrypto.pemToHex(readFileSync(PRIVATEKEY_FILE))
        this.publicKey = MiaoCrypto.pemToHex(readFileSync(PUBLICKEY_FILE))
    }

    static getBalance(address, unspentTxOutputs) {
        return unspentTxOutputs.filter(utxout => utxout.address === address)
            .map(utxout => utxout.amount)
            .sum()
    }
    // 从自己的余额中扣除amount给adress
    generateTransaction(receiverAdress, uTxOutputs,amount) {
        console.log(`===> ${this.publicKey} send ${amount} to ${receiverAdress}`)
        const tx = new Transaction()
        
        const myUTxOutputs = uTxOutputs.filter((utxout) => {
            return utxout.address === this.publicKey
        })
        // 找到够支付的utxout
        const needUTxOutputs = []
        let currentAmount = 0
        var leftAmount = 0
        for (let i = 0; i < myUTxOutputs.length; i++) {
            currentAmount += myUTxOutputs[i].amount
            needUTxOutputs.push(myUTxOutputs[i])
            if (currentAmount >= amount) {
                leftAmount = currentAmount - amount
                break
            }
        }
        // 将其转化未交易的输入
        const txInputs = needUTxOutputs.map(utxout => {
            const unsignedTxInput = new TxInput(utxout.txOutId, utxout.txOutIndex,'')
            return unsignedTxInput
        })

        // 输出
        const txOutputs =[]
        const txOutput = new TxOutput(receiverAdress, amount)
        if (leftAmount === 0) {
            txOutputs.push(txOutput)
        } else {
            const leftTxOutput = new TxOutput(this.publicKey, amount)
            txOutputs.concat([txOutput, leftTxOutput])
            return 
        }

        tx.inputs = txInputs.map((txin,index) => {
            txin.signatureTXInputs(this.privateKey,index)
            return txin
        })
        tx.outputs = txOutputs
        tx.id = Transaction.getTransactionId(tx)
        tx.hash = tx.toHash()
        return tx
    }

}
const myWallet = new Wallet('MyWallet')
module.exports = {Wallet,myWallet}
