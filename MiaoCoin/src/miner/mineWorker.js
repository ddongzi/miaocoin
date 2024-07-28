const { parentPort, workerData } = require("worker_threads");
const { Transaction } = require("../blockchain/transaction");
const Block = require("../blockchain/block");
const hexToBinary = require("../util/util");
const Transactions = require("../blockchain/transactions");

const { info } = workerData;
console.log(`[Worker Thread] Mine worker param : ${info.difficulty}`);
// 通过挖矿产生区块
function generateNextBlockWithMine(callback) {
  const coinBaseTx = Transaction.generateConinBaseTransaction(
    info.address,
    info.index
  );
  const txs = Transactions.fromJson(JSON.parse(info.txs));
  console.log(`Generating next block with ${JSON.stringify(coinBaseTx)} and ${JSON.stringify(txs)}`);
  generateNextBlock([coinBaseTx].concat(txs))
    .then((newBlock) => {
      callback(null, newBlock);
    })
    .catch((err) => {
      console.error(`[Worker Thread]generateNextBlock failed: ${err}`);
      callback(err, null);
    });
}
// 检测hash是否满足difficulty要求
function hasMatchesDifficulty(hash, difficulty) {
  const hashBinary = hexToBinary(hash);
  const prefix = "0".repeat(difficulty);
  return hashBinary.startsWith(prefix);
}
// 生成一个区块
function generateNextBlock(data) {
  return new Promise(function (resolve, reject) {
    var timestamp = new Date().toUTCString();
    var hash = "";
    let nouce = 0;
    let batchSize = 1000;
    function batchNouce() {
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

        setImmediate(batchNouce);
      } else {
        resolve(newBlock);
      }
    }
    batchNouce();
  });
}

function mine() {
  const now = new Date();
  console.log(`[Worker Thread] Miner is mining...`);

  generateNextBlockWithMine((err, newBlock) => {
    if (err) {
      console.error("Error generating block:", err);
    } else {
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
    }
  });
}

parentPort.on("message", (msg) => {
  if (msg === "startMining") {
    mine();
  }
});
