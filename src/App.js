// src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
    const [nodes, setNodes] = useState([]);

    // Fetch nodes from the backend API
    useEffect(() => {
        axios.get('http://localhost:8080/api/v1/fetch-nodes')
            .then(response => {
                setNodes(response.data);
            })
            .catch(error => {
                console.error("There was an error fetching the nodes!", error);
            });
    }, []);

    return (
        <div className="App">
            <h1>Graph Nodes</h1>
            <ul>
                {nodes.map((node, index) => (
                    <li key={index}>
                        <strong>ID:</strong> {node.ip} <br />
                        <strong>Name:</strong> {node.name}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;
