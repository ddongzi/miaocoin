[js](https://www.runoob.com/js/js-howto.html)
[200line blockchain](https://medium.com/@lhartikk/a-blockchain-in-200-lines-of-code-963cc1cc0e54#.dttbm9afr5)
# 从0构建区块链

## 第1章：区块和区块链基础机构

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

## 第3章：区块验证与链的更新

### 3.1 实现区块验证
- **步骤**: 验证新区块的 index、previousHash 和 hash
- **预期输出**: 区块验证函数
- **作用**: 确保区块的有效性和区块链的完整性

### 3.2 添加新区块
- **步骤**: 实现添加新区块的函数，并进行验证
- **预期输出**: 成功添加新区块到区块链
- **作用**: 动态更新区块链，保持链的连续性和有效性

## 第4章：交易与钱包

### 4.1 创建交易结构
- **步骤**: 定义交易的基本属性（sender, receiver, amount, signature）
- **预期输出**: 一个包含基本交易属性的 Transaction 类
- **作用**: 记录并管理区块链上的交易

### 4.2 实现交易签名和验证
- **步骤**: 实现交易的签名和验证函数
- **预期输出**: 交易签名和验证函数
- **作用**: 确保交易的合法性和安全性

### 4.3 实现钱包功能
- **步骤**: 生成公钥和私钥对，用于交易签名和验证
- **预期输出**: 简单的钱包功能，生成公钥和私钥
- **作用**: 用户能够创建和管理自己的密钥对，进行交易

## 第5章：工作量证明（PoW）

### 5.1 实现 PoW 算法
- **步骤**: 实现 PoW 算法，矿工解决数学难题并验证区块
- **预期输出**: PoW 算法的实现和验证
- **作用**: 确保新区块的生成需要计算工作，防止轻易篡改

## 第6章：P2P 网络

### 6.1 实现网络通信
- **步骤**: 实现节点之间的基本通信协议
- **预期输出**: 基本的 P2P 通信功能
- **作用**: 节点能够相互通信，交换区块和交易信息

### 6.2 广播区块和交易
- **步骤**: 实现区块和交易的广播机制
- **预期输出**: 区块和交易的广播功能
- **作用**: 确保网络中的所有节点同步更新区块链

## 第7章：用户界面（可选）

### 7.1 创建简单用户界面
- **步骤**: 使用 HTML/CSS/JavaScript 创建一个简单的用户界面
- **预期输出**: 简单的用户界面，显示区块链状态和交易信息
- **作用**: 使用户能够直观地查看区块链状态和进行交易

### 7.2 实现用户界面与区块链交互
- **步骤**: 允许用户创建交易和查看区块链状态
- **预期输出**: 用户界面与区块链的交互功能
- **作用**: 用户能够通过界面与区块链进行交互，创建和查看交易

## 第8章：测试与优化

### 8.1 测试区块链
- **步骤**: 编写单元测试验证区块链的功能
- **预期输出**: 单元测试覆盖区块链的主要功能
- **作用**: 确保区块链的各个功能正确实现

### 8.2 优化性能
- **步骤**: 分析并优化区块链的性能
- **预期输出**: 优化后的区块链性能
- **作用**: 提高区块链的效率和响应速度

