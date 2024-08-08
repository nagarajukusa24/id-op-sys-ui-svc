import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as d3 from 'd3';

function App() {
    const [nodes, setNodes] = useState([]);

    // Fetch nodes from the backend API
    useEffect(() => {
        axios.get('http://localhost:8080/api/v1/fetch-nodes')
            .then(response => {
                setNodes(response.data);
                renderGraph(response.data);
            })
            .catch(error => {
                console.error("There was an error fetching the nodes!", error);
            });
    }, []);

    const renderGraph = (nodesData) => {
        const svg = d3.select("svg");
        svg.selectAll("*").remove(); // Clear previous graph

        const width = +svg.attr("width");
        const height = +svg.attr("height");

        const simulation = d3.forceSimulation(nodesData)
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(width / 2, height / 2));

        const node = svg.append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .selectAll("circle")
            .data(nodesData)
            .enter().append("circle")
            .attr("r", 20)
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
            <h1>Graph Nodes</h1>
            <ul>
                {nodes.map((node, index) => (
                    <li key={index}>
                        <strong>ID:</strong> {node.ip} <br />
                        <strong>Name:</strong> {node.name}
                    </li>
                ))}
            </ul>
            <svg width="600" height="400"></svg> {/* This SVG will be used for D3.js rendering */}
        </div>
    );
}

export default App;
