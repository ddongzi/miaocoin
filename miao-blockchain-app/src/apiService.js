import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:3001', // 默认访问节点node1
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getBlocks = () => apiClient.get('/blocks');
export const getBlockDetail = (hash) => apiClient.get(`/block/${hash}`);
export const getWalletInfo = (address) => apiClient.post('/wallet', {
    address
});
export const transfer = (sender, receiver,amount ) => apiClient.post('/sendTransaction', {
    sender,
    receiver,
    amount
})
export const getTransactionHistory = () => apiClient.get('/getTransactionHistory');
export const connectToP2PNode = (peer) => apiClient.post('/addPeer', {
    peer
});

export const importWallet = () => apiClient.get('/importWallet');