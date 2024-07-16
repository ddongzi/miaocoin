const Block = require("./block")
const DB = require("../util/db")
const Blocks = require("./blocks")
const Transaction = require("./transaction")
const Transcations = require("./transactions")
const MiaoCrypto = require("../util/miaoCrypto")
const EventEmitter = require('events');

const BLOCKS_FILE = 'blocks.json'
const Transcations_FILE = 'transactions.json'

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
    generateNextBlock (data) {
        var previousBlock = this.getLastBlock()
        var nextIndex = previousBlock.index + 1
        var nextTimestamp = new Date().toUTCString()
        var newBlock = new Block(nextIndex, nextTimestamp, data)
        newBlock.hash = newBlock.toHash()
        return newBlock;
        
    }
    createGeniusBlock() {
        return new Block(
            0,
            new Date().toISOString(),
            'Genius Block',
            '0',
            "aaaaaaaaaaaa"
        )
    }

    isValidBlockStructure(block) {
        return typeof block.index === 'number' &&
            typeof block.timestamp ==='string' &&
            typeof block.data ==='string' &&
            typeof block.previoushash ==='string' &&
            typeof block.hash ==='string'
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
