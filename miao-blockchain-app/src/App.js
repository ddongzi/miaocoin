import React from 'react';
import { BrowserRouter , Routes, Route, Link } from 'react-router-dom';
import BlockchainBrowser from './components/BlockchainBrowser';
import BlockDetail from './components/BlockDetail';
import Wallet from './components/Wallet';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';

function App() {
    return (
        <BrowserRouter>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" style={{ flexGrow: 1 }}>
                        Blockchain Wallet App
                    </Typography>
                    <Button color="inherit" component={Link} to="/">Blockchain Browser</Button>
                    <Button color="inherit" component={Link} to="/wallet">Wallet</Button>
                </Toolbar>
            </AppBar>
            <Routes>
                <Route path="/" element={<BlockchainBrowser />} />
                <Route path="/block/:hash" element={<BlockDetail />} />
                <Route path="/wallet" element={<Wallet />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
