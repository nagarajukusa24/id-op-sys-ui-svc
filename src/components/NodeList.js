import React from 'react';

const NodeList = ({ nodes }) => (
    <div>
        <h1>Graph Nodes</h1>
        <ul>
            {nodes.map((node, index) => (
                <li key={index}>
                    <strong>IP:</strong> {node.ip} <br />
                    <strong>Name:</strong> {node.name}
                </li>
            ))}
        </ul>
    </div>
);

export default NodeList;
