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
            links.push({ source: node.ip, target: connectedNode.ip, type: "IS_ALLOWED" }); // Add a relationship type
            traverse(connectedNode);
        });
    };

    data.forEach(rootNode => traverse(rootNode));

    return { nodes, links };
};