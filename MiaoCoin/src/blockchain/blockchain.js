const Block = require("./block")
const DB = require("../util/db")
const Blocks = require("./blocks")
const {Transaction, UTxOutput, TxInput, TxOutput} = require("./transaction")
const Transactions = require("./transactions")
const MiaoCrypto = require("../util/miaoCrypto")
const EventEmitter = require('events');
const  hexToBinary  = require("../util/util")
const {BASE_PATH} = require("../config")
const { MessageType } = require("../net/p2p")

const BLOCKS_FILE = "/blocks.json";
const Transactions_FILE = "/transactions.json"
const UTXOUTS_FILE = "/utxouts.json"

const BLOCK_GENERATION_INTERNAL = 3 // 10 seconds
const DIFFICULTY_ADJUSTMENT_INTERVAL = 3 // 10 blocks

const DATA_PATH = '/home/dong/JSCODE/MiaoCoin/data'
class BlockChain {
    // 每个节点都有一份区块链副本，
    constructor(node) {

        this.transactionsDb = new DB(DATA_PATH + Transactions_FILE)
        this.transactions = this.transactionsDb.read(Transactions, new Transactions())
        this.blocksDb = new DB(DATA_PATH + BLOCKS_FILE)
        this.blocks = this.blocksDb.read(Blocks,new Blocks()) // 读取blocks数组
        this.uTxoutsDb = new DB(DATA_PATH + UTXOUTS_FILE)
        this.uTxouts = this.uTxoutsDb.read(null,[])
        this.pool = []
        // 事件发射
        this.emitter = new EventEmitter()
        this.init()

        this.node = node

    }

    // 初始节点使用
    init() {
        // TODO: 只有初始节点需要初始化，其他节点向peer同步
        console.log("#0 init blockchain..")
        // Create from genius block if blockchain is empty.
        if (this.blocks.length === 0) {
            console.log("Blockchain is empty, creating from genesis block")
            this.blocks.push(this.createGeniusBlock())
            this.blocksDb.write(this.blocks)
        }

    }

    // 更新Blocks，以及json
    updateBlocks(newBlocks) {
        console.log(`update blocks ${JSON.stringify(newBlocks)}}`)
        this.blocks = newBlocks
        this.blocksDb.write(this.blocks)
    }

    // 从同步数据来进行初始化
    updateBlockchainFromSync(data) {
        console.log(`update blockchain from sync ${JSON.stringify(data)}}`)
        // 如果同步失败，就自己初始化
        this.updateBlocks(data.blocks)
    }

    getDifficulty() {
        const lastBlock = this.getLastBlock()
        if (lastBlock.index % DIFFICULTY_ADJUSTMENT_INTERVAL === 0 && lastBlock.index !== 0) {
            return this.getAdjustedDifficulty()
        }
        return this.getLastBlock().difficulty
    }
    getAdjustedDifficulty() {
        const prevAdjustedBlock = this.blocks[this.blocks.length - DIFFICULTY_ADJUSTMENT_INTERVAL]
        const timeExpected = BLOCK_GENERATION_INTERNAL * DIFFICULTY_ADJUSTMENT_INTERVAL
        const timeTaken = new Date(this.getLastBlock().timestamp) - new Date(prevAdjustedBlock.timestamp)
        if (timeTaken > timeExpected/2) {
            return prevAdjustedBlock.difficulty + 1
        } else if (timeTaken > timeExpected * 2) {
            return prevAdjustedBlock.difficulty - 1;
        } else {
            return prevAdjustedBlock.difficulty;
        }
    }
    // 1. 是否为空
    isValidBlockChain() {
        if (this.blocks.length === 0) {
            return false
        }
    }

    // 生成一个块 并加入链上
    generateNextBlock (data) {
        var previousBlock = this.getLastBlock()
        var nextIndex = previousBlock.index + 1
        var nextTimestamp = new Date().toUTCString()
        var difficulty = this.getDifficulty()
        var hash = ""
        let nouce = 0
        while (true) {
            hash = Block.caculateHash(nextIndex, nextTimestamp, data, previousBlock.hash, difficulty, nouce)
            if (this.hasMatchesDifficulty(hash,difficulty)) {
                break
            }
            nouce++
        }
        const newBlock = new Block(nextIndex, nextTimestamp, difficulty, nouce, data, previousBlock.hash, hash)
        this.addBlock(newBlock)
        return newBlock
        
    }
    createGeniusBlock() {
        let index = 0
        let timestamp = new Date().toUTCString()
        let difficulty = 1
        let nouce = 0
        let data = "Genesis Block"
        let previoushash = '0000000000000000'
        let hash = Block.caculateHash(index, timestamp, data, previoushash, difficulty, nouce)
        return new Block(index, timestamp, difficulty, nouce, data, previoushash, hash)
    }

    isValidBlockStructure(block) {
        return typeof block.index === 'number' &&
            typeof block.timestamp ==='string' &&
            typeof block.data ==='string' &&
            typeof block.previoushash ==='string' &&
            typeof block.hash ==='string'
    }
    isValidBlockChain(chain) {
        for (var i = 1; i < chain.blocks.length; i++) {
            if (!this.checkBlock(chain.blocks[i], chain.blocks[i - 1])) {
                console.error("Blockchain is not valid")
                return false
            }
        }
        return true
    }
    isValidTimeStamp(newBlock, previousBlock) {
        return new Date(newBlock.timestamp) - 60 > new Date(previousBlock.timestamp) 
            && new Date(newBlock.timestamp)  - 60 > new Date()

    }

    getLastBlock() {
        return this.blocks[this.blocks.length - 1]
    }
    // 将一个block加入链
    addBlock(newBlock) {
        // console.log(`add block ${newBlock.index}`)
        if (this.checkBlock(newBlock, this.getLastBlock())) {
            // console.log(`adding block ${JSON.stringify(newBlock)}`)

            this.blocks.push(newBlock)
            this.blocksDb.write(this.blocks)
            console.info(`Blockchain  added Block#${newBlock.index}`)
        }
    }
    // 检查新来的区块是否符合要求
    checkBlock(newBlock, previousBlock) {
        if (previousBlock.index + 1!== newBlock.index) {
            console.error(`CheckBlock failed :Invalid index. Expected ${previousBlock.index + 1}, got ${newBlock.index}`)
            return false
        }
        if (previousBlock.toHash() !== newBlock.previoushash) {
            console.log(previousBlock.toHash() !== newBlock.previoushash)
            console.error(`Invalid previous hash, \n${newBlock.previoushash}\n${previousBlock.toHash()}`)
            return false
        }
        if (newBlock.toHash()!== newBlock.hash) {
            return false
        }
        return true
    }

    addTransaction(newTransaction, emit = true) {

        this.transactions.push(newTransaction);
        this.transactionsDb.write(this.transactions);

        console.info(`Transaction added: ${newTransaction.id}`);
        if (emit) this.emitter.emit('transactionAdded', newTransaction);

        return newTransaction;
    }

    // 链冲突，Choosing the longest chain
    replaceChain (newBlocks) {
        if (newBlocks.length <= this.blocks.length) {
            console.error("Received blockchain is not longer than current blockchain.")
        } 
    }
    // 检测hash是否满足difficulty要求
    hasMatchesDifficulty(hash, difficulty) {
        const hashBinary = hexToBinary(hash)
        const prefix = '0'.repeat(difficulty)
        return hashBinary.startsWith(prefix)
    }

    // 通过一笔交易生成一个块:
    generateNextBlockWithTransaction(senderAddress, receiverAdress, amount) {
        console.log(`Generating Next Block kWith Transaction.....${this.uTxouts.length}`)
        if (!Transaction.isValidAddress(address)) {
            console.error("Invalid address");
        }
        const coinBaseTx = Transaction.generateConinBaseTransaction(this.node.miner.address, this.getLastBlock().index + 1)
        this.updateUnspentTxOutputs([coinBaseTx])
        const tx = this.generateTransaction(address,amount, this.uTxouts, this.pool)
        this.updateUnspentTxOutputs([tx])
        const blockData = [coinBaseTx, tx];
        const newBlock = this.generateNextBlock(blockData)
        return newBlock
    }
    // 通过未确认交易池 生成一个块
    generateNextBlockWithPool() {
        const coinBaseTx = Transaction.generateConinBaseTransaction( this.getLastBlock().index + 1)
        console.log(`generateNextBlockWithPool....${JSON.stringify([coinBaseTx,this.pool])}`)
        this.updateUnspentTxOutputs([coinBaseTx].concat(this.pool))
        return this.generateNextBlock([coinBaseTx].concat(this.pool))
    }

    // 生成一笔交易 放入池子
    generateTransactionToPool(address,amount) {
        console.log(`Generating transaction to pool, utxouts ${this.uTxouts} ,pool ${this.pool}`)
        const tx = generateTransaction(address,amount,this.uTxouts,this.pool);
        this.addToTransactionPool(tx)
        return tx;
    }


    // 新的交易来更新 utxOuts
    updateUnspentTxOutputs(transactions) {
        console.log(`updateUnspentTxOutputs ... `)
        const newUnspentTxOutputs = transactions.map((t) => {
            return t.outputs.map((txout,index) => new UTxOutput(t.id,index, txout.address,txout.amount))
        }).reduce((a,b) => a.concat(b), []);
        const consumedTxOutputs = transactions.map((t) => t.inputs)
            .reduce((a, b) => a.concat(b), [])
            .map((txin) => new UTxOutput(txin.txOutId, txin.txOutIndex,'',0))

        const resultingUnspentTxOuts = this.uTxouts.filter((utxout) => {
            !consumedTxOutputs.find((t) => t.txOutId === utxout.txOutId && t.txOutIndex === utxout.txOutIndex)
        }).concat(newUnspentTxOutputs)


        // console.log(`newUnspentTxOutputs: ${JSON.stringify(newUnspentTxOutputs)}\n consumedTxOutputs: ${JSON.stringify(consumedTxOutputs)}`)
        // console.log(`Old uxOutputs: ${JSON.stringify(this.uTxouts)}\n New uxOutputs: ${JSON.stringify(resultingUnspentTxOuts)}`)
        this.uTxouts = resultingUnspentTxOuts
        this.uTxoutsDb.write(this.uTxouts)
    }

    // shan
    processTransactions(transactions) {
        // TODO:验证是否有效交易。。
        return this.updateUnspentTxOutputs(transactions);
    }

    // 尝试将tx加入池子
    addToTransactionPool(tx) {
        if (this.isValidTxForPool(tx)) {
            this.pool.push(tx)
            return tx
        }
        return {"tx":"error"}
    }

    // 未确认交易 加入 POOL之前校验: 1. 不能重复：此次Input的钱不能出现在之前的池子input里面(一份钱不能用两次)
    isValidTxForPool(targetTx) {
        let res = true
        this.pool.forEach(tx => {
            tx.inputs.forEach(txInput => {
                const find = targetTx.inputs.find(targetTxInput => 
                    targetTxInput.txOutId === txInput.txOutId &&
                    targetTxInput.txOutIndex === txInput.txOutIndex
                )
                if (find) {
                    res = false
                }
            })
        })
        console.log(`check valid tx for pool ${res}`)
        return res;
    }
    getBlockByHash(hash) {
        return this.blocks.filter(block => block.hash === hash)
    }
    getTransactionByID(id) {
        return this.blocks.map(block => block.data)
            .flat()
            .filter(tx => tx.id === id)
    }

    getTransactionHistory(address) {
        return this.blocks.map(block => block.data)
           .flat()
           .filter(tx => tx.outputs.find(output => output.address === address))
           .map(tx => ({
                txId: tx.id,
                amount: tx.outputs.find(output => output.address === address).amount,
                timestamp: tx.timestamp
            }))
    }

    // 获取某个地址余额
    getBalance(address) {
        // console.log(`getBalance: ${address}, ${JSON.stringify(unspentTxOutputs)}`)
        return this.uTxouts.filter(utxout => utxout.address === address)
            .map(utxout => utxout.amount)
            .reduce((sum, amount) => sum + amount, 0);
    }

    // 生成一笔交易（未确认交易：不添加到区块链）：从senderAddress的余额中扣除amount给receiverAdress。
    generateTransactionWithoutSignature(senderAddress,receiverAdress,amount, uTxOutputs,pool) {
        // console.log(`===> ${this.publicKey} send ${amount} to ${receiverAdress}`)
        
        console.log(`generateTransaction......`)
        
        const tx = new Transaction()
        
        const myUTxOutputs = uTxOutputs.filter((utxout) => {
            return utxout.address === senderAddress
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
    // 返回区块链同步信息
    getBlockchainSyncData() {
        console.log(`get blockchain sync data....`)
        return {
            'type':MessageType.RESPONSE_SYNC_BLOCKCHAIN,
            'description':'blockchain sync data',
            'data':{
                'blocks':this.blocks
            }
        }
    }

}

module.exports = BlockChain 
