import React, { useEffect } from 'react';
import * as d3 from 'd3';

const GraphVisualization = ({ nodesData, linksData, id }) => {
    useEffect(() => {
        const svg = d3.select(`#${id}`);
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
    }, [nodesData, linksData, id]);

    return <svg id={id} width="600" height="400"></svg>;
};

export default GraphVisualization;
