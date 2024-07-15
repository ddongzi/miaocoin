const Block = require("./block")
const DB = require("../util/db")
const Blocks = require("./blocks")
const BLOCKS_FILE = 'blocks.json'

class BlockChain {
    constructor(name) {
        this.blocksDb = new DB('data/' + BLOCKS_FILE)
        this.blocks = this.blocksDb.read(Blocks,new Blocks()) // 读取blocks数组
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
    createGeniusBlock() {
        return new Block(
            0,
            new Date().toISOString(),
            'Genius Block',
            '0'
        )
    }

    getLastBlock() {
        return this.blocks[this.blocks.length - 1]
    }
    addBlock(newBlock) {
        if (this.checkBlock(newBlock, this.getLastBlock())) {
            newBlock.previoushash = this.getLastBlock().toHash()
            this.blocks.push(newBlock)
            this.blocksDb.write(this.blocks)
            console.info(`Block added ${JSON.stringify(newBlock)}`)
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
        return true
    }
}

const miao = new BlockChain("miao")
const block1 = new Block(2,new Date().toUTCString(),"Miao Block")
miao.addBlock(block1)
