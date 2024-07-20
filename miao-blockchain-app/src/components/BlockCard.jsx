import React, { useState } from 'react';
import { Card, CardContent, Typography, Button, Collapse, Divider, Chip, Box } from '@mui/material';
import { Link } from 'react-router-dom';

function BlockCard({ block }) {
    const [open, setOpen] = useState(false);

    const handleExpandClick = () => {
        setOpen(!open);
    };

    const truncate = (str, length = 20) => str.length > length ? `${str.slice(0, 10)}...${str.slice(-10)}` : str;

    return (
        <Card style={{ marginBottom: '20px', borderRadius: '12px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' }}>
            <CardContent>
                <Typography variant="h6" component="div" style={{ fontWeight: 'bold', marginBottom: '10px' }}>
                    Block #{block.index}
                </Typography>
                <Box mb={1} display="flex" alignItems="center">
                    <Typography variant="body2" color="textSecondary" style={{ fontWeight: 'bold', width: '150px' }}>
                        Previous Hash:
                    </Typography>
                    <Chip
                        label={<Link to={`/block/${block.previoushash}`} style={{ textDecoration: 'none', color: '#1976d2' }}>{truncate(block.previoushash)}</Link>}
                        style={{ marginLeft: '8px', backgroundColor: '#e3f2fd', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    />
                </Box>
                <Box mb={1} display="flex" alignItems="center">
                    <Typography variant="body2" color="textSecondary" style={{ fontWeight: 'bold', width: '150px' }}>
                        Timestamp:
                    </Typography>
                    <Chip
                        label={block.timestamp}
                        color="primary"
                        style={{ marginLeft: '8px', backgroundColor: '#e3f2fd', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    />
                </Box>
                <Box mb={2} display="flex" alignItems="center">
                    <Typography variant="body2" color="textSecondary" style={{ fontWeight: 'bold', width: '150px' }}>
                        Hash:
                    </Typography>
                    <Chip
                        label={<Link to={`/block/${block.hash}`} style={{ textDecoration: 'none', color: '#1976d2' }}>{truncate(block.hash)}</Link>}
                        style={{ marginLeft: '8px', backgroundColor: '#e3f2fd', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    />
                </Box>
                <Button
                    onClick={handleExpandClick}
                    style={{ marginTop: '10px' }}
                    variant="outlined"
                    color="primary"
                >
                    {open ? 'Show Less' : 'Show More'}
                </Button>
                <Collapse in={open}>
                    <Divider style={{ margin: '10px 0' }} />
                    <Typography variant="body2" color="textSecondary" style={{ fontWeight: 'bold', marginBottom: '10px' }}>
                        Data:
                    </Typography>
                    {Array.isArray(block.data) && block.data.length > 0 ? (
                        block.data.map((transaction, index) => (
                            <Box key={transaction.id || index} mb={2} padding={2} border={1} borderColor="divider" borderRadius="8px">
                                <Typography variant="body2" color="textSecondary" style={{ fontWeight: 'bold', marginBottom: '10px' }}>
                                    Transaction #{index + 1}
                                </Typography>
                                <Box mb={1} display="flex" alignItems="center">
                                    <Typography variant="body2" color="textSecondary" style={{ fontWeight: 'bold', width: '150px' }}>
                                        ID:
                                    </Typography>
                                    <Chip
                                        label={<Link to={`/transaction/${transaction.id}`} style={{ textDecoration: 'none', color: '#1976d2' }}>{truncate(transaction.id)}</Link>}
                                        style={{ marginLeft: '8px', backgroundColor: '#e3f2fd', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                    />
                                </Box>
                                <Box mb={1} display="flex" alignItems="center">
                                    <Typography variant="body2" color="textSecondary" style={{ fontWeight: 'bold', width: '150px' }}>
                                        Hash:
                                    </Typography>
                                    <Chip
                                        label={<Link to={`/transaction/${transaction.hash || 'none'}`} style={{ textDecoration: 'none', color: '#1976d2' }}>{truncate(transaction.hash || 'N/A')}</Link>}
                                        style={{ marginLeft: '8px', backgroundColor: '#e3f2fd', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                    />
                                </Box>
                                <Box mb={1} display="flex" alignItems="center">
                                    <Typography variant="body2" color="textSecondary" style={{ fontWeight: 'bold', width: '150px' }}>
                                        Inputs:
                                    </Typography>
                                    <Box>
                                        {transaction.inputs.length > 0 ? (
                                            transaction.inputs.map((input, inputIndex) => (
                                                <Box key={inputIndex} mb={1}>
                                                    <Box display="flex" alignItems="center">
                                                        <Typography variant="body2" color="textSecondary" style={{ fontWeight: 'bold', width: '150px' }}>
                                                            TxOutID:
                                                        </Typography>
                                                        <Chip
                                                            label={truncate(input.txOutId)}
                                                            color="default"
                                                            style={{ marginLeft: '8px', backgroundColor: '#f1f8e9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                                        />
                                                    </Box>
                                                    <Box display="flex" alignItems="center">
                                                        <Typography variant="body2" color="textSecondary" style={{ fontWeight: 'bold', width: '150px' }}>
                                                            TxOutIndex:
                                                        </Typography>
                                                        <Chip
                                                            label={input.txOutIndex}
                                                            color="default"
                                                            style={{ marginLeft: '8px', backgroundColor: '#f1f8e9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                                        />
                                                    </Box>
                                                    <Box display="flex" alignItems="center">
                                                        <Typography variant="body2" color="textSecondary" style={{ fontWeight: 'bold', width: '150px' }}>
                                                            Signature:
                                                        </Typography>
                                                        <Chip
                                                            label={truncate(input.signature)}
                                                            color="default"
                                                            style={{ marginLeft: '8px', backgroundColor: '#f1f8e9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                                        />
                                                    </Box>
                                                </Box>
                                            ))
                                        ) : (
                                            <Typography variant="body2" color="textSecondary">
                                                No Inputs
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                                <Box mb={1} display="flex" alignItems="center">
                                    <Typography variant="body2" color="textSecondary" style={{ fontWeight: 'bold', width: '150px' }}>
                                        Outputs:
                                    </Typography>
                                    <Box>
                                        {transaction.outputs.length > 0 ? (
                                            transaction.outputs.map((output, outputIndex) => (
                                                <Box key={outputIndex} mb={1}>
                                                    <Box display="flex" alignItems="center">
                                                        <Typography variant="body2" color="textSecondary" style={{ fontWeight: 'bold', width: '150px' }}>
                                                            Address:
                                                        </Typography>
                                                        <Chip
                                                            label={<Link to={`/address/${output.address}`} style={{ textDecoration: 'none', color: '#1976d2' }}>{truncate(output.address)}</Link>}
                                                            style={{ marginLeft: '8px', backgroundColor: '#e3f2fd', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                                        />
                                                    </Box>
                                                    <Box display="flex" alignItems="center">
                                                        <Typography variant="body2" color="textSecondary" style={{ fontWeight: 'bold', width: '150px' }}>
                                                            Amount:
                                                        </Typography>
                                                        <Chip
                                                            label={output.amount}
                                                            color="default"
                                                            style={{ marginLeft: '8px', backgroundColor: '#f1f8e9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                                        />
                                                    </Box>
                                                </Box>
                                            ))
                                        ) : (
                                            <Typography variant="body2" color="textSecondary">
                                                No Outputs
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                        ))
                    ) : (
                        <Typography variant="body2" color="textSecondary">
                            No transactions available
                        </Typography>
                    )}
                </Collapse>
            </CardContent>
        </Card>
    );
}

export default BlockCard;
