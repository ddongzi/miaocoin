import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:3000', // 替换为你的后端接口地址
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getBlocks = () => apiClient.get('/blocks');
export const getBlockDetail = (hash) => apiClient.get(`/block/${hash}`);
export const getWalletInfo = () => apiClient.get('/wallet');
export const transfer = (amount, address) => apiClient.post('/sendTransaction', {
    address,
    amount
})
export const getTransactionHistory = () => apiClient.get('/getTransactionHistory');
export const connectToP2PNode = (peer) => apiClient.post('/addPeer', {
    peer
});