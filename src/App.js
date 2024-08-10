import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as d3 from 'd3';

function App() {

    const [nodes, setNodes] = useState([]);
    const [selectedNode, setSelectedNode] = useState(null);
    const [inputValue, setInputValue] = useState('');
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [nodeCount, setNodeCount] = useState(0);
    const [relationCount, setRelationCount] = useState(0);

    useEffect(() => {
        axios.get('http://localhost:8080/api/v1/fetch-nodes')
            .then(response => {
                setNodes(response.data);
                renderNodes(response.data);
            }).catch(error => {
                console.error("There was an error fetching the nodes!", error);
            });
    }, []);

    const handleSearch = () => {
        axios.get('http://localhost:8080/api/v1/fetch-node', { params: { ip: inputValue } })
            .then(response => {
                const fetchedNodes = response.data;
                setNodes(fetchedNodes);
                renderNodes(fetchedNodes);
                if (fetchedNodes.length > 0) {
                    setSelectedNode(fetchedNodes[0]); // Display details of the first fetched node
                } else {
                    setSelectedNode(null); // Clear selection if no nodes are found
                }
            }).catch(error => {
                console.error("There was an error fetching the node!", error);
            });
    };

    useEffect(() => {
        axios.get('http://localhost:8080/api/v1/fetch-graph')
            .then(response => {
                const fetchedData = response.data;

                const { nodes: nodesData, links: linksData } = transformData(fetchedData);
                setGraphData({ nodes: nodesData, links: linksData });
                renderGraphWithRelations(nodesData, linksData);
            })
            .catch(error => {
                console.error("There was an error fetching the graph data!", error);
            });
    }, []);

    useEffect(() => {
        axios.get('http://localhost:8080/api/v1/node-counter')
            .then(response => {
                setNodeCount(response.data);
            }).catch(error => {
            console.error("There was an error fetching the nodes!", error);
        });
    }, []);

    useEffect(() => {
        axios.get('http://localhost:8080/api/v1/relation-counter')
            .then(response => {
                setRelationCount(response.data);
            }).catch(error => {
            console.error("There was an error fetching the nodes!", error);
        });
    }, []);


    const transformData = (data) => {
        const nodes = [];
        const links = [];
        const nodeMap = new Map();

        const traverse = (node) => {
            if (!nodeMap.has(node.ip)) {
                nodeMap.set(node.ip, node);
                nodes.push({ id: node.ip, label: node.name });
            }
            node.connectedNodes.forEach(connectedNode => {
                if (!nodeMap.has(connectedNode.ip)) {
                    nodeMap.set(connectedNode.ip, connectedNode);
                    nodes.push({ id: connectedNode.ip, label: connectedNode.name });
                }
                links.push({ source: node.ip, target: connectedNode.ip, type: "IS_ALLOWED" });
                traverse(connectedNode);
            });
        };

        data.forEach(rootNode => traverse(rootNode));

        return { nodes, links };
    };


    const handleInputChange = (event) => {
        setInputValue(event.target.value);
    };

    const renderGraphWithRelations = (nodesData, linksData) => {
        const svg = d3.select("#nodeWithRelations");
        svg.selectAll("*").remove(); // Clear previous graph

        const width = +svg.attr("width");
        const height = +svg.attr("height");

        const simulation = d3.forceSimulation(nodesData)
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("link", d3.forceLink(linksData).id(d => d.id).distance(100))
            .force("collide", d3.forceCollide().radius(30).iterations(2));

        const link = svg.append("g")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(linksData)
            .enter().append("line")
            .attr("stroke-width", 1)
            .attr("stroke", "#aaa");

        const linkText = svg.append("g")
            .attr("class", "link-label")
            .selectAll("text")
            .data(linksData)
            .enter().append("text")
            .attr("dy", -3)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .text(d => d.type);

        const node = svg.append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .selectAll("circle")
            .data(nodesData)
            .enter().append("circle")
            .attr("r", 25)
            .attr("fill", "#69b3a2")
            .on("mouseover", (event, d) => {
                d3.select("#tooltip")
                    .style("left", `${event.pageX + 5}px`)
                    .style("top", `${event.pageY - 28}px`)
                    .style("opacity", 1)
                    .html(`<strong>ID:</strong> ${d.id}<br /><strong>Name:</strong> ${d.label}`);
            })
            .on("mouseout", () => {
                d3.select("#tooltip")
                    .style("opacity", 0);
            })
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        node.append("title")
            .text(d => d.label);

        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            linkText
                .attr("x", d => (d.source.x + d.target.x) / 2)
                .attr("y", d => (d.source.y + d.target.y) / 2);

            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
        });

        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.8).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0.5);
            d.fx = null;
            d.fy = null;
        }
    };

    const renderNodes = (nodesData) => {
        const svg = d3.select("#nodes");
        svg.selectAll("*").remove(); // Clear previous graph

        const width = +svg.attr("width");
        const height = +svg.attr("height");

        const simulation = d3.forceSimulation(nodesData)
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collide", d3.forceCollide().radius(30).iterations(2));

        const node = svg.append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .selectAll("circle")
            .data(nodesData)
            .enter().append("circle")
            .attr("r", 25)
            .attr("fill", "#69b3a2")
            .on("mouseover", (event, d) => {
                d3.select("#tooltip")
                    .style("left", `${event.pageX + 5}px`)
                    .style("top", `${event.pageY - 28}px`)
                    .style("opacity", 1)
                    .html(`<strong>ID:</strong> ${d.ip}<br /><strong>Name:</strong> ${d.name}`);
            })
            .on("mouseout", () => {
                d3.select("#tooltip")
                    .style("opacity", 0);
            })
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        node.append("title")
            .text(d => d.name);

        simulation.on("tick", () => {
            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
        });

        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
    };

    return (
        <div className="App">
            <h1>Total Nodes in Graph Database: {nodeCount}</h1>
            <h1>Total Relations in Graph Database: {relationCount}</h1>
            <h1>Graph Nodes</h1>
            <div className="tooltip" id="tooltip"></div>
            <ul>
                {nodes.map((node, index) => (
                    <li key={index}>
                        <strong>IP:</strong> {node.ip} <br />
                        <strong>Name:</strong> {node.name}
                    </li>
                ))}
            </ul>

            <svg id="nodes" width="600" height="400"></svg>

            <h1>Search by IP</h1>
            <input
                type="text"
                placeholder="Enter node IP"
                value={ inputValue }
                onChange={ handleInputChange }
            />
            <button onClick={ handleSearch }>Search</button>

            {selectedNode && (
                <div className="node-details">
                    <h2>Node Details</h2>
                    <p><strong>IP:</strong> {selectedNode.ip}</p>
                    <p><strong>Name:</strong> {selectedNode.name}</p>
                </div>
            )}

            <h2>Graph with Relations</h2>
            <svg id="nodeWithRelations" width="600" height="400"></svg>
        </div>
    );
}

export default App;