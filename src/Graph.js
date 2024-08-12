// src/Graph.js
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import axios from 'axios';

const Graph = () => {
    const svgRef = useRef();

    useEffect(() => {
        // Fetch data from the API
        axios.get('http://localhost:8080/api/v1/dummy')
            .then(response => {
                const { nodes, links } = response.data;

                const svg = d3.select(svgRef.current)
                    .attr('width', 600)
                    .attr('height', 400);

                const simulation = d3.forceSimulation(nodes)
                    .force('link', d3.forceLink(links).id(d => d.id).distance(100))
                    .force('charge', d3.forceManyBody().strength(-200))
                    .force('center', d3.forceCenter(300, 200));

                const link = svg.append('g')
                    .attr('class', 'links')
                    .selectAll('line')
                    .data(links)
                    .enter()
                    .append('line')
                    .attr('stroke-width', 2)
                    .attr('stroke', 'gray');

                const node = svg.append('g')
                    .attr('class', 'nodes')
                    .selectAll('circle')
                    .data(nodes)
                    .enter()
                    .append('circle')
                    .attr('r', 10)
                    .attr('fill', 'blue')
                    .call(d3.drag()
                        .on('start', dragStarted)
                        .on('drag', dragged)
                        .on('end', dragEnded));

                node.append('title')
                    .text(d => d.name);

                simulation.on('tick', () => {
                    link
                        .attr('x1', d => d.source.x)
                        .attr('y1', d => d.source.y)
                        .attr('x2', d => d.target.x)
                        .attr('y2', d => d.target.y);

                    node
                        .attr('cx', d => d.x)
                        .attr('cy', d => d.y);
                });

                function dragStarted(event, d) {
                    if (!event.active) simulation.alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                }

                function dragged(event, d) {
                    d.fx = event.x;
                    d.fy = event.y;
                }

                function dragEnded(event, d) {
                    if (!event.active) simulation.alphaTarget(0);
                    d.fx = null;
                    d.fy = null;
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, []);

    return <svg ref={svgRef}></svg>;
};

export default Graph;
