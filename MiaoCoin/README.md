# Miaocoin
## 目录
- [介绍](##介绍)
- [功能](##功能)
- [快速开始](##快速开始)
- [项目结构](##项目结构)
- [构建与发布](##构建与发布)
- [注意事项](##注意事项)
- [知识](##知识)

## 介绍
MiaoCoin 是一个用 Node.js 实现的简单区块链示例项目，支持 P2P 网络、矿工挖矿、交易池、区块链同步等功能。  
该项目主要用于学习区块链原理、节点通信和挖矿机制。  
## 功能 
目前功能有：
- P2P 网络节点通信  
- 矿工挖矿并生成新区块  
- 交易池管理待处理交易  
- 区块链合法性校验与同步  
- ROOT 节点与普通节点角色区分

## 快速开始
### 安装
```bash
git clone https://github.com/ddongzi/miaocoin.git
cd miaocoin/MiaoCoin
npm install
```
### 运行
```bash
# ROOT 节点（第一个节点，负责初始化链）
node src/app.js --http-port 3000 --p2p-port 4000 --root 
# 普通节点（连接已有 ROOT 节点）
node src/app.js --http-port 3001 --p2p-port 4001
```
### 配置说明
* HTTP_PORT: 节点 HTTP 服务端口，默认 3000
* P2P_PORT: 节点 P2P 端口，默认 4000
* ROLE: 节点角色，ROOT 节点需加 `--root` 参数
* 数据目录: `data/`，存储链数据、矿工密钥等
* ROOT 节点 IP: 是否root节点，仅支持一个

## 项目结构

```
MiaoCoin/
├─ src/
│  ├─ blockchain/     区块链核心逻辑（区块、交易、UTXO等）
│  ├─ node/           节点逻辑（节点状态、初始化、矿工等）
│  ├─ net/            网络相关（HTTP 服务器、P2P 通信）
│  ├─ miner/          矿工逻辑
│  ├─ util/           工具函数和加密模块
├─ data/              节点数据目录
├─ package.json       项目依赖及脚本
├─ README.md
```

## 构建与发布
如果希望生成独立可执行文件，可以使用 `pkg`：

```bash
npm install -g pkg

# Linux 平台示例
pkg src/app.js --targets node18-linux-x64 --assets "data/**/*" --output miaocoin

# Windows 平台(未测试)（需在 Windows 系统上执行）
pkg src/app.js --targets node18-win-x64 --assets "data/**/*" --output miaocoin.exe
```
生成可执行文件后，可以直接运行：
```bash
./miaocoin      # Linux
miaocoin.exe    # Windows
```

## 注意事项
* 目前为本地测试环境，只在ip上区分节点，即都是localip
* 目前仅支持一个root节点，且普通节点上线之前root节点必须在线，根节点作为网络引导节点，普通节点初始引导设置为 `localip:3000`
* 非 ROOT 节点启动时不能使用 `--root`
* 数据目录 `data/` 存储矿工私钥，不要泄露

## 链接
- [区块链知识](ddongzi.github.io/blog/区块链)
- [菜鸟](https://www.runoob.com/js/js-howto.html)
- [200line blockchain](https://medium.com/@lhartikk/a-blockchain-in-200-lines-of-code-963cc1cc0e54#.dttbm9afr5)
- [Naivecoin: a tutorial for building a cryptocurrency](https://lhartikk.github.io/)
- [navie coin github repo](https://github.com/conradoqg/naivecoin/tree/master)
- [websocket测试](https://wstool.js.org/)
