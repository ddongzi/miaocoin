const {
  pathExists,
  readFileSync,
  writeFileSync,
  existsSync,
} = require("fs-extra");
const MiaoCrypto = require("../util/miaoCrypto");
const { MessageType } = require("../net/p2p");

// 每个节点上都有矿工角色。  负责签名产生区块
const DATA_PATH = "/home/dong/JSCODE/MiaoCoin/data/miner";
const PRIVATE_KEY_FILE = "/privatekey.pem";
const PUBLIC_KEY_FILE = "/publickey.pem";

class Miner {
  constructor(node) {
    this.loadKeys();
    this.node = node;
    this.init();
  }
  init() {}
  // 主动定时1分支去请求产生区块
  mine() {
    while (1) {
        const now = new Date();
        console.log(`Miner is mining...`);
        const newBlock = this.node.blockchain.generateNextBlockWithMine();
        const finished = new Date();
        const timeDifference = finished.getTime() - now.getTime();
    
        // 转换为小时、分钟和秒
        const hours = Math.floor(timeDifference / (1000 * 60 * 60));
        const minutes = Math.floor(
          (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);
    
        console.log(`Miner finished.
            Cost time : ${hours}h ${minutes}m ${seconds}s. 
            Difficulty: ${newBlock.difficulty}, Nouce : ${newBlock.nouce}`
        );
    
        // 广播
        this.node.p2p.broadcast({
          type: MessageType.NEW_BLOCK,
          description: "new block",
          data: newBlock,
        });
        ( async ()=>{
            await new Promise(resolve => setTimeout(resolve, 1000 * 10));
        })
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
