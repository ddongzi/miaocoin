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
            console.log(`Private or public key file not found, creating new ones...`);

        }
        this.privateKey = readFileSync(PRIVATEKEY_FILE)
        this.publicKey = readFileSync(PUBLICKEY_FILE)
        this.address = MiaoCrypto.pemToHex(this.publicKey)
    }

    static getBalance(address, unspentTxOutputs) {
        return unspentTxOutputs.filter(utxout => utxout.address === address)
            .map(utxout => utxout.amount)
            .sum()
    }
    // 生成一笔交易（未确认交易：不添加到区块链）：从自己的余额中扣除amount给adress。
    generateTransaction(receiverAdress,amount, uTxOutputs,pool) {
        // console.log(`===> ${this.publicKey} send ${amount} to ${receiverAdress}`)
        
        console.log(`generateTransaction......`)
        
        const tx = new Transaction()
        
        const myUTxOutputs = uTxOutputs.filter((utxout) => {
            return utxout.address === this.address
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
        // console.log(`找到够支付的utxout, ${leftAmount}, NEED : ${JSON.stringify(needUTxOutputs)}}`)
        // 将其转化未交易的输入
        const txInputs = needUTxOutputs.map(utxout => {
            const unsignedTxInput = new TxInput(utxout.txOutId, utxout.txOutIndex,'')
            return unsignedTxInput
        })

        // console.log(`将其转化未交易的输入,  ${JSON.stringify(txInputs)}}`)

        // 输出
        const txOutputs =[]
        const txOutput = new TxOutput(receiverAdress, amount)
        if (leftAmount === 0) {
            txOutputs.push(txOutput)
        } else {
            const leftTxOutput = new TxOutput(this.address, leftAmount)
            txOutputs.push(txOutput)
            txOutputs.push(leftTxOutput)

        }
        //console.log(`输出,  ${JSON.stringify(txOutputs)}`)
        tx.id = Transaction.getTransactionId(tx)
        tx.inputs = txInputs
        tx.inputs = txInputs.map((txin,index) => {
            tx.signatureTXInputs(this.privateKey,index)
            return txin
        })
        tx.outputs = txOutputs
        tx.hash = tx.toHash()
        return tx
    }

}
// 固定钱包
const myWallet = new Wallet('MyWallet')
module.exports = {Wallet,myWallet}
