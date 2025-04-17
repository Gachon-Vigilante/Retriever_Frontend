import React, { useEffect, useState } from 'react';
import NeoVis from 'neovis.js';

const GraphVisualizer = () => {
    const [selectedNode, setSelectedNode] = useState(null);
    const [selectedEdge, setSelectedEdge] = useState(null);

    useEffect(() => {
        const config = {
            containerId: "viz",
            neo4j: {
                serverUrl: "bolt://localhost:7687",
                serverUser: "neo4j",
                serverPassword: "kbs24rnrals.", // replace with your actual password
                database: "neo4j"
            },
            visConfig: {
                physics: {
                    enabled: true,
                    solver: "forceAtlas2Based", // 또는 "repulsion", "barnesHut"
                    forceAtlas2Based: {
                        gravitationalConstant: -50,  // 노드 간 인력 (음수면 밀어냄)
                        centralGravity: 0.01,        // 중심으로 끌리는 힘
                        springLength: 150,           // 노드 사이 기본 거리
                        springConstant: 0.05,
                        damping: 0.4,
                        avoidOverlap: 1
                    },
                    stabilization: {
                        iterations: 100,
                        fit: true
                    }
                },
                nodes: {
                    shape: "dot",
                    size: 15,
                    scaling: {
                        min: 15,
                        max: 50,
                    },
                    font: {
                        // vadjust: 5,
                        size: 20
                    }
                },
                edges: {
                    arrows: {
                        to: {
                            enabled: true,
                            scaleFactor: 0.5,
                            type: "arrow",
                        }
                    },
                }
            },
            labels: {
                Channel: {
                    label: "title",
                    group: "id",
                    value: "promotedCount",

                },
                Argot: {
                    label: "name",
                    group: "drugId",
                    value: 10,
                    [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
                        static: {
                            shape: "diamond", //
                            // font: { vadjust: -20, size: 16 },
                            // color: { background: "#E6F0FF", border: "#4D88FF" }
                        }
                    }
                },
                Drug: {
                    label: "name",
                    group: "id",
                    value: 10,
                    [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
                        function: {
                            shape: () => "star", //
                            // font: { vadjust: -20, size: 16 },
                            // color: { background: "#E6F0FF", border: "#4D88FF" }
                        }
                    }
                },
                Post: {
                    label: "siteName",
                    group: "channelId",
                    value: 10,
                    [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
                        function: {
                            shape: () => "square", // 원
                            // font: { vadjust: -20, size: 16 },
                            // color: { background: "#E6F0FF", border: "#4D88FF" }
                        }
                    }
                },
            },
            relationships: {
                SELLS: {
                    color: "BLUE",
                    arrows: true,
                    caption: "SELLS",
                    id: (rel) => rel.properties.id
                },
                REFERS_TO: {
                    color: "RED",
                    arrows: true,
                    caption: "REFERS_TO",
                    id: (rel) => rel.properties.id
                },
                PROMOTES: {
                    color: "GREEN",
                    arrows: true,
                    caption: "PROMOTES",
                    id: (rel) => rel.properties.id
                },
            },
            initialCypher: "MATCH (a)-[r]->(b) RETURN a, b, r"
        };

        const viz = new NeoVis(config);

        viz.registerOnEvent("clickNode", (event) => {
            setSelectedNode(event.node);
        });

        viz.registerOnEvent("clickEdge", (event) => {
            setSelectedEdge(event.edge);
        });

        viz.render();

    }, []);

    return (
        <>
            {selectedNode && (
                <div style={{
                    position: 'fixed',
                    top: '20%',
                    left: '30%',
                    width: '40%',
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    padding: '16px',
                    zIndex: 1000,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                }}>
                    <h3>Node Details</h3>
                    <div>
                        <p><strong>노드 ID:</strong> {selectedNode.id}</p>
                        <p><strong>분류:</strong> {selectedNode.group}</p>
                        <p>
                            <strong>
                                {selectedNode.group === "Channel"
                                    ? "채널/게시글명"
                                    : selectedNode.group === "Argot"
                                        ? "은어명"
                                        : "Caption"}
                                :
                            </strong> {selectedNode.caption}
                        </p>
                    </div>
                    <button onClick={() => setSelectedNode(null)}>Close</button>
                </div>
            )}
            {selectedEdge && (
                <div style={{
                    position: 'fixed',
                    top: '60%',
                    left: '30%',
                    width: '40%',
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    padding: '16px',
                    zIndex: 1000,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                }}>
                    <h3>Edge Details</h3>
                    <div>
                        <p><strong>Type:</strong> {selectedEdge.caption}</p>
                        <p><strong>From:</strong> {selectedEdge.from}</p>
                        <p><strong>To:</strong> {selectedEdge.to}</p>
                        <p><strong>Chat IDs:</strong> {selectedEdge.chatIds ? selectedEdge.chatIds.join(', ') : 'N/A'}</p>
                    </div>
                    <button onClick={() => setSelectedEdge(null)}>Close</button>
                </div>
            )}
            <div id="viz" style={{ width: '100%', height: '1200px' }}></div>
        </>
    );
};

export default GraphVisualizer;