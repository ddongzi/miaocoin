let nonce = 0;
const startTime = Date.now();

while (Date.now() - startTime < 1000) { // 运行 1 秒
  nonce++;
}

const endTime = Date.now();
console.log(`在 1 秒内执行的次数: ${nonce}`);
