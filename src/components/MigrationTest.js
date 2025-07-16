import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3-force";
import ForceGraph2D from "react-force-graph-2d";
import styles from "../css/components/MigrationTest.module.css";
import dummyData from "../components/columns/nodetessst.json";


const getNodeColor = (node) => {
    const colors = [
        "#e6194b", "#3cb44b", "#ffe119", "#4363d8", "#f58231",
        "#911eb4", "#46f0f0", "#f032e6", "#bcf60c", "#fabebe",
        "#008080", "#e6beff", "#9a6324", "#fffac8", "#800000",
        "#aaffc3", "#808000", "#ffd8b1", "#000075", "#808080"
    ];

    if (typeof node.cluster === "number" && node.cluster !== -1) {
        return colors[node.cluster % colors.length];
    }

    // If not Post or Channel, inherit color from connected Channel
    if (node.group !== "Channel" && node.group !== "Post") {
        const connectedChannelLink = dummyData.links.find(
            (l) =>
                ((l.source === node.id || (typeof l.source === "object" && l.source.id === node.id)) &&
                 dummyData.nodes.find(n => n.id === l.target && n.group === "Channel")) ||
                ((l.target === node.id || (typeof l.target === "object" && l.target.id === node.id)) &&
                 dummyData.nodes.find(n => n.id === l.source && n.group === "Channel"))
        );

        if (connectedChannelLink) {
            const channelNode = dummyData.nodes.find(n =>
                n.id === ((connectedChannelLink.source === node.id || connectedChannelLink.source?.id === node.id)
                    ? connectedChannelLink.target
                    : connectedChannelLink.source)
            );
            if (channelNode && typeof channelNode.cluster === "number") {
                return colors[channelNode.cluster % colors.length];
            }
        }
    }

    return "#999999"; // fallback color if no cluster or channel found
};

const MigrationTest = () => {
    // Only keep SIMILAR (score >= 0.7), PROMOTES, SELLS, REFERS_TO links and their connected nodes
    const filteredLinks = dummyData.links.filter(
        (link) =>
            (link.label === "SIMILAR" && link.score >= 0.7) ||
            link.label === "PROMOTES" ||
            link.label === "SELLS" ||
            link.label === "REFERS_TO"
    );
    const connectedNodeIds = new Set();
    filteredLinks.forEach(link => {
        connectedNodeIds.add(typeof link.source === "object" ? link.source.id : link.source);
        connectedNodeIds.add(typeof link.target === "object" ? link.target.id : link.target);
    });
    const filteredNodes = dummyData.nodes
        .filter(n => connectedNodeIds.has(n.id))
        .filter(n => !(n.group === "Post" && (n.cluster === undefined || n.cluster === null)))
        .map(n => ({
            ...n,
            cluster: n.cluster ?? -1,
            label: n.title || n.name || n.siteName || n.id
        }));

    const [graphData, setGraphData] = useState({ nodes: filteredNodes, links: filteredLinks });
    const [selectedNode, setSelectedNode] = useState(null);
    const [selectedLink, setSelectedLink] = useState(null);
    const [showRelatedOnly, setShowRelatedOnly] = useState(false);
    const [originalData] = useState({ nodes: filteredNodes, links: filteredLinks });
    const fgRef = useRef();

    const filterRelatedNodes = (nodeId) => {
        const relatedLinks = originalData.links.filter(
            (l) => (typeof l.source === "object" ? l.source.id : l.source) === nodeId ||
                   (typeof l.target === "object" ? l.target.id : l.target) === nodeId
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
            fgRef.current.d3Force("charge")?.strength(-80);
            fgRef.current.d3Force("collide")?.radius(20);

            fgRef.current.d3Force("link")?.distance((link) => {
                // similarity가 높을수록 거리를 짧게, 낮을수록 멀게
                const sim = Math.min(Math.max(link.score ?? 0.7, 0.7), 1);
                const scaled = 50 + (1 - sim) * 300; // 거리 범위: 50~140
                return scaled;
            });
            fgRef.current.d3Force("link")?.strength((link) =>
                link.label === "SIMILAR" ? 2 : 0.1
            );

            // Spread clusters more naturally in opposite directions
            fgRef.current.d3Force("x", d3.forceX((node) => {
                return typeof node.cluster === "number" ? Math.cos(node.cluster) * 500 : 0;
            }).strength(1.5));

            fgRef.current.d3Force("y", d3.forceY((node) => {
                return typeof node.cluster === "number" ? Math.sin(node.cluster) * 500 : 0;
            }).strength(1.5));
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
                nodeLabel={(node) => {
                    const label = node.title || node.name || node.siteName || node.label || "(Unnamed)";
                    return label;
                }}
                linkLabel={(link) => link.label}
                onNodeClick={handleNodeClick}
                onLinkClick={handleLinkClick}
                nodeCanvasObject={(node, ctx, globalScale) => {
                    const label = node.title || node.name || node.siteName;
                    const fontSize = 12 / globalScale;
                    const color = getNodeColor(node);

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