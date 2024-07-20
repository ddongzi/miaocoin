import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CircularProgress, Card, CardContent, Typography } from '@mui/material';
import { getBlockDetail } from '../apiService';

function BlockDetail() {
    const { hash } = useParams();
    const [block, setBlock] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getBlockDetail(hash)
            .then(response => {
                setBlock(response.data[0]);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [hash]);

    if (loading) return <CircularProgress />;

    if (!block) {
        return (
            <div>
                <Typography variant="h5" component="div">
                    Block not found.
                </Typography>
            </div>
        );
    }

    return (
        <Card style={{ marginBottom: '20px', padding: '10px' }}>
            <CardContent>
                <Typography variant="h6" component="div">
                    Block Detail
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    <strong>Block #:</strong> {block.index}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    <strong>Previous Hash:</strong> {block.previoushash}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    <strong>Timestamp:</strong> {block.timestamp}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    <strong>Hash:</strong> {block.hash}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    <strong>Difficulty:</strong> {block.difficulty}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    <strong>Nonce:</strong> {block.nouce}
                </Typography>
                {Array.isArray(block.data) && (
                    <div>
                        <Typography variant="body2" color="textSecondary">
                            <strong>Transactions:</strong>
                        </Typography>
                        {block.data.map((tx, index) => (
                            <Card key={index} style={{ marginBottom: '10px' }}>
                                <CardContent>
                                    <Typography variant="body2" color="textSecondary">
                                        <strong>Transaction ID:</strong> {tx.id}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        <strong>Inputs:</strong>
                                    </Typography>
                                    {tx.inputs.map((input, inputIndex) => (
                                        <div key={inputIndex}>
                                            <Typography variant="body2" color="textSecondary">
                                                <strong>TxOutID:</strong> {input.txOutId}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                <strong>TxOutIndex:</strong> {input.txOutIndex}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                <strong>Signature:</strong> {input.signature}
                                            </Typography>
                                        </div>
                                    ))}
                                    <Typography variant="body2" color="textSecondary">
                                        <strong>Outputs:</strong>
                                    </Typography>
                                    {tx.outputs.map((output, outputIndex) => (
                                        <div key={outputIndex}>
                                            <Typography variant="body2" color="textSecondary">
                                                <strong>Address:</strong> {output.address}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                <strong>Amount:</strong> {output.amount}
                                            </Typography>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
                {typeof block.data === 'string' && (
                    <Typography variant="body2" color="textSecondary">
                        <strong>Data:</strong> {block.data}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
}

export default BlockDetail;
