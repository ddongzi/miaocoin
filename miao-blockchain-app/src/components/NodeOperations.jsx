import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Snackbar } from '@mui/material';
import { connectToP2PNode } from '../apiService';

function NodeOperations() {
    const [nodeUrl, setNodeUrl] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleConnect = () => {
        connectToP2PNode(nodeUrl)
            .then(() => {
                setSuccessMessage('成功连接到节点！');
                setNodeUrl('');
            })
            .catch(() => {
                setErrorMessage('连接节点失败。请重试。');
            });
    };

    return (
        <Box sx={{ padding: 2 }}>
            <Typography variant="h4" gutterBottom>节点操作</Typography>
            <Box my={2}>
                <TextField
                    label="节点 URL"
                    value={nodeUrl}
                    onChange={(e) => setNodeUrl(e.target.value)}
                    fullWidth
                    margin="normal"
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleConnect}
                    fullWidth
                >
                    连接节点
                </Button>
            </Box>
            <Snackbar
                open={!!successMessage}
                autoHideDuration={6000}
                onClose={() => setSuccessMessage('')}
                message={successMessage}
                action={
                    <Button color="inherit" onClick={() => setSuccessMessage('')}>
                        关闭
                    </Button>
                }
            />
            <Snackbar
                open={!!errorMessage}
                autoHideDuration={6000}
                onClose={() => setErrorMessage('')}
                message={errorMessage}
                action={
                    <Button color="inherit" onClick={() => setErrorMessage('')}>
                        关闭
                    </Button>
                }
            />
        </Box>
    );
}

export default NodeOperations;
