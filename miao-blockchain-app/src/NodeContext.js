// NodeContext.js
import React, { createContext, useState, useContext } from 'react';

const NodeContext = createContext();

export const useNode = () => useContext(NodeContext);

export const NodeProvider = ({ children }) => {
    const [nodeUrl, setNodeUrl] = useState('http://localhost:3001'); // 默认节点 URL

    return (
        <NodeContext.Provider value={{ nodeUrl, setNodeUrl }}>
            {children}
        </NodeContext.Provider>
    );
};
