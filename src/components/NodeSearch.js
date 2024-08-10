import React from 'react';

const NodeSearch = ({ inputValue, handleInputChange, handleSearch, selectedNode }) => (
    <div>
        <h1>Search by IP</h1>
        <input
            type="text"
            placeholder="Enter node IP"
            value={inputValue}
            onChange={handleInputChange}
        />
        <button onClick={handleSearch}>Search</button>

        {selectedNode && (
            <div className="node-details">
                <h2>Node Details</h2>
                <p><strong>IP:</strong> {selectedNode.ip}</p>
                <p><strong>Name:</strong> {selectedNode.name}</p>
            </div>
        )}
    </div>
);

export default NodeSearch;
