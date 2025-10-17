const { Transaction } = require("../blockchain/transaction");
const Block = require("../blockchain/block");
const hexToBinary = require("../util/util");
const Transactions = require("../blockchain/transactions");
const Logger = require('../util/log')
const logger = new Logger(__filename)
// 1. 从 process.env 获取参数
const info = JSON.parse(process.env.WORKER_DATA);
logger.log(`[Child Process] Mine process param: ${JSON.stringify(info)}`);

// 通过挖矿产生区块
function generateNextBlockWithMine() {
  const coinBaseTx = Transaction.generateConinBaseTransaction(
    info.address,
    info.index
  );
  console.log(`mine process ${JSON.stringify(coinBaseTx)}`)
  const txs = Transactions.fromJson(JSON.parse(info.txs));
  logger.log(
    `[Mine process] Generating next block with ${JSON.stringify(
      coinBaseTx
    )} and ${JSON.stringify(txs)}`
  );
  const newBlock = generateNextBlock([coinBaseTx].concat(txs));
  return newBlock;
}
// 检测hash是否满足difficulty要求
function hasMatchesDifficulty(hash, difficulty) {
  const hashBinary = hexToBinary(hash);
  const prefix = "0".repeat(difficulty);
  return hashBinary.startsWith(prefix);
}
// 生成一个区块
function generateNextBlock(data) {
  return batchNouce(data);
}
function batchNouce(data) {
  var timestamp = new Date().toUTCString();
  var hash = "";
  let nouce = 0;
  let batchSize = 1000;
  // 处理一批nouce
  var newBlock = null;
  for (let i = 0; i < batchSize; i++) {
    hash = Block.caculateHash(
      info.index,
      timestamp,
      data,
      info.previousHash,
      info.difficulty,
      nouce
    );
    // logger.log(`[Mine process] hash ${hash}, nouce ${nouce}`);
    if (hasMatchesDifficulty(hash, info.difficulty)) {
      newBlock = new Block(
        info.index,
        timestamp,
        info.difficulty,
        nouce,
        data,
        info.previousHash,
        hash
      );
      logger.log(`[Mine process] Mined a new block! ${JSON.stringify(newBlock)}, hash: ${newBlock.toHash()}`);
      break;
    }
    nouce++;
  }
  if (!newBlock) {
    // 没找到，继续下一各batch
    logger.log(`[Mine process] batch over`);
    setImmediate(batchNouce);
  } else {
    return newBlock;
  }
}

function mine() {
  const now = new Date();
  logger.log(`[Mine process] Miner is mining...`);

  const newBlock = generateNextBlockWithMine();

  const finished = new Date();
  const timeDifference = finished.getTime() - now.getTime();

  // 转换为小时、分钟和秒
  const hours = Math.floor(timeDifference / (1000 * 60 * 60));
  const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);
  logger.log(`[Mine process] Miner finished.
        Cost time : ${hours}h ${minutes}m ${seconds}s. 
        Difficulty: ${newBlock.difficulty}, Nouce : ${newBlock.nouce}`);

  setTimeout(() => {
    // 发送区块给主进程
    process.send({ type: 'newBlock', newBlock });
    process.exit(0);
  }, 1000 * 10);
}

mine();
