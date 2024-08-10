import React from 'react';

const TotalCount = ({ nodeCount, relationCount }) => (
    <div>
        <h1>Total Nodes in Graph Database: {nodeCount}</h1>
        <h1>Total Relations in Graph Database: {relationCount}</h1>
    </div>
);

export default TotalCount;
