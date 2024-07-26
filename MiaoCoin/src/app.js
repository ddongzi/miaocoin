const { readFileSync, fstat, pathExistsSync, mkdirSync } = require("fs-extra");
const BlockChain = require("./blockchain/blockchain");
const Node = require("./node/node");
const HttpServer = require("./net/httpServer");
const { P2P } = require("./net/p2p");

const { Worker } = require('worker_threads');

const httpPort = process.env.HTTP_PORT || 3000;
const p2pPort = process.env.P2P_PORT || 4000;
const role = process.env.ROLE || 'ROOT';

const dataPath = './data';

// 创建初始节点： 
const node = new Node();
const p2p = new P2P(p2pPort, node);
const http = new HttpServer(httpPort, node);
node.initNetwork(p2p, http);
node.initMiner()

node.miner.startMining()