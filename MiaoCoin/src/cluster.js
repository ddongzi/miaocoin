const { readFileSync, fstat, pathExistsSync, mkdirSync } = require("fs-extra");
const BlockChain = require("./blockchain/blockchain");
const Node = require("./node/node");
const HttpServer = require("./httpServer/httpServer");
const { P2P } = require("./httpServer/p2p");

let nodesConfig = JSON.parse(readFileSync('nodesConfig.json'));
let dataPath = nodesConfig.dataPath

// 创建一个函数来启动一个节点
function startNode(httpPort, p2pPort, dataPath) {
    const blockchain = new BlockChain('miao', dataPath);
    const node = new Node(blockchain);
    const p2p = new P2P(p2pPort, node);
    const http = new HttpServer(httpPort, node);
    node.initNetwork(p2p, http);
}

// 创建初始节点： 
const blockchain = new BlockChain('miao', dataPath + '/node0');
blockchain.init()
const node = new Node(blockchain);
const p2p = new P2P(3000, node);
const http = new HttpServer(6000, node);
node.initNetwork(p2p, http);

// 注册的节点：
nodesConfig.nodes.forEach(node => {
    if (!pathExistsSync(dataPath + '/' + node.name)) {
        mkdirSync(dataPath + '/' + node.name)
    }
    startNode(node.httpPort, node.p2pPort,dataPath + '/' + node.name)
});

