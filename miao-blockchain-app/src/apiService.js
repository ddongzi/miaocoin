// apiService.js
import axios from 'axios';
import { useNode } from './NodeContext';

const useApiClient = () => {
    const { nodeUrl } = useNode();

    const apiClient = axios.create({
        baseURL: nodeUrl,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    return apiClient;
};

export const useApi = () => {
    const apiClient = useApiClient();

    return {
        getBlocks: () => apiClient.get('/blocks'),
        getBlockDetail: (hash) => apiClient.get(`/block/${hash}`),
        getWalletInfo: (address) => apiClient.post('/wallet', { address }),
        transfer: (sender, receiver, amount) => apiClient.post('/createTransaction', { sender, receiver, amount }),
        getTransactionHistory: () => apiClient.get('/getTransactionHistory'),
        connectToP2PNode: (peer) => apiClient.post('/addPeer', { peer }),
        getNodeDetails: () => apiClient.get('/getNodeDetails'),
        sendSignedTx: (tx) => apiClient.post('/sendSignedTx',{tx})
    };
};
