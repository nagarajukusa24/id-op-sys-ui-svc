import axios from "axios";
import transformData from "./transformData";

const fetchGraphData = () => {
    axios.get('http://localhost:8080/api/v1/fetch-graph')
        .then(response => {
            const fetchedData = response.data;

            const { nodes: nodesData, links: linksData } = transformData(fetchedData);

            setNodes(nodesData);
            setLinks(linksData);
            setGraphData({ nodes: nodesData, links: linksData });
            renderGraphWithRelations(nodesData, linksData);
        })
        .catch(error => {
            console.error("There was an error fetching the graph data!", error);
        });
};