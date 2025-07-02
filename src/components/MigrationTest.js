import React, { useEffect, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import styles from "../css/components/MigrationTest.module.css";
import dummyData from "../components/columns/similarity_filtered_100nodes.json";

const colorByGroup = {
    Channel: "#4a90e2",
    Post: "#50e3c2",
    Drug: "#e94e77",
    Argot: "#f5a623",
};

const MigrationTest = () => {
    const [graphData, setGraphData] = useState(dummyData);
    const [selectedNode, setSelectedNode] = useState(null);
    const [selectedLink, setSelectedLink] = useState(null);
    const [showRelatedOnly, setShowRelatedOnly] = useState(false);
    const [originalData] = useState(dummyData);
    const fgRef = useRef();

    const filterRelatedNodes = (nodeId) => {
        const relatedLinks = originalData.links.filter(
            (l) => l.source === nodeId || l.target === nodeId
        );
        const relatedNodeIds = new Set([nodeId]);
        relatedLinks.forEach((l) => {
            relatedNodeIds.add(typeof l.source === "object" ? l.source.id : l.source);
            relatedNodeIds.add(typeof l.target === "object" ? l.target.id : l.target);
        });

        setGraphData({
            nodes: originalData.nodes.filter((n) => relatedNodeIds.has(n.id)),
            links: relatedLinks,
        });
    };

    const resetGraph = () => {
        setGraphData(originalData);
        setShowRelatedOnly(false);
        setSelectedNode(null);
        setSelectedLink(null);
    };

    const handleNodeClick = (node) => {
        setSelectedNode(node);
        if (showRelatedOnly) filterRelatedNodes(node.id);
    };

    const handleLinkClick = (link) => {
        setSelectedLink(link);
    };

    useEffect(() => {
        if (fgRef.current) {
            fgRef.current.d3Force("charge")?.strength(-300);
            fgRef.current.d3Force("collide")?.radius(30);
            fgRef.current.d3Force("link")?.distance((link) => {
                return link.label === "SIMILAR"
                    ? 300 * (1 - (link.score || 0)) + 50
                    : 250;
            });
            fgRef.current.d3Force("link")?.strength((link) => {
                return link.label === "SIMILAR" ? 0.7 : 0.1;
            });
        }
    }, []);

    return (
        <div style={{ height: "100vh", position: "relative" }}>
            <ForceGraph2D
                ref={fgRef}
                graphData={graphData}
                cooldownTicks={300}
                d3AlphaDecay={0.01}
                d3VelocityDecay={0.09}
                linkDirectionalArrowLength={8}
                linkDirectionalArrowRelPos={1}
                onEngineStop={() => fgRef.current.zoomToFit(600)}
                nodeLabel={(node) => `${node.label}: ${node.title || node.name || node.siteName}`}
                linkLabel={(link) => link.label}
                onNodeClick={handleNodeClick}
                onLinkClick={handleLinkClick}
                nodeCanvasObject={(node, ctx, globalScale) => {
                    const label = node.title || node.name || node.siteName;
                    const fontSize = 12 / globalScale;
                    const color = colorByGroup[node.group] || "#999";

                    ctx.beginPath();

                    switch (node.group) {
                        case "Channel":
                            ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI, false);
                            break;
                        case "Post":
                            ctx.rect(node.x - 8, node.y - 8, 16, 16);
                            break;
                        case "Drug":
                            ctx.moveTo(node.x, node.y - 10);
                            ctx.lineTo(node.x + 10, node.y);
                            ctx.lineTo(node.x, node.y + 10);
                            ctx.lineTo(node.x - 10, node.y);
                            ctx.closePath();
                            break;
                        case "Argot":
                            const spikes = 5,
                                outerRadius = 10,
                                innerRadius = 4;
                            let rot = Math.PI / 2 * 3;
                            const step = Math.PI / spikes;
                            ctx.moveTo(node.x, node.y - outerRadius);
                            for (let i = 0; i < spikes; i++) {
                                ctx.lineTo(
                                    node.x + Math.cos(rot) * outerRadius,
                                    node.y + Math.sin(rot) * outerRadius
                                );
                                rot += step;
                                ctx.lineTo(
                                    node.x + Math.cos(rot) * innerRadius,
                                    node.y + Math.sin(rot) * innerRadius
                                );
                                rot += step;
                            }
                            ctx.lineTo(node.x, node.y - outerRadius);
                            ctx.closePath();
                            break;
                        default:
                            ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI, false);
                    }

                    ctx.fillStyle = color;
                    ctx.fill();
                    ctx.strokeStyle = "#333";
                    ctx.lineWidth = 1.2;
                    ctx.stroke();

                    ctx.font = `${fontSize}px Sans-Serif`;
                    ctx.fillStyle = "#000";
                    ctx.fillText(label, node.x + 10, node.y + 4);
                }}
            />

            {selectedNode && (
                <div className={styles.sidebarBackdrop} onClick={() => setSelectedNode(null)}>
                    <div className={`${styles.sidebar} ${styles.sidebarOpen}`} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.sidebarContent}>
                            <h3>노드 정보</h3>
                            <table>
                                <tbody>
                                <tr><td>ID</td><td>{selectedNode.id}</td></tr>
                                <tr><td>분류</td><td>{selectedNode.group}</td></tr>
                                {selectedNode.group === "Channel" && (
                                    <>
                                        <tr><td>Title</td><td>{selectedNode.title}</td></tr>
                                        <tr><td>Username</td><td>{selectedNode.username}</td></tr>
                                        <tr><td>PromotedCount</td><td>{selectedNode.promotedCount}</td></tr>
                                        <tr><td>Status</td><td>{selectedNode.status}</td></tr>
                                    </>
                                )}
                                {selectedNode.group === "Post" && (
                                    <>
                                        <tr><td>사이트</td><td>{selectedNode.siteName}</td></tr>
                                        <tr><td>내용</td><td>{selectedNode.content}</td></tr>
                                        <tr><td>Cluster</td><td>{selectedNode.cluster}</td></tr>
                                    </>
                                )}
                                {selectedNode.group === "Drug" && (
                                    <>
                                        <tr><td>약물이름</td><td>{selectedNode.name}</td></tr>
                                        <tr><td>유형</td><td>{selectedNode.type}</td></tr>
                                    </>
                                )}
                                {selectedNode.group === "Argot" && (
                                    <tr><td>은어명</td><td>{selectedNode.name}</td></tr>
                                )}
                                </tbody>
                            </table>
                            <button className={styles.modalsButton} onClick={() => {
                                setShowRelatedOnly(true);
                                filterRelatedNodes(selectedNode.id);
                            }}>
                                관련 노드만 보기
                            </button>
                            <button className={styles.modalsButton} onClick={resetGraph}>
                                모든 노드 보기
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {selectedLink && (
                <div className={styles.modalOverlay} onClick={() => setSelectedLink(null)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <h3>관계 정보</h3>
                        <p><strong>관계:</strong> {selectedLink.label}</p>
                        <p><strong>From:</strong> {typeof selectedLink.source === "object" ? selectedLink.source.id : selectedLink.source}</p>
                        <p><strong>To:</strong> {typeof selectedLink.target === "object" ? selectedLink.target.id : selectedLink.target}</p>
                        {selectedLink.score && <p><strong>Score:</strong> {selectedLink.score}</p>}
                        <button className={styles.modalsButton} onClick={() => setSelectedLink(null)}>닫기</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MigrationTest;