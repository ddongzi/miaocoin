import React, { useEffect, useState } from "react";
import {
  Button,
  CircularProgress,
  TextField,
  Typography,
  Box,
  Snackbar,
  IconButton,
  Container,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
import { CopyAll, MoreVert } from "@mui/icons-material";
import {
  getWalletInfo,
  transfer,
  getTransactionHistory,
  createWallet,
  importWallet,
} from "../apiService";

function Wallet() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [transferLoading, setTransferLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [openKeyDialog, setOpenKeyDialog] = useState(false);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [importPublicKey, setImportPublicKey] = useState("");
  const [importPrivateKey, setImportPrivateKey] = useState("");
  const [openImportDialog, setOpenImportDialog] = useState(false);

  const open = Boolean(anchorEl);

  useEffect(() => {
    getWalletInfo()
      .then((response) => {
        setWallet(response.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleCreateWallet = () => {
    createWallet()
      .then((response) => {
        setWallet(response.data);
        setSuccessMessage("钱包创建成功！");
      })
      .catch(() => setErrorMessage("钱包创建失败。请重试。"));
  };

  const handleImportWallet = () => {
    importWallet(importPublicKey, importPrivateKey)
      .then((response) => {
        setWallet(response.data);
        setSuccessMessage("钱包导入成功！");
      })
      .catch(() => setErrorMessage("钱包导入失败。请检查密钥并重试。"));
  };

  const handleTransfer = () => {
    if (!amount || !address) {
      setErrorMessage("请填写所有字段。");
      return;
    }

    setTransferLoading(true);
    transfer(amount, address)
      .then((response) => {
        setSuccessMessage("转账成功！");
        setTransactionId(response.data.transactionId); // 假设 API 返回交易ID
        setAmount("");
        setAddress("");
        setTransferLoading(false);
      })
      .catch(() => {
        setErrorMessage("转账失败。请重试。");
        setTransferLoading(false);
      });
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(text);
      setTimeout(() => setCopied(""), 2000);
    });
  };
  const handleOpenImportDialog = () => {
    setOpenImportDialog(true);
  };

  const handleCloseImportDialog = () => {
    setOpenImportDialog(false);
  };

  const handleOpenKeyDialog = () => {
    setOpenKeyDialog(true);
  };

  const handleCloseKeyDialog = () => {
    setOpenKeyDialog(false);
  };

  const handleOpenHistoryDialog = () => {
    getTransactionHistory()
      .then((response) => {
        setTransactionHistory(response.data);
        setOpenHistoryDialog(true);
      })
      .catch(() => setErrorMessage("获取交易记录失败"));
  };

  const handleCloseHistoryDialog = () => {
    setOpenHistoryDialog(false);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  if (loading) return <CircularProgress />;

  return (
    <Container maxWidth="sm" style={{ paddingTop: "20px" }}>
      <Card>
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h4">钱包</Typography>
            <IconButton onClick={handleMenuClick} color="primary">
              <MoreVert />
            </IconButton>
          </Box>
          {wallet ? (
            <div>
              <Typography variant="h6">
                钱包余额: {wallet.balance} BTC
              </Typography>
              <Box mt={4}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCreateWallet}
                  fullWidth
                >
                  创建新钱包
                </Button>
              </Box>

              <Box my={2}>
                <TextField
                  label="金额"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="收款地址"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  fullWidth
                  margin="normal"
                />
              </Box>
              <Button
                variant="contained"
                color="primary"
                onClick={handleTransfer}
                disabled={transferLoading}
                fullWidth
              >
                {transferLoading ? "处理中..." : "转账"}
              </Button>
              <Button
                variant="contained"
                color="secondary"
                style={{ marginTop: "10px" }}
                onClick={handleOpenHistoryDialog}
                fullWidth
              >
                查看交易记录
              </Button>
              <Box my={2}>
                {transactionId && (
                  <Box my={2}>
                    <Typography variant="h6">交易ID:</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {transactionId}
                    </Typography>
                  </Box>
                )}
              </Box>
            </div>
          ) : (
            <Typography>钱包信息不可用。</Typography>
          )}
        </CardContent>
      </Card>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleOpenKeyDialog}>查看公钥和私钥</MenuItem>
        <MenuItem onClick={handleCreateWallet}>创建新钱包</MenuItem>
        <MenuItem onClick={() => setOpenImportDialog(true)}>导入钱包</MenuItem>
      </Menu>
      
      <Dialog open={openImportDialog} onClose={handleCloseImportDialog}>
        <DialogTitle>导入钱包</DialogTitle>
        <DialogContent>
          <TextField
            label="公钥"
            value={importPublicKey}
            onChange={(e) => setImportPublicKey(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="私钥"
            value={importPrivateKey}
            onChange={(e) => setImportPrivateKey(e.target.value)}
            fullWidth
            margin="normal"
            type="password"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImportDialog} color="primary">
            取消
          </Button>
          <Button onClick={handleImportWallet} color="primary">
            导入
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openKeyDialog} onClose={handleCloseKeyDialog}>
        <DialogTitle>公钥和私钥</DialogTitle>
        <DialogContent>
          <Box my={2}>
            <Typography variant="h6">公钥:</Typography>
            <Box display="flex" alignItems="center">
              <Typography
                variant="body2"
                color="textSecondary"
                style={{ flexGrow: 1 }}
              >
                {wallet?.publicKey}
              </Typography>
              <IconButton
                onClick={() => handleCopy(wallet?.publicKey)}
                color="primary"
              >
                <CopyAll />
              </IconButton>
            </Box>
          </Box>
          <Box my={2}>
            <Typography variant="h6">私钥:</Typography>
            <Box display="flex" alignItems="center">
              <Typography
                variant="body2"
                color="textSecondary"
                style={{ flexGrow: 1 }}
              >
                {wallet?.privateKey}
              </Typography>
              <IconButton
                onClick={() => handleCopy(wallet?.privateKey)}
                color="primary"
              >
                <CopyAll />
              </IconButton>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseKeyDialog} color="primary">
            关闭
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openHistoryDialog}
        onClose={handleCloseHistoryDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>交易记录</DialogTitle>
        <DialogContent>
          <List>
            {transactionHistory.map((transaction) => (
              <ListItem key={transaction.id}>
                <ListItemText
                  primary={`交易ID: ${transaction.id}`}
                  secondary={`状态: ${transaction.status} | 余额: ${transaction.balance} BTC`}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHistoryDialog} color="primary">
            关闭
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage("")}
        message={successMessage}
        action={
          <Button color="inherit" onClick={() => setSuccessMessage("")}>
            关闭
          </Button>
        }
      />
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage("")}
        message={errorMessage}
        action={
          <Button color="inherit" onClick={() => setErrorMessage("")}>
            关闭
          </Button>
        }
      />
      <Snackbar
        open={!!copied}
        autoHideDuration={2000}
        onClose={() => setCopied("")}
        message={`${copied} 复制成功`}
      />
    </Container>
  );
}

export default Wallet;
