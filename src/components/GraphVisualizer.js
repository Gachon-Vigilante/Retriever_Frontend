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
            labels: {
                Channel: {
                    caption: "title"
                },
                Argot: {
                    caption: "name"
                },
                Drug: {
                    caption: "name"
                },
                Organization: {
                    caption: "name"
                },
                Product: {
                    caption: "name"
                }
            },
            relationships: {
                SELLS: {
                    caption: "chatIds", // chat ID 숫자 보이게
                    thickness: "chatIds",
                    color: "blue"
                },
                REFERS_TO: {
                    caption: "chatIds",
                    thickness: "chatIds",
                    color: "orange"
                },
                PROMOTES: {
                    caption: "chatIds",
                    thickness: "chatIds",
                    color: "green"
                },
                PRODUCES: {
                    caption: "chatIds",
                    thickness: "chatIds",
                    color: "purple"
                }
            },
            initialCypher: "MATCH (n)-[r]->(m) RETURN n, r, m LIMIT 1000"
        };

        const viz = new NeoVis(config);
        viz.render();

        viz.registerOnEvent("clickNode", (event) => {
            setSelectedNode(event.node);
            // console.log("Node clicked:", event);
        });

        viz.registerOnEvent("clickEdge", (event) => {
            setSelectedEdge(event.edge);
        });
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
                        <p><strong>Type:</strong> {selectedEdge.label}</p>
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