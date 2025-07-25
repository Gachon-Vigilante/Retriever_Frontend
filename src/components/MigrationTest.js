// ForceGraph2D를 사용하는 유사도 그래프 컴포넌트.
import React, {useEffect, useRef, useState} from "react";
import ForceGraph2D from "react-force-graph-2d";
import axios from "axios";
import {Drawer, Table, TableBody, TableCell, TableContainer, TableRow, Paper} from "@mui/material";
import styles from "../css/components/MigrationTest.module.css";
import ToolTip from "./ToolTip";

const clusterColors = [
    "#ff4d4f", "#40a9ff", "#ffd666", "#73d13d", "#9254de",
    "#69c0ff", "#ff85c0", "#ff7a45", "#95de64", "#ffd6e7",
    "#36cfc9", "#ffc069", "#ffadd2", "#bae637", "#5cdbd3",
    "#ffec3d", "#597ef7", "#ff9c6e", "#7cb305", "#ffa39e"
];

const getClusterColor = (cluster) => {
    if (cluster === -1) return "#fffff0";
    return clusterColors[cluster % clusterColors.length];
};

const MigrationTest = () => {
    const [graphData, setGraphData] = useState({nodes: [], links: []});
    const [originalGraphData, setOriginalGraphData] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null);
    const [showRelatedOnly, setShowRelatedOnly] = useState(false);
    const [channelCatalogMap, setChannelCatalogMap] = useState(new Map());
    const fgRef = useRef();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [postsRes, channelsRes, argotsRes, drugsRes] = await Promise.all([
                    axios.get(`${process.env.REACT_APP_API_BASE_URL}/neo4j/posts/streamed`, {withCredentials: true}),
                    axios.get(`${process.env.REACT_APP_API_BASE_URL}/neo4j/channels/depth`, {withCredentials: true}),
                    axios.get(`${process.env.REACT_APP_API_BASE_URL}/neo4j/argots/depth`, {withCredentials: true}),
                    axios.get(`${process.env.REACT_APP_API_BASE_URL}/neo4j/drugs`, {withCredentials: true})
                ]);

                // Fetch all channels to get the catalog descriptions
                const catalogRes = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/channels/all`, {withCredentials: true});
                const catalogMap = new Map();
                catalogRes.data.forEach((ch) => {
                    if (ch.catalog?.description) {
                        catalogMap.set(ch.id, ch.catalog.description);
                    }
                });
                setChannelCatalogMap(catalogMap);

                const nodes = [];
                const links = [];

                const postMap = new Map();
                const channelMap = new Map();
                const argotMap = new Map();
                const drugMap = new Map();

                postsRes.data.forEach((post) => {
                    const {
                        postId,
                        content,
                        siteName,
                        createdAt,
                        updatedAt,
                        link,
                        similarPosts = [],
                        promotesChannels = [],
                        cluster = -1
                    } = post;
                    postMap.set(postId, true);
                    nodes.push({
                        id: postId,
                        label: "Post",
                        cluster,
                        color: getClusterColor(cluster),
                        name: siteName || content?.slice(0, 20),
                        siteName,
                        createdAt,
                        updatedAt,
                        content,
                        link
                    });

                    similarPosts.forEach((similar) => {
                        if (!postMap.has(similar.postId)) {
                            nodes.push({
                                id: similar.postId,
                                label: "Post",
                                cluster: similar.cluster ?? -1,
                                color: getClusterColor(similar.cluster ?? -1),
                                name: similar.siteName || similar.content?.slice(0, 20),
                                siteName: similar.siteName,
                                createdAt: similar.createdAt,
                                updatedAt: similar.updatedAt,
                                content: similar.content,
                                link: similar.link
                            });
                            postMap.set(similar.postId, true);
                        }
                        links.push({source: postId, target: similar.postId, label: "SIMILAR"});
                    });

                    promotesChannels.forEach((promotes) => {
                        const channelObj = promotes.channel || promotes;
                        const channelId = channelObj.id;
                        if (!channelMap.has(channelId)) {
                            channelMap.set(channelId, true);
                            nodes.push({
                                id: channelId,
                                label: "Channel",
                                name: channelObj.title,
                                color: "#4CAF50",
                                title: channelObj.title,
                                username: channelObj.username,
                                status: channelObj.status,
                                promotedCount: channelObj.promotedCount
                            });
                        }
                        links.push({source: postId, target: channelId, label: "PROMOTES"});
                    });
                });

                const globalArgotMap = new Map();

                // 1. Add drugs from drugsRes first
                drugsRes.data.forEach((drug) => {
                    if (!drugMap.has(drug.id)) {
                        drugMap.set(drug.id, true);
                        nodes.push({
                            id: drug.id,
                            label: "Drug",
                            name: drug.name || drug.id,
                            color: "#FF5722"
                        });
                    }
                });

                // 2. Then add channels and their argots/links
                channelsRes.data.forEach((channel) => {
                    channelMap.set(channel.id, true);
                    nodes.push({
                        id: channel.id,
                        label: "Channel",
                        name: channel.title,
                        color: "#4CAF50",
                        title: channel.title,
                        username: channel.username,
                        status: channel.status,
                        promotedCount: channel.promotedCount
                    });

                    channel.sellsArgots?.forEach((argot) => {
                        const argotName = argot.name;
                        if (!globalArgotMap.has(argotName)) {
                            const argotNodeId = `argot:${argotName}`;
                            globalArgotMap.set(argotName, {
                                id: argotNodeId,
                                label: "Argot",
                                name: argotName,
                                color: "#000",
                                drugId: argot.drugId
                            });
                            argotMap.set(argotNodeId, true);
                            nodes.push(globalArgotMap.get(argotName));
                        }
                        const argotNodeId = `argot:${argotName}`;
                        links.push({source: channel.id, target: argotNodeId, label: "SELLS"});

                        // Removed: drug node creation for argot.drugId if not present
                        if (argot.drugId) {
                            links.push({source: argotNodeId, target: argot.drugId, label: "REFERS_TO"});
                        }
                    });
                });


                const validIds = new Set(nodes.map((n) => n.id));
                const filteredLinks = links.filter(link => {
                    const sourceId = typeof link.source === 'object' ? link.source?.id : link.source;
                    const targetId = typeof link.target === 'object' ? link.target?.id : link.target;
                    return validIds.has(sourceId) && validIds.has(targetId);
                });

                const cleanedLinks = filteredLinks.map(link => ({
                    source: typeof link.source === 'object' ? link.source?.id : link.source,
                    target: typeof link.target === 'object' ? link.target?.id : link.target,
                    label: link.label
                }));

                setGraphData({nodes, links: cleanedLinks});
                setOriginalGraphData({nodes, links: cleanedLinks});
            } catch (err) {
                console.error("Graph fetch error:", err);
            }
        };

        fetchData();
    }, []);

    const [tooltipVisible, setTooltipVisible] = useState(false);
    return (
        <div style={{width: "100%", height: "100vh"}}>
            <div style={{position: "absolute", top: "20px", right: "20px", zIndex: 1000}}>
                <button
                    style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        border: "#007bff 1px solid",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0,
                        backgroundColor: "#fff",
                        cursor: "pointer",
                        fontSize: "3rem",
                        color: "#007bff",
                        fontWeight: "bold",
                    }}
                    onClick={() => setTooltipVisible((prev) => !prev)}
                >
                    ?
                </button>
                {tooltipVisible && (
                    <div
                        style={{
                            position: "absolute",
                            top: "calc(100% + 4px)",
                            right: "0",
                            width: "260px",
                            padding: "12px 16px",
                            borderRadius: "8px",
                            backgroundColor: "#fff",
                            boxShadow: "0 0 8px rgba(0,0,0,0.15)",
                            zIndex: 999,
                            fontSize: "14px",
                            wordBreak: "keep-all",
                        }}
                    >
                        <div
                            style={{
                                content: '""',
                                position: "absolute",
                                bottom: "69px",
                                top: "auto",
                                right: "16px",
                                borderWidth: "8px",
                                borderStyle: "solid",
                                borderColor: "transparent transparent #fff transparent",
                            }}
                        />
                        - 웹 게시글, 텔레그램 채널, 판매하는 마약 은어와 마약류 간의 관계를 나타낸 노드-엣지 그래프입니다.<br/><br/>
                        - 웹 게시글 간의 유사성이 일정 수준 이상인 게시글끼리는 선으로 연결되어 있고, 유사성이 높은 게시글끼리 자연스럽게 모여 있습니다.<br/><br/>
                        - 기본적으로 같은 색상의 홍보 게시글 노드는 같은 군집으로 분류되었다는 뜻이지만, 높은 유사성을 보이더라도 서로 다른 군집으로 분류되었을 수 있습니다.<br/><br/>
                        - 노드의 모양에 따른 분류는 다음과 같습니다.<br/><br/>
                        <strong>텔레그램 채널:</strong> 원<br/>
                        <strong>홍보 게시글:</strong> 정사각형<br/>
                        <strong>은어:</strong> 다이아몬드<br/>
                        <strong>마약:</strong> 별
                    </div>
                )}
            </div>
            <ForceGraph2D
                ref={fgRef}
                graphData={graphData}
                linkDistance={150}
                nodeLabel={(node) => `${node.label}: ${node.name}`}
                nodeCanvasObject={(node, ctx, globalScale) => {
                    const label = node.name;
                    const fontSize = 12 / globalScale;
                    ctx.font = `${fontSize}px Sans-Serif`;

                    ctx.fillStyle = node.color;
                    ctx.beginPath();

                    switch (node.label) {
                        case "Post":
                            ctx.rect(node.x - 6, node.y - 6, 12, 12);
                            break;
                        case "Channel":
                            ctx.arc(node.x, node.y, 6, 0, 2 * Math.PI, false);
                            break;
                        case "Argot":
                            ctx.moveTo(node.x, node.y - 6);
                            ctx.lineTo(node.x + 6, node.y);
                            ctx.lineTo(node.x, node.y + 6);
                            ctx.lineTo(node.x - 6, node.y);
                            ctx.closePath();
                            break;
                        case "Drug":
                            const spikes = 5;
                            const outerRadius = 6;
                            const innerRadius = 3;
                            let rot = Math.PI / 2 * 3;
                            let x = node.x;
                            let y = node.y;
                            let step = Math.PI / spikes;

                            ctx.moveTo(x, y - outerRadius);
                            for (let i = 0; i < spikes; i++) {
                                ctx.lineTo(x + Math.cos(rot) * outerRadius, y + Math.sin(rot) * outerRadius);
                                rot += step;
                                ctx.lineTo(x + Math.cos(rot) * innerRadius, y + Math.sin(rot) * innerRadius);
                                rot += step;
                            }
                            ctx.lineTo(x, y - outerRadius);
                            ctx.closePath();
                            break;
                        default:
                            ctx.arc(node.x, node.y, 6, 0, 2 * Math.PI, false);
                    }

                    ctx.fill();
                    ctx.lineWidth = 1.5;
                    ctx.strokeStyle = "#333";
                    ctx.stroke();
                    if (globalScale > 1.5) {
                        ctx.fillStyle = "black";
                        ctx.fillText(label, node.x + 8, node.y + 4);
                    }
                }}
                linkLabel={(link) => link.label}
                linkDirectionalArrowLength={4}
                linkDirectionalArrowRelPos={1}
                linkDirectionalParticles={0}
                linkColor={() => "#999"}
                linkWidth={0.5}
                cooldownTicks={100}
                onNodeClick={(node) => {
                    setSelectedNode(node);
                    if (fgRef.current && node.x !== undefined && node.y !== undefined) {
                        fgRef.current.centerAt(node.x, node.y, 1000);
                        fgRef.current.zoom(4, 1000);
                    }
                }}
            />
            <Drawer anchor="left" open={!!selectedNode} onClose={() => setSelectedNode(null)}>
                <div style={{width: 300, padding: 20, height: '100vh', overflowY: 'auto'}}>
                    <h3>{selectedNode?.label} 정보</h3>

                    <TableContainer component={Paper}>
                        <Table size="small">
                            <TableBody>
                                {selectedNode?.label === "Channel" && (
                                    <>
                                        <TableRow>
                                            <TableCell style={{fontWeight: 'bold'}}>Title</TableCell>
                                            <TableCell
                                                style={{wordBreak: 'break-word'}}>{selectedNode?.title}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell style={{fontWeight: 'bold'}}>Username</TableCell>
                                            <TableCell
                                                style={{wordBreak: 'break-word'}}>{selectedNode?.username}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell style={{fontWeight: 'bold'}}>Status</TableCell>
                                            <TableCell
                                                style={{wordBreak: 'break-word'}}>{selectedNode?.status}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell style={{fontWeight: 'bold'}}>Promoted</TableCell>
                                            <TableCell
                                                style={{wordBreak: 'break-word'}}>{selectedNode?.promotedCount}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell style={{fontWeight: 'bold'}}>Catalog</TableCell>
                                            <TableCell style={{wordBreak: 'break-word', whiteSpace: 'pre-wrap'}}>
                                                {channelCatalogMap.get(selectedNode?.id) || "없음"}
                                            </TableCell>
                                        </TableRow>
                                    </>
                                )}
                                {selectedNode?.label === "Argot" && (
                                    <>
                                        <TableRow>
                                            <TableCell style={{fontWeight: 'bold'}}>Name</TableCell>
                                            <TableCell
                                                style={{wordBreak: 'break-word'}}>{selectedNode?.name}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell style={{fontWeight: 'bold'}}>Drug ID</TableCell>
                                            <TableCell
                                                style={{wordBreak: 'break-word'}}>{selectedNode?.drugId}</TableCell>
                                        </TableRow>
                                    </>
                                )}
                                {selectedNode?.label === "Drug" && (
                                    <>
                                        <TableRow>
                                            <TableCell style={{fontWeight: 'bold'}}>Name</TableCell>
                                            <TableCell
                                                style={{wordBreak: 'break-word'}}>{selectedNode?.name}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell style={{fontWeight: 'bold'}}>Drug ID</TableCell>
                                            <TableCell style={{wordBreak: 'break-word'}}>{selectedNode?.id}</TableCell>
                                        </TableRow>
                                    </>
                                )}
                                {selectedNode?.label === "Post" && (
                                    <>
                                        <TableRow>
                                            <TableCell style={{fontWeight: 'bold'}}>Site</TableCell>
                                            <TableCell
                                                style={{wordBreak: 'break-word'}}>{selectedNode?.siteName}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell style={{fontWeight: 'bold'}}>Created At</TableCell>
                                            <TableCell
                                                style={{wordBreak: 'break-word'}}>{selectedNode?.createdAt}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell style={{fontWeight: 'bold'}}>Cluster</TableCell>
                                            <TableCell
                                                style={{wordBreak: 'break-word'}}>{selectedNode?.cluster}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell style={{fontWeight: 'bold'}}>Updated At</TableCell>
                                            <TableCell
                                                style={{wordBreak: 'break-word'}}>{selectedNode?.updatedAt}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell style={{fontWeight: 'bold'}}>Content</TableCell>
                                            <TableCell
                                                style={{wordBreak: 'break-word'}}>{selectedNode?.content}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell style={{fontWeight: 'bold'}}>Link</TableCell>
                                            <TableCell style={{wordBreak: 'break-word'}}>
                                                <a href={selectedNode?.link} target="_blank" rel="noopener noreferrer">
                                                    {selectedNode?.link}
                                                </a>
                                            </TableCell>
                                        </TableRow>
                                    </>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
                        <button
                            className={styles.modalsButton}
                            onClick={() => {
                                if (!originalGraphData) return;
                                const connectedIds = new Set();
                                const relatedLinks = originalGraphData.links.filter((edge) => {
                                    const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
                                    const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;
                                    if (sourceId === selectedNode.id || targetId === selectedNode.id) {
                                        connectedIds.add(sourceId);
                                        connectedIds.add(targetId);
                                        return true;
                                    }
                                    return false;
                                });

                                const filteredNodes = originalGraphData.nodes.filter((node) =>
                                    connectedIds.has(node.id)
                                );
                                setGraphData({nodes: filteredNodes, links: relatedLinks});
                                setShowRelatedOnly(true);
                                setTimeout(() => {
                                    if (fgRef.current && selectedNode?.x !== undefined && selectedNode?.y !== undefined) {
                                        fgRef.current.centerAt(selectedNode.x, selectedNode.y, 1000);
                                        fgRef.current.zoom(4, 1000);
                                    }
                                }, 300);
                            }}
                        >
                            관련 노드만 보기
                        </button>

                        <button
                            className={styles.modalsButton}
                            onClick={() => {
                                window.location.reload();
                            }}
                        >
                            모든 노드 보기
                        </button>
                    </div>
                </div>
            </Drawer>
        </div>
    );
};

export default MigrationTest;