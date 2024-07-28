[js 菜鸟](https://www.runoob.com/js/js-howto.html)

[200line blockchain](https://medium.com/@lhartikk/a-blockchain-in-200-lines-of-code-963cc1cc0e54#.dttbm9afr5)

[Naivecoin: a tutorial for building a cryptocurrency](https://lhartikk.github.io/)

[navie coin github repo](https://github.com/conradoqg/naivecoin/tree/master)

[websocket测试](https://wstool.js.org/)

[区块链原理、架构与应用]()

# 一、 blockchain基本结构
## 1. Block类

```json
{ // Block
    "index": 0, // (first block: 0)
    "previousHash": "0", // (hash of previous block, first block is 0) (32 bytes)
    "timestamp": 1465154705, // number of seconds since January 1, 1970
    "data": [ // list of transactions inside the block
        { // transaction 0
            "id": "63ec3ac02f...8d5ebc6dba", // 
            "hash": "563b8aa350...3eecfbd26b", // 
            "data": {
                "inputs": [], // list of input transactions
                "outputs": [] // list of output transactions
            }
        },
    ],
}
```
## 2. Transaction类

```json
{ // TX
    "id": "ac4d025d96c0dd32ab1f69a7eb6ac566d4aa47c292d80053a1ae0d63e16437a3",
    "hash": "c5d51904bbacd14e366f0a94c751735d8a2a2410c7adcaf7e726e49f42b3a0d7",
    "publicKey": null, // 交易发起者公钥
    "inputs": [
        {
            "txOutId": "", // 引用对于 txout所在的交易id
            "txOutIndex": 1,
            "signature": ""
        }
    ],
    "outputs": [
        {
            "address": "3056301006072a8648ce3d020106052b8104000a03420004ec3cfc1f13d35d951fbf81fdbd9e5420dd1c7ed5ee97108490e792d75efba1129a33f410b6878a9fa90f45d25d0c6e2e3c793ec4aeb812b859e975dbbb866a50",
            "amount": 50
        }
    ]
}	
```

### 2.1 UTXOUT

未花费交易输出，包含所有地址所有来源的余额，与blocks保持一致。

 ```json
 {
     "txOutId": "93461aa4048e64d77e7d627649f26813e41757c22563620185134e11eab30840",
     "txOutIndex": 0,
     "address": "3056301006072a8648ce3d020106052b8104000a03420004ec3cfc1f13d35d951fbf81fdbd9e5420dd1c7ed5ee97108490e792d75efba1129a33f410b6878a9fa90f45d25d0c6e2e3c793ec4aeb812b859e975dbbb866a50",
     "amount": 50
 }
 ```

### 2.2 coinbase 交易

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



##  3. 数据存取策略

### 3.1 数据存储

每个node维持区块链的副本。区块链数据包括：blocks, transactions, utxouts, transaction pool(未确认交易池）

- **blocks** : json存储。 （最根本的数据）
- transactions: 不存储
- utxouts : json存储。 与blocks保持一致，方便查询
- transaction pool : 存储在内存中，不持久化

###  3.2 对象反序列化 

网络数据传输是JSON string （或者解出来JSON object）,  需要从其中解析出blocks 、block、transactions、transaction对象



## 4. node类





# 四、分布式同步



节点之间的区块链副本同步通常是基于事件驱动的，网络事件有：节点启动，新区块广播

## 节点启动： 

主动向引导节点发起sync请求， 返回同步数据

## 1. 新区块广播

新区块本地节点验证之后，广播到其他节点，最先收到该区块检查接受上链后，会通知所有对端找他来sync数据.



## 1. 链选择更新原则

- 选择最长的链

![image](https://github.com/user-attachments/assets/97bbcd73-eaf2-4e5f-8b76-11f9c79abea7)



# 二、交易与运行机制流程



![image](https://github.com/user-attachments/assets/a3722f04-2697-494d-b62e-0ed1e66e85fd)
1. 各节点收到未确认交易时，放入自己Pool中，形成等待上链的区块。
   Q：节点什么时候才能产生块？A：触发条件：交易池数量达到上限，固定时间间隔等...。

2. 通过共识机制决定哪个节点上的块胜出。

3. 新区快广播到各节点验证，

4. 超过51%节点验证成功后，上链

   

## 2. TX变化

TX状态变化： 钱包发起交易--> 节点上返回未签名的交易--> 钱包签名后发回---> 节点做hash，转化为未确认的交易

## 共识机制（工作量证明）：

用户发起交易后，网络所有节点都会收到请求，但并不是所有节点都有能力记录交易。如POW工作量证明（挖矿），产生公认唯一的节点来记录。
：

## 新区块验证



## 交易验证



## utxout更新



## 难度机制

节点通过while循环进行测试nouce进行挖矿。

## 未确认交易流程

节点收到未确认交易（已签名hash等）

进行本地检查，放入池中

从池子选出一部分未确认交易，来创建区块



# 三、网络服务

节点相关

## httpServer
httpServer 提供 对外（对客户）进行查询、交易操作。

| API接口 |      |      |
| ------- | ---- | ---- |
|         |      |      |
|         |      |      |
|         |      |      |



## p2p
p2p模块负责节点之间的对等通信。p2p每个都有 服务端和客户端角色，发起请求一侧的为服务角色，可同时作为服务、客户响应。



1. 节点启动：向引导节点发送上线，上报自己服务地址放入引导节点。 ---> 引导节点会定时同步，发送广播，同步信息包含（节点）已知的服务地址。 ---> 其他节点便感知到该节点上线。
> 实际上，只要向一个节点发送上线，便可以广播
>



# 五、 Wallet
The goal of the wallet is to create a more abstract interface **for the end user.** 

位于前端侧。




功能：
- 创建导入钱包
- 看到余额
- 发起转账

## 1. balance获取
This consequently means that anyone can solve the balance of a given address.
	余额只是 未经消费的输出。 所以只需找到adress的utxout，金额加起来即可



# 六：Transaction relaying
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



# 八、线程

## mine woker线程

如果一直mine,while循环会阻塞主线程。worker线程可以理解为执行脚本， 主线程向其传值（非复杂对象），线程之间独立， 所以不可以调用this函数等，static可以。线程之间通信传输数据,格式为JSON。



# 密码

web crypto api 不支持spec256k1曲线参数。





私钥结构分析：ECDSA P-256, ANS.1

`308187020100301306072a8648ce3d020106082a8648ce3d030107046d306b0201010420855f56a8d38a20882aeeb5da6a96a322084b94b7afb596a5ea923b7d8509ed66a14403420004b812ccea1954de0e45859893d93034ef4b845dd2a1a83b9af3a2563929c00b8aa1fbca8a9a7560b199bf0de541a51208757dc1597259ac888dbaaf04ca385a4b `

```md
ECDSA P-256 私钥 DER 编码结构解析

- **序列 (Sequence)**
  - `30 81 87` 
    - `30`: 序列类型
    - `81 87`: 序列长度（135 字节）

  - **版本号 (Integer)**
    - `02 01 00`
      - `02`: 整数类型
      - `01`: 长度为 1 字节
      - `00`: 版本号（通常为 0）

  - **算法标识 (Sequence)**
    - `30 13`
      - `30`: 序列类型
      - `13`: 序列长度（19 字节）
    - **对象标识符 (OID)**
      - `06 07 2A 86 48 CE 3D 02 01`
        - `06`: OID 类型
        - `07`: 长度为 7 字节
        - `2A 86 48 CE 3D 02 01`: OID `1.2.840.10045.2.1` (EC 公钥)
    - **曲线参数 (OID)**
      - `06 08 2A 86 48 CE 3D 03 01 07`
        - `06`: OID 类型
        - `08`: 长度为 8 字节
        - `2A 86 48 CE 3D 03 01 07`: OID `1.2.840.10045.3.1.7` (P-256)

  - **私钥 (Octet String)**
    - `04 6D`
      - `04`: 八位字节字符串类型
      - `6D`: 长度为 109 字节
    - **序列 (Sequence)**
      - `30 6B`
        - `30`: 序列类型
        - `6B`: 序列长度（107 字节）
      - **版本号 (Integer)**
        - `02 01 01`
          - `02`: 整数类型
          - `01`: 长度为 1 字节
          - `01`: 版本号（通常为 1）
      - **私钥数值 (Octet String)**
        - `04 20 85 5F 56 A8 D3 8A 20 88 2A EE B5 DA 6A 96 A3 22 08 4B 94 B7 AF B5 96 A5 EA 92 3B 7D 85 09 ED 66`
          - `04`: 八位字节字符串类型
          - `20`: 长度为 32 字节
          - `85 5F ... 66`: 私钥数值
      - **公钥信息 (Context-specific tag)**
        - `A1 44`
          - `A1`: 上下文特定标签
          - `44`: 标签内容长度为 68 字节
        - **公钥 (BIT STRING)**
          - `03 42 00 04 B8 12 CC EA 19 54 DE 0E 45 85 98 93 D9 30 34 EF 4B 84 5D D2 A1 A8 3B 9A F3 A2 56 39 29 C0 0B 8A A1 FB CA 8A 9A 75 60 B1 99 BF 0D E5 41 A5 12 08 75 7D C1 59 72 59 AC 88 8D BA AF 04 CA 38 5A 4B`
            - `03`: BIT STRING 类型
            - `42`: BIT STRING 长度为 66 字节
            - `00`: 未使用的位数
            - `04 B8 12 ... 5A 4B`: 公钥值（未压缩格式，包括 X 和 Y 坐标）

```




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