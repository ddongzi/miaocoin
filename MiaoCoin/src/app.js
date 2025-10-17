const { readFileSync, fstat, pathExistsSync, mkdirSync } = require("fs-extra");
const BlockChain = require("./blockchain/blockchain");
const Node = require("./node/node");
const HttpServer = require("./net/httpServer");
const { P2P } = require("./net/p2p");

const { Worker } = require('worker_threads');
const { Console } = require("console");
const Logger = require('./util/log')
const logger = new Logger(__filename)

const httpPort = process.env.HTTP_PORT || 3000;
const p2pPort = process.env.P2P_PORT || 4000;
const role = process.env.ROLE || 'ROOT';

const dataPath = './data';

const { program } = require('commander');
const node_config = {};

program
  .name('miaocoin')
  .description('Miaocoin blockchain CLI')
  .version('1.0.0')
  .option('--root', 'Set this node as ROOT')
  .option('--http-port <port>', 'HTTP port', 3000)
  .option('--p2p-port <port>', 'P2P port', 4000)
  .action((opts) => {
    if (opts.root) {
      node_config.root = true;
      logger.log('This node is ROOT');
    } else {
      node_config.root = false;
      logger.log('This node is a regular node');
    }

    const httpPort = opts.httpPort;
    const p2pPort = opts.p2pPort;

    const node = new Node(node_config);
    const blockchain = new BlockChain(node);
    const p2p = new P2P(p2pPort, node);
    const http = new HttpServer(httpPort, node);
    node.initBlockChain(blockchain);
    node.initNetwork(p2p, http);
    node.initMiner();
    node.miner.startMining();
  });

program.parse(process.argv);
