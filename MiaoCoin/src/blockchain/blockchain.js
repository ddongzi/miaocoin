const Block = require("./block")
const DB = require("../util/db")
const Blocks = require("./blocks")
const Transaction = require("./transaction")
const Transcations = require("./transactions")
const MiaoCrypto = require("../util/miaoCrypto")
const EventEmitter = require('events');
const { hexToBinary } = require("../util/util")

const BLOCKS_FILE = 'blocks.json'
const Transcations_FILE = 'transactions.json'
const BLOCK_GENERATION_INTERNAL = 10 // 10 seconds
const DIFFICULTY_ADJUSTMENT_INTERVAL = 10 // 10 blocks

class BlockChain {
    constructor(name) {
        this.transactionsDb = new DB('data/'+ Transcations_FILE)
        this.transactions = this.transactionsDb.read(Transcations, new Transcations())
        this.blocksDb = new DB('data/' + BLOCKS_FILE)
        this.blocks = this.blocksDb.read(Blocks,new Blocks()) // 读取blocks数组

        // 事件发射
        this.emitter = new EventEmitter()

        this.init()

    }

    init() {
        // Create from genius block if blockchain is empty.
        if (this.blocks.length === 0) {
            console.log("Blockchain is empty, creating from genesis block")
            this.blocks.push(this.createGeniusBlock())
            this.blocksDb.write(this.blocks)
        }

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


    generateNextBlock (data) {
        var previousBlock = this.getLastBlock()
        var nextIndex = previousBlock.index + 1
        var nextTimestamp = new Date().toUTCString()
        var difficulty = this.getDifficulty()

        let nouce = 0
        while (true) {
            let hash = Block.caculateHash(nextIndex, nextTimestamp, data, previousBlock.hash, difficulty, nouce)
            if (this.hasMatchesDifficulty(hash,difficulty)) {
                return new Block(nextIndex, nextTimestamp, difficulty, nouce, data, previousBlock.hash, hash)
            }
            nouce++
        }

        return newBlock;
        
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
            && new Date(newBlock.timestamp)  - 60 ? new Date()

    }

    getLastBlock() {
        return this.blocks[this.blocks.length - 1]
    }
    addBlock(newBlock) {
        if (this.checkBlock(newBlock, this.getLastBlock())) {
            newBlock.previoushash = this.getLastBlock().toHash()
            this.blocks.push(newBlock)
            this.blocksDb.write(this.blocks)
            console.info(`Block added ${newBlock.id}`)
        }
    }
    // 检查新来的区块是否符合要求
    checkBlock(newBlock, previousBlock) {
        if (previousBlock.index + 1!== newBlock.index) {
            console.error(`Invalid index. Expected ${previousBlock.index + 1}, got ${newBlock.index}`)
            return false
        }
        if (previousBlock.toHash()!== newBlock.previoushash) {
            console.error("Invalid previous hash")
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

    hasMatchesDifficulty(hash, difficulty) {
        const hashBinary = hexToBinary(hash)
        const prefix = '0'.repeat(difficulty)
        return hashBinary.startsWith(prefix)
    }

}

const miaoBlockChain = new BlockChain("miao")
const block1 = new Block(2,new Date().toUTCString(),"Miao Block")
miaoBlockChain.addBlock(block1)
const transaction = new Transaction()
transaction.id = MiaoCrypto.randomId()
transaction.inputs = [
    {
        "transaction": MiaoCrypto.randomId(),
        "index": 0,
        "address": MiaoCrypto.randomId(),
        "signature": MiaoCrypto.randomId()
    },
    {
        "transaction": MiaoCrypto.randomId(),
        "index": 1,
        "address": MiaoCrypto.randomId(),
        "signature": MiaoCrypto.randomId()
    }
]
transaction.outputs = [
    {
        "amount": 1,
        "address": MiaoCrypto.randomId()
    },
    {
        "amount": 20,
        "address": MiaoCrypto.randomId()
    }
]
transaction.hash = transaction.toHash()

miaoBlockChain.addTransaction(transaction)

module.exports = miaoBlockChain 
