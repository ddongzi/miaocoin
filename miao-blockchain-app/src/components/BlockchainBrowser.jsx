import React, { useEffect, useState } from 'react';
import { CircularProgress } from '@mui/material';
import Masonry from 'react-masonry-css';
import { getBlocks, useApi } from '../apiService';
import BlockCard from './BlockCard';
import './BlockchainBrowser.css';
import { useNode } from '../NodeContext';

function BlockchainBrowser() {

    const {nodeUrl} = useNode()
    const {getBlocks} = useApi()

    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getBlocks()
            .then(response => {
                setBlocks(response.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <CircularProgress />;

    const breakpointColumnsObj = {
        default: 3,
        1200: 2,
        900: 1
    };

    return (
        <div>
            <h2>Blockchain Browser From Node: {nodeUrl}</h2>
            <Masonry
                breakpointCols={breakpointColumnsObj}
                className="my-masonry-grid"
                columnClassName="my-masonry-grid_column">
                {blocks.map((block) => (
                    <BlockCard key={block.index} block={block} />
                ))}
            </Masonry>
        </div>
    );
}

export default BlockchainBrowser;
