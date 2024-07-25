import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  Grid,
} from "@mui/material";
import { useApi } from "../apiService";
import { useNode } from "../NodeContext";

function NodeOperations() {
  const { setNodeUrl } = useNode();
  const { getNodeDetails } = useApi();

  const [nodes, setNodes] = useState([]);
  const [nodeDetails, setNodeDetails] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchNodeList();
  }, []);

  const fetchNodeList = () => {
    setNodes([
      { id: 1, url: "http://localhost:3001" },
      { id: 2, url: "http://localhost:3002" },
      { id: 3, url: "http://localhost:3003" },
    ]);
  };

  const handleNodeSelection = (node) => {
    setSelectedNode(node);
    setNodeUrl(node.url);
    getNodeDetails()
      .then((data) => setNodeDetails(data.data))
      .catch(() => setErrorMessage("无法获取节点详细信息。"));
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        节点管理
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                已连接的节点
              </Typography>
              <List>
                {nodes.map((node) => (
                  <ListItem
                    button
                    key={node.id}
                    onClick={() => handleNodeSelection(node)}
                  >
                    <ListItemText primary={`节点 ${node.id}`} />
                    <ListItemText primary={node.url} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        {nodeDetails && (
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6">节点详细信息</Typography>
                <Typography variant="body1">
                  节点 URL: {selectedNode.url}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ wordBreak: "break-all", whiteSpace: "normal" }}
                >
                  矿工地址: {nodeDetails.mineraddress}
                </Typography>
                <Typography variant="body2">区块哈希:</Typography>
                <Box sx={{ maxHeight: 200, overflow: "auto", mt: 1 }}>
                  {nodeDetails.blockhashes.map((hash, index) => (
                    <Typography
                      key={index}
                      variant="body2"
                      sx={{ wordWrap: "break-word", mb: 1 }}
                    >
                      Block#{index} 🤖 {hash}
                    </Typography>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

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
    </Box>
  );
}

export default NodeOperations;
