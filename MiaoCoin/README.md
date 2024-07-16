[js](https://www.runoob.com/js/js-howto.html)

[200line blockchain](https://medium.com/@lhartikk/a-blockchain-in-200-lines-of-code-963cc1cc0e54#.dttbm9afr5)

[Naivecoin: a tutorial for building a cryptocurrency](https://lhartikk.github.io/)

[](https://github.com/conradoqg/naivecoin/tree/master)

# 第一章 blockchain
维持：1个区块链、1个账本（交易链）


### 1.1 定义区块结构
1. Block类 {index, timestamp, data, previoushash}
```json
/*
{ // Block
    "index": 0, // (first block: 0)
    "previousHash": "0", // (hash of previous block, first block is 0) (64 bytes)
    "timestamp": 1465154705, // number of seconds since January 1, 1970
    "transactions": [ // list of transactions inside the block
        { // transaction 0
            "id": "63ec3ac02f...8d5ebc6dba", // random id (64 bytes)
            "hash": "563b8aa350...3eecfbd26b", // hash taken from the contents of the transaction: sha256 (id + data) (64 bytes)
            "type": "regular", // transaction type (regular, fee, reward)
            "data": {
                "inputs": [], // list of input transactions
                "outputs": [] // list of output transactions
            }
        }
    ],
}
*/
```
- **作用**: 构建区块链的基本单元

### 1.2 创建区块链结构
1. BlockChain类
- blocks 所有区块
- blocksDb 区块链数据,  路径data/{name}/blocks.json
a. 创建区块链
- 从创世区块构建： 创世区块生成
```js
class BlockChain {
    constructor() {
        this.chain = [this.createGeniusBlock()]
    }
    createGeniusBlock() {
        return new Block(
            0,
            new Date().toISOString(),
            'Genius Block',
            '0'
        )
    }   
}
```
- 从文件读取：
 文件读取工具
 read: 从json文件读取一个区块链数据，并转换为blockchain对象

```json
[
    {
        "index": 0,
        "previoushash": "0",
        "timestamp": "2024-07-15T05:56:16.090Z",
        "data": "Genius Block"
    }
]
```


```js
class DB {
    constructor(filePath) {
        this.filePath = filePath;
    }

    read(prototype) {
        var content = fs.readFileSync(this.filePath)
        return (prototype) ?  prototype.fromJson(JSON.parse(content)) :JSON.parse(content);
    }
}
```
blocks为数据，[block] 

3. transcation类
```json
{
    "id": "5a78ebcfdc71796f7e7e29a31b63e61b0c08c32a944e56db2b59fa971b7aa10f",
    "timestamp": 1632765429,
    "inputs": [
        {
            "transaction": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
            "index": 0,
            "address": "sender_address_1",
            "signature": "sender_signature_1"
        },
        {
            "transaction": "b2c3d4e5f6g7h8i9j0k1l2m3n4o5p7q8",
            "index": 1,
            "address": "sender_address_2",
            "signature": "sender_signature_2"
        }
    ],
    "outputs": [
        {
            "amount": 50,
            "address": "recipient_address_1"
        },
        {
            "amount": 20,
            "address": "recipient_address_2"
        }
    ]
}
```




```javascript
    addBlock(newBlock) {
        newBlock.previoushash = this.getLastBlock().toHash()
        this.blocks.push(newBlock)
        this.blocksDb.write(this.blocks)
        console.info(`Block added ${newBlock}`)
    }
```

- **作用**: 构建区块链的链式结构

## HTTP服务：查询区块链

## 选择最长的链
![image](https://github.com/user-attachments/assets/97bbcd73-eaf2-4e5f-8b76-11f9c79abea7)

# HTTPserver
服务：

# node
An essential part of a node is to share and sync the blockchain with other nodes.The following rules are used to keep the network in sync.
- When a node generates a new block, it broadcasts it to the network
- When a node connects to a new peer it querys for the latest block
- When a node encounters a block that has an index larger than the current known block, it either adds the block the its current chain or querys for the full blockchain.

# Transactions
https://lhartikk.github.io/jekyll/update/2017/07/12/chapter3.html

> However, creating transactions is still very difficult. We must manually create the inputs and outputs of the transactions and sign them using our private keys. This will change when we introduce wallets in the next chapter.
## 地址

## Coinbase交易
它是每个区块的第一笔交易，用于奖励矿工。Coinbase交易没有输入（txIns），因为它不花费之前的交易输出，而是从系统中创建新币。
txIn.txOutIndex 没啥用， 可用blockIndex来标识这个独特交易
```js
generateConinBaseTransaction(address,blockIndex) {
        const t = new Transaction()
        const txIn = new TxInput();
        txIn.signature = '';
        txIn.txOutId = '';
        txIn.txOutIndex = blockIndex;
    
        t.txIns = [txIn];
        t.txOuts = [new TxOut(address, COINBASE_AMOUNT)];
        t.id = getTransactionId(t);
        return t;

    }
```
# 第四章 Wallet
The goal of the wallet is to create a more abstract interface **for the end user.**


功能：
- 创建钱包
- 看到余额
- 发起转账

- 
## Generating and storing the private key

## Wallet balance
This consequently means that anyone can solve the balance of a given address.
余额只是 未经消费的输出。 所以只需找到adress的utxout，金额加起来即可

# Generating transactions

Let’s play out a bit more complex transaction scenario:
1. User C has initially 0 coins
2. User C receives 3 transactions worth of 10, 20 and 30 coins
3. User C wants to send 55 coins to user D. What will the transaction look like?

![image](https://github.com/user-attachments/assets/fccecfa2-af3f-44be-a021-940f1b7b199c)



