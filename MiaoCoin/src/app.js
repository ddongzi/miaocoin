const { readFileSync, fstat, pathExistsSync, mkdirSync } = require("fs-extra");
const BlockChain = require("./blockchain/blockchain");
const Node = require("./node/node");
const HttpServer = require("./net/httpServer");
const { P2P } = require("./net/p2p");

const { Worker } = require('worker_threads');
const { Console } = require("console");

const httpPort = process.env.HTTP_PORT || 3000;
const p2pPort = process.env.P2P_PORT || 4000;
const role = process.env.ROLE || 'ROOT';

const dataPath = './data';

const node_config = {}

const {program} = require('commander')
const node_command = program
    .command('node')
    .description('node cli')

node_command
    .command('--root <root>')
    .description('node root role')
    .action((options) => {
        console.log(`get options : ${options}`);
        // 
        if (options.root) {
            node_config.root = options.root
        }
    });
    

(() => {
    try {
        // 创建初始节点： 
        const node = new Node(node_config);
        const blockchain = new BlockChain(node)
        const p2p = new P2P(p2pPort, node);
        const http = new HttpServer(httpPort, node);
        node.initBlockChain(blockchain)
        node.initNetwork(p2p, http);
        node.initMiner()
        // 预置一个区块，矿工有钱
        node.miner.startMining()
    } catch (e) {
        console.error("Error:", e);
    }

})();

