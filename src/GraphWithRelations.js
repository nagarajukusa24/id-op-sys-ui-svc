import React, { useEffect } from 'react';
import * as d3 from 'd3';

const GraphWithRelations = ({ nodes, links }) => {
    useEffect(() => {
        if (nodes.length > 0 && links.length > 0) {
            renderGraphForRelations(nodes, links);
        }
    }, [nodes, links]);

    const renderGraphForRelations = (nodes, links) => {
        const svg = d3.select("#graphWithRelations");
        svg.selectAll("*").remove();

        const width = +svg.attr("width");
        const height = +svg.attr("height");

        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id).distance(100))
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collide", d3.forceCollide().radius(20));

        const link = svg.append("g")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(links)
            .enter().append("line")
            .attr("stroke-width", 1)
            .attr("stroke", "#aaa");

        const linkText = svg.append("g")
            .attr("class", "link-label")
            .selectAll("text")
            .data(links)
            .enter().append("text")
            .attr("dy", -3)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .text(d => d.type); // Display the relationship type

        const node = svg.append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .selectAll("circle")
            .data(nodes)
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
            .text(d => `${d.name}\nID: ${d.ip}`);


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
        <svg id="graphWithRelations" width="600" height="400"></svg>
    );
};

export default GraphWithRelations;
