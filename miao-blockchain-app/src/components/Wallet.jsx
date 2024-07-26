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
  Input,
} from "@mui/material";
import { CopyAll, MoreVert } from "@mui/icons-material";
import {
  useApi,
} from "../apiService";
import MyCrypto from "../myCrypto";
import useLocalStorage from "../hooks/useLocalStorage";

function Wallet() {

  const {getWalletInfo, transfer,getTransactionHistory,sendSignedTx} = useApi()

  const [loading, setLoading] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [openKeyDialog, setOpenKeyDialog] = useState(false);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openImportDialog, setOpenImportDialog] = useState(false);


  const [address, setAddress] = useLocalStorage('address','');
  const [publicKey, setPublicKey] = useLocalStorage('publickKey','')
  const [privateKey, setPrivateKey] = useLocalStorage('privatekKey','')
  const [balance, setBalance] = useLocalStorage('balance',0)

  const [importPublicKey, setImportPublicKey] = useState('');
  const [importPrivateKey, setImportPrivateKey] = useState('');
  
  const [amount, setAmount] = useState(0);
  const [receiver, setReceiver] = useState('')
  const [transactionHistory, setTransactionHistory] = useState([]);


  const open = Boolean(anchorEl);

  useEffect(() => {
    if (address.length > 0) {
      getWalletInfo(address)
       .then((response) => {
          setBalance(response.data.balance)
          setLoading(false);
        })
       .catch(() => setLoading(false));
    } else {
      console.log(`empty wallet ${balance}`);
    }

  }, []);

  

  const handleCreateWallet = async () => {
    const { privateKey, publicKey } = await MyCrypto.generateKeyPair();
    setPublicKey(importPublicKey)
    setAddress(MyCrypto.pemToHex(importPublicKey));
    setPrivateKey(importPrivateKey)
    console.log(`创建新钱包 ${privateKey}, ${publicKey}`);
  };
  const handlePublicKeyUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const publicKey = e.target.result;
      setImportPublicKey(publicKey);
    };

    reader.readAsText(file);
  };

  const handlePrivateKeyUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const privateKey = e.target.result;
      setImportPrivateKey(privateKey);
    };

    reader.readAsText(file);
  };
  const handleImportWallet = () => {
    setPublicKey(importPublicKey)
    setAddress(MyCrypto.pemToHex(importPublicKey))
    setPrivateKey(importPrivateKey)

    console.log(`导入钱包\n${importPublicKey}\n${privateKey}`);
    handleCloseImportDialog()

    // {'addresses': '' , 'balance': number}
    getWalletInfo(address)
    .then((response) => {
      setBalance(response.data.balance)
      setLoading(false);
    })
    .catch(() => setLoading(false));
  };


  const signTx =  (tx) => {
    console.log(`sign TX ${tx.inputs.length}`)
    tx.inputs = tx.inputs.map(async (txin, index) => {
      txin.signature = await MyCrypto.sign(tx.id,MyCrypto.pemToHex(privateKey))
      console.log(txin.signature)
      return txin;
    });
    // 签名之后添加自己的公钥
    tx.publicKey = address
    return tx
  };
  const handleTransfer = () => {
    if (!amount || !receiver) {
      setErrorMessage("请填写所有字段。");
      return;
    }

    setTransferLoading(true);
    transfer(address, receiver, amount)
      .then((response) => {
        setSuccessMessage("转账成功！");
        const signedTx = signTx(response.data)

        sendSignedTx(signedTx)
          .then((response) => {})
          .catch((err) => {})

        
        setTransactionId(response.data.id); // 假设 API 返回交易ID
        setAmount("");
        setReceiver("");
        setTransferLoading(false);
      })
      .catch((err) => {
        setErrorMessage(`转账失败。请重试。 `);
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
            <div>
              <Typography variant="h6">
                钱包余额: {balance} coin
              </Typography>

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
                  value={receiver}
                  onChange={(e) => setReceiver(e.target.value)}
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
          <Input
            type="file"
            onChange={handlePublicKeyUpload}
            fullWidth
            margin="normal"
            inputProps={{ accept: '.pem' }}
          />
          <TextField
            label="公钥"
            value={importPublicKey}
            onChange={(e) => setImportPublicKey(e.target.value)}
            fullWidth
            margin="normal"
          />
          <Input
            type="file"
            onChange={handlePrivateKeyUpload}
            fullWidth
            margin="normal"
            inputProps={{ accept: '.pem' }}
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
                {publicKey}
              </Typography>
              <IconButton
                onClick={() => handleCopy(publicKey)}
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
                {privateKey}
              </Typography>
              <IconButton
                onClick={() => handleCopy(privateKey)}
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
