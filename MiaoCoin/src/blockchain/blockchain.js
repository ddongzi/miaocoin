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
        newBlock.previoushash = this.getLastBlock().toHash()
        this.blocks.push(newBlock)
        this.blocksDb.write(this.blocks)
        console.info(`Block added ${JSON.stringify(newBlock)}`)
    }
}

const miao = new BlockChain("miao")
const block1 = new Block(1,new Date().toUTCString(),"Miao Block")
miao.addBlock(block1)
