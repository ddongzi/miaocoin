const {
  pathExists,
  readFileSync,
  writeFileSync,
  existsSync,
} = require("fs-extra");
const MiaoCrypto = require("../util/miaoCrypto");
const { MessageType } = require("../net/p2p");
const path = require("path");
const { Worker } = require("worker_threads");
const Block = require("../blockchain/block");
const Logger = require('../util/log')
const logger = new Logger(__filename)
// 每个节点上都有矿工角色。  负责签名产生区块
const DATA_PATH = "/home/dong/JSCODE/MiaoCoin/data/miner";
const PRIVATE_KEY_FILE = "/privatekey.pem";
const PUBLIC_KEY_FILE = "/publickey.pem";

class Miner {
  constructor(node, privateKey, publicKey) {
    this.privateKey = privateKey;
    this.publicKey = publicKey;
    this.address = MiaoCrypto.hash(this.publicKey)

    this.node = node;
    this.blockchain = node.blockchain;
    this.worker = null; // 挖矿线程
  }

  // 开始挖矿
  startMining() {
    if (this.worker) {
      logger.log("Miner is already mining.");
      return;
    }
    const previousBlock = this.blockchain.getLastBlock();
    const { index, hash } = previousBlock;

    const difficulty = this.blockchain.getDifficulty();
    // 从(脚本地址)文件创建一个新的worker线程
    this.worker = new Worker(path.resolve(__dirname, "./mineWorker.js"), {
      // 传入一些未确认交易
      workerData: {
        info: {
          txs: JSON.stringify(this.blockchain.pool.getAll()), 
          address: this.address,
          index: index + 1,
          previousHash: hash,
          difficulty: difficulty,
        },
      },
    });

    // 接受worker线程消息
    this.worker.on("message", (msg) => {
      if (msg.type === "newBlock") {
        logger.log(`[Miner] New block mined: ${JSON.stringify(msg.newBlock)}`);
        // 添加到链上， 更新utxouts
        const newBlock = Block.fromJson(msg.newBlock)
        const added = this.blockchain.addBlock(newBlock);
        if (added) {
          this.blockchain.updateUTxOutsFromTxs(newBlock.data);
        }
        // 向主线程广播新区块
        this.node.p2p.broadcast({
          type: MessageType.NEW_BLOCK,
          description: "new block",
          data: newBlock,
        });
        // 只有需要时候才要你挖
        //  todo : 消除状态，重新开挖
        // this.stopMining()
        // this.startMining();
        this.stopMining()
        // 
        logger.log(`clear pool .`)
        this.blockchain.pool.clear()
      }
    });

    this.worker.on("error", (error) => {
      console.error("Worker error:", error);
      this.worker = null; // 清理 Worker 实例
    });

    this.worker.on("exit", (code) => {
      logger.log(`Worker stopped with exit code ${code}`);
      this.worker = null; // 清理 Worker 实例
    });

    
    this.worker.postMessage("startMining");
  }

  // 停止挖矿
  stopMining() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }

  // 初始化加载 矿工密钥
  static  loadKeys() {
    // 读取私钥和公钥
    const privateKeyPath = DATA_PATH + PRIVATE_KEY_FILE;
    const publicKeyPath = DATA_PATH + PUBLIC_KEY_FILE;
    if (!existsSync(publicKeyPath) || !existsSync(privateKeyPath)) {
      const { privateKey, publicKey } =  MiaoCrypto.generateKeyPair();
      writeFileSync(publicKeyPath, publicKey);
      writeFileSync(privateKeyPath, privateKey);
    }
    const privateKey = readFileSync(privateKeyPath, "utf8");
    const publicKey = readFileSync(publicKeyPath, "utf8");
    return {privateKey, publicKey}
  }

  static  create(node) {
    const {privateKey, publicKey} =  Miner.loadKeys()

    const miner = new Miner(node,privateKey,publicKey);
    logger.log(`creating miner successfully.`);
    return miner;
  }
}

module.exports = Miner;
