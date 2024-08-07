const { parentPort, workerData } = require("worker_threads");
const { Transaction } = require("../blockchain/transaction");
const Block = require("../blockchain/block");
const hexToBinary = require("../util/util");
const Transactions = require("../blockchain/transactions");

const { info } = workerData;
console.log(`[Worker Thread] Mine worker param : ${info.difficulty}`);
// 通过挖矿产生区块
async function generateNextBlockWithMine() {
  const coinBaseTx = await Transaction.generateConinBaseTransaction(
    info.address,
    info.index
  );
  const txs = Transactions.fromJson(JSON.parse(info.txs));
  console.log(`[Worker Thread] Generating next block with ${JSON.stringify(coinBaseTx)} and ${JSON.stringify(txs)}`);
  const newBlock = await generateNextBlock([coinBaseTx].concat(txs))
  return newBlock
}
// 检测hash是否满足difficulty要求
function hasMatchesDifficulty(hash, difficulty) {
  const hashBinary = hexToBinary(hash);
  const prefix = "0".repeat(difficulty);
  return hashBinary.startsWith(prefix);
}
// 生成一个区块
async function  generateNextBlock(data) {
    return await batchNouce(data);
}
async function batchNouce(data) {
  var timestamp = new Date().toUTCString();
  var hash = "";
  let nouce = 0;
  let batchSize = 1000;
  // 处理一批nouce
  var newBlock = null;
  for (let i = 0; i < batchSize; i++) {
    hash = await Block.caculateHash(
      info.index,
      timestamp,
      data,
      info.previousHash,
      info.difficulty,
      nouce
    );
    // console.log(`[worker thread] hash ${hash}, nouce ${nouce}`);
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
      break;
    }
    nouce++;
  }
  if (!newBlock) {
    // 没找到，继续下一各batch
    console.log(`[Worker Thread] batch over`)
    setImmediate(batchNouce);
  } else {
    return newBlock
  }
}

function mine() {
  const now = new Date();
  console.log(`[Worker Thread] Miner is mining...`);

  generateNextBlockWithMine().then(newBlock => {

      const finished = new Date();
      const timeDifference = finished.getTime() - now.getTime();

      // 转换为小时、分钟和秒
      const hours = Math.floor(timeDifference / (1000 * 60 * 60));
      const minutes = Math.floor(
        (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
      );
      const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);
      console.log(`[Worker Thread] Miner finished.
        Cost time : ${hours}h ${minutes}m ${seconds}s. 
        Difficulty: ${newBlock.difficulty}, Nouce : ${newBlock.nouce}`);

      setTimeout(() => {
        parentPort.postMessage({ type: "newBlock", newBlock });
      }, 1000 * 10);
    }).catch((err) => {
      console.error(`[Worker Thread] Mining error: ${err.message}`);
    });
}

parentPort.on("message", (msg) => {
  if (msg === "startMining") {
    mine();
  }
});
