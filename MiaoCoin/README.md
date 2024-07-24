[js](https://www.runoob.com/js/js-howto.html)

[200line blockchain](https://medium.com/@lhartikk/a-blockchain-in-200-lines-of-code-963cc1cc0e54#.dttbm9afr5)

[Naivecoin: a tutorial for building a cryptocurrency](https://lhartikk.github.io/)

[](https://github.com/conradoqg/naivecoin/tree/master)

[websocket测试](https://wstool.js.org/)
[区块链原理、架构与应用]

# 第二章 blockchain
1. 读取存储策略
每个node维持区块链的副本。区块链数据包括：blocks, transactions, utxouts, transaction pool(未确认交易池）
- blocks : json存储
- transactions: 属于blocks, 单独json存储
- utxouts : json存储
- transaction pool : 存储在内存中，不持久化

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

3. Transaction类
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


Utxouts 更新


- **作用**: 构建区块链的链式结构
## 选择最长的链
![image](https://github.com/user-attachments/assets/97bbcd73-eaf2-4e5f-8b76-11f9c79abea7)

# 交易与运行机制
![image](https://github.com/user-attachments/assets/a3722f04-2697-494d-b62e-0ed1e66e85fd)
1. 各节点收到未确认交易时，放入自己Pool中，形成等待上链的区块。
   Q：节点什么时候才能产生块？A：触发条件：交易池数量达到上限，固定时间间隔等...。
2. 通过共识机制决定哪个节点上的块胜出。
3. 新区快广播到各节点验证，
4. 超过51%节点验证成功后，上链

TX状态变化： 钱包发起交易--> 节点上返回未签名的交易--> 钱包签名后发回---> 节点做hash，转化为未确认的交易

# 共识机制（工作量证明）：
用户发起交易后，网络所有节点都会收到请求，但并不是所有节点都有能力记录交易。如POW工作量证明（挖矿），产生公认唯一的节点来记录。

# 第三章：网络服务

## httpServer
httpServer模块主要负责区块链节点的HTTP API接口。具体作用包括：

- 提供API接口：通过HTTP请求与区块链节点进行交互，比如查询区块、查询交易、提交新的交易、挖矿等操作。
- 处理客户端请求：接受并处理来自客户端的各种HTTP请求，并返回相应的数据或执行相应的操作。
- 与用户或其他应用程序交互：允许用户或其他应用程序通过HTTP接口与区块链节点进行通信，从而实现数据查询和操作。
## p2p
p2p模块（在Naivecoin项目的简化版本中主要通过HTTP实现）负责节点之间的对等通信。具体作用包括：
- 节点之间的同步：实现区块链数据在不同节点之间的同步，包括区块和交易的传播。
- 网络拓扑的维护：维护一个由区块链节点组成的对等网络，确保节点能够发现并连接到其他节点。
- 数据一致性：确保所有节点上的区块链数据保持一致，即每个节点都拥有相同的区块链副本。
- 交易和区块的传播：当一个节点接收到新的交易或挖到新的区块时，将这些信息传播给网络中的其他节点，以确保整个网络的数据是最新的。

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

# 第五章：Transaction relaying
Typically, when someone wants to include a transaction to the blockchain (= send coins to some address ) he broadcasts the transaction to the network and hopefully some node will mine the transaction to the blockchain.
it means you don’t need to mine a block yourself, in order to include a transaction to the blockchain.

As a consequence, the nodes will now share two types of data when they communicate with each other:
- the state of the blockchain ( =the blocks and transactions that are included to the blockchain)
- unconfirmed transactions ( =the transactions that are not yet included in the blockchain)

## Transaction pool
Transaction pool is a structure that contains all of the “unconfirmed transactions” our node know of. 

## Broadcasting
√ When a node receives an unconfirmed transaction it has not seen before, it will broadcast the full transaction pool to all peers.
- When a node first connects to another node, it will query for the transaction pool of that node.

## Updating the transaction pool

## Validating received unconfirmed transactions
避免对同一笔钱进行消费

## From transaction pool to blockchain
未确认交易上到区块链。This is simple: when a node starts to mine a block, it will include the transactions from the transaction pool to the new block candidate.




# Docker 部署
 `` 
```js
# 构建镜像
docker build -t my-blockchain-node .

# 启动第一个节点
docker run -d --name node1 -p 4001:4000 -p 3001:3000 my-blockchain-node

# 启动第二个节点（映射到不同的端口）
docker run -d --name node2 -p 4002:4000 -p 3002:3000 my-blockchain-node

# 启动第三个节点（映射到不同的端口）
docker run -d --name node3 -p 4003:4000 -p 3003:3000 my-blockchain-node
```
