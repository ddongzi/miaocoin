const { readFileSync, fstat, pathExistsSync, mkdirSync } = require("fs-extra");
const BlockChain = require("./blockchain/blockchain");
const Node = require("./node/node");
const HttpServer = require("./net/httpServer");
const { P2P } = require("./net/p2p");

const httpPort = process.env.HTTP_PORT || 3000;
const p2pPort = process.env.P2P_PORT || 4000;

const dataPath = './data';
// 创建初始节点： 
const blockchain = new BlockChain('miao', dataPath + '/node0');
const node = new Node(blockchain);
const http = new HttpServer(httpPort, node);
const p2p = new P2P(p2pPort, node);
node.initNetwork(p2p, http);


