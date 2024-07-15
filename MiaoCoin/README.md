[js](https://www.runoob.com/js/js-howto.html)
[ramda]

# 从0构建区块链

## 第1章：区块和区块链基础

### 1.1 定义区块结构
1. Block类 {index, timestamp, data, previoushash}

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

### 添加一个区块


```
    addBlock(newBlock) {
        newBlock.previoushash = this.getLastBlock().toHash()
        this.blocks.push(newBlock)
        this.blocksDb.write(this.blocks)
        console.info(`Block added ${newBlock}`)
    }
```javascript

- **作用**: 构建区块链的链式结构

## 第2章：创世区块与哈希计算

### 2.1 创建创世区块
- **步骤**: 创建并添加第一个区块（创世区块）到区块链
- **预期输出**: 包含创世区块的区块链
- **作用**: 初始化区块链

### 2.2 实现哈希计算
- **步骤**: 使用哈希函数（如 SHA-256）计算区块的哈希值
- **预期输出**: 区块的哈希值计算函数
- **作用**: 确保区块的完整性和不可篡改性

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

