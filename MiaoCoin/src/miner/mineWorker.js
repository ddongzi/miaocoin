const { parentPort, workerData } = require("worker_threads");
const { Transaction } = require("../blockchain/transaction");
const Block = require("../blockchain/block");
const hexToBinary = require("../util/util");

const { info } = workerData;

// 通过挖矿产生区块
function generateNextBlockWithMine() {
  const coinBaseTx = Transaction.generateConinBaseTransaction(
    info.address,
    info.index
  );
  return generateNextBlock([coinBaseTx]);
}
// 检测hash是否满足difficulty要求
function hasMatchesDifficulty(hash, difficulty) {
  const hashBinary = hexToBinary(hash);
  const prefix = "0".repeat(difficulty);
  return hashBinary.startsWith(prefix);
}
// 生成一个区块
function generateNextBlock(data) {
  var timestamp = new Date().toUTCString();
  var hash = "";
  let nouce = 0;
  while (true) {
    hash = Block.caculateHash(
      info.index,
      timestamp,
      data,
      info.previousHash,
      info.difficulty,
      nouce
    );
    if (hasMatchesDifficulty(hash, info.difficulty)) {
      break;
    }
    nouce++;
  }
  // 外部需要从这里返回的构建
  return new Block(
    info.index,
    timestamp,
    info.difficulty,
    nouce,
    data,
    info.previousHash,
    hash
  );
}

function mine() {
  const now = new Date();
  console.log(`[Worker Thread] Miner is mining...`);
  const newBlock = generateNextBlockWithMine();
  const finished = new Date();
  const timeDifference = finished.getTime() - now.getTime();

  // 转换为小时、分钟和秒
  const hours = Math.floor(timeDifference / (1000 * 60 * 60));
  const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

  console.log(`[Worker Thread] Miner finished.
            Cost time : ${hours}h ${minutes}m ${seconds}s. 
            Difficulty: ${newBlock.difficulty}, Nouce : ${newBlock.nouce}`);

  setTimeout(() => {
    parentPort.postMessage({ type: "newBlock", newBlock });
  }, 1000 * 10);
}

parentPort.on("message", (msg) => {
  if (msg === "startMining") {
    mine();
  }
});
