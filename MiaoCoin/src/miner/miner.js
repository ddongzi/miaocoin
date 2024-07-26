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

// 每个节点上都有矿工角色。  负责签名产生区块
const DATA_PATH = "/home/dong/JSCODE/MiaoCoin/data/miner";
const PRIVATE_KEY_FILE = "/privatekey.pem";
const PUBLIC_KEY_FILE = "/publickey.pem";

class Miner {
  constructor(node) {
    this.loadKeys();
    this.node = node;
    this.blockchain = node.blockchain;
    this.worker = null; // 挖矿线程
  }

  // 开始挖矿
  startMining() {
    if (this.worker) {
      console.log("Miner is already mining.");
      return;
    }
    const previousBlock = this.blockchain.getLastBlock();
    const { index, hash } = previousBlock;

    const difficulty = this.blockchain.getDifficulty();
    // 从(脚本地址)文件创建一个新的worker线程
    this.worker = new Worker(path.resolve(__dirname, "./mineWorker.js"), {
      workerData: {
        info: {
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
        console.log(`New block mined: ${msg.newBlock}`);
        // 添加到链上， 更新utxouts
        const newBlock = Block.fromJson(msg.newBlock)
        this.blockchain.addBlock(newBlock);
        this.blockchain.updateUTxOutsFromTxs(newBlock.data);

        // 向主线程广播新区块
        this.node.p2p.broadcast({
          type: MessageType.NEW_BLOCK,
          description: "new block",
          data: newBlock,
        });
        // todo : 消除状态，重新开挖
        this.stopMining()
        this.startMining();
      }
    });

    this.worker.on("error", (error) => {
      console.error("Worker error:", error);
      this.worker = null; // 清理 Worker 实例
    });

    this.worker.on("exit", (code) => {
      console.log(`Worker stopped with exit code ${code}`);
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
  loadKeys() {
    // 读取私钥和公钥
    const privateKeyPath = DATA_PATH + PRIVATE_KEY_FILE;
    const publicKeyPath = DATA_PATH + PUBLIC_KEY_FILE;
    if (!existsSync(publicKeyPath) || !existsSync(privateKeyPath)) {
      const { privateKey, publicKey } = MiaoCrypto.generateKeyPair();
      writeFileSync(publicKeyPath, publicKey);
      writeFileSync(privateKeyPath, privateKey);
    }
    this.privateKey = MiaoCrypto.pemToHex(readFileSync(privateKeyPath, "utf8"));
    this.publicKey = MiaoCrypto.pemToHex(readFileSync(publicKeyPath, "utf8"));
    this.address = this.publicKey;
    console.log(`Miner loaded keys, address: ${this.address}`);
  }
}

module.exports = Miner;
