// ForceGraph2D를 사용하는 유사도 그래프 컴포넌트.
import React, {useEffect, useRef, useState} from "react";
import ForceGraph2D from "react-force-graph-2d";
import axiosInstance from "../axiosConfig";
import {Drawer, Table, TableBody, TableCell, TableContainer, TableRow, Paper} from "@mui/material";
import styles from "../css/components/MigrationTest.module.css";
import GraphErrorModal from "./GraphErrorModal";

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
    const [fetchError, setFetchError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const openedFromSidebar = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("from") === "sidebar";

    useEffect(() => {
        const graphDataRef = {nodes: [], links: []};
        const nodeMapRef = {
            post: new Map(),
            channel: new Map(),
            argot: new Map(),
            drug: new Map(),
            globalArgot: new Map(),
        };

        function ensureNode(map, key, nodeBuilder) {
            if (!map.has(key)) {
                const node = nodeBuilder();
                map.set(key, node);
                graphDataRef.nodes.push(node);
                return node;
            }
            return map.get(key);
        }

        async function* ndjsonStream(url) {
            const res = await fetch(url, {credentials: "include"});
            if (!res.ok) throw new Error("Failed to fetch posts stream");
            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let {value: chunk, done: readerDone} = await reader.read();
            let buffer = "";
            while (!readerDone) {
                buffer += decoder.decode(chunk, {stream: true});
                let lines = buffer.split("\n");
                buffer = lines.pop();
                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        yield JSON.parse(line);
                    } catch (err) {
                    }
                }
                ({value: chunk, done: readerDone} = await reader.read());
            }
            if (buffer.trim()) {
                try {
                    yield JSON.parse(buffer);
                } catch (err) {
                }
            }
        }

        async function buildDrugNodes(drugs) {
            for (const drug of drugs) {
                ensureNode(nodeMapRef.drug, drug.drugBankId, () => ({
                    id: drug.drugBankId,
                    label: "Drug",
                    name: drug.name || drug.drugBankId,
                    color: "#FF5722"
                }));
            }
        }

        async function buildChannelNodes(channels) {
            for (const channel of channels) {
                const channelId = channel.channelId || channel.id;
                ensureNode(nodeMapRef.channel, channelId, () => ({
                    id: channelId,
                    label: "Channel",
                    name: channel.title,
                    color: "#4CAF50",
                    title: channel.title,
                    username: channel.username,
                    status: channel.status,
                    promotedCount: channel.promotedCount
                }));
                for (const argot of channel.sellsArgots || []) {
                    const argotName = argot.name;
                    const argotNodeId = `argot:${argotName}`;
                    ensureNode(nodeMapRef.globalArgot, argotName, () => ({
                        id: argotNodeId,
                        label: "Argot",
                        name: argotName,
                        color: "#000"
                    }));
                    nodeMapRef.argot.set(argotNodeId, nodeMapRef.globalArgot.get(argotName));
                    graphDataRef.links.push({source: channelId, target: argotNodeId, label: "SELLS"});
                    for (const drug of argot.refersDrugs || []) {
                        if (drug.drugBankId) {
                            ensureNode(nodeMapRef.drug, drug.drugBankId, () => ({
                                id: drug.drugBankId,
                                label: "Drug",
                                name: drug.name || drug.drugBankId,
                                color: "#FF5722"
                            }));
                            graphDataRef.links.push({
                                source: argotNodeId,
                                target: drug.drugBankId,
                                label: "REFERS_TO"
                            });
                        }
                    }
                }
            }
        }

        async function buildArgotNodes(argots) {
            for (const argot of argots) {
                const argotName = argot.name;
                const argotNodeId = `argot:${argotName}`;
                ensureNode(nodeMapRef.globalArgot, argotName, () => ({
                    id: argotNodeId,
                    label: "Argot",
                    name: argotName,
                    color: "#000"
                }));
                nodeMapRef.argot.set(argotNodeId, nodeMapRef.globalArgot.get(argotName));
                for (const drug of argot.refersDrugs || []) {
                    if (drug.drugBankId) {
                        ensureNode(nodeMapRef.drug, drug.drugBankId, () => ({
                            id: drug.drugBankId,
                            label: "Drug",
                            name: drug.name || drug.drugBankId,
                            color: "#FF5722"
                        }));
                        graphDataRef.links.push({
                            source: argotNodeId,
                            target: drug.drugBankId,
                            label: "REFERS_TO"
                        });
                    }
                }
            }
        }

        async function buildPostNodes(postsStream) {
            for await (const post of postsStream) {
                const {
                    postId,
                    content,
                    title,
                    discoveredAt,
                    siteName,
                    updatedAt,
                    link,
                    similarPosts = [],
                    similar = [],
                    promotesChannels = [],
                    cluster = -1
                } = post;
                ensureNode(nodeMapRef.post, postId, () => ({
                    id: postId,
                    label: "Post",
                    cluster,
                    color: getClusterColor(cluster),
                    name: siteName || (content?.slice(0, 20)),
                    siteName,
                    title,
                    discoveredAt,
                    updatedAt,
                    content,
                    link
                }));
                const similars = Array.isArray(similarPosts) && similarPosts.length > 0 ? similarPosts : similar;
                for (const similarItem of (similars || [])) {
                    ensureNode(nodeMapRef.post, similarItem.postId, () => ({
                        id: similarItem.postId,
                        label: "Post",
                        cluster: similarItem.cluster ?? -1,
                        color: getClusterColor(similarItem.cluster ?? -1),
                        name: similarItem.siteName || similarItem.content?.slice(0, 20),
                        siteName: similarItem.siteName,
                        title: similarItem.title,
                        createdAt: similarItem.discoveredAt,
                        updatedAt: similarItem.updatedAt,
                        content: similarItem.content,
                        link: similarItem.link
                    }));
                    graphDataRef.links.push({
                        source: postId,
                        target: similarItem.postId,
                        label: "SIMILAR"
                    });
                }
                for (const promotes of (promotesChannels || [])) {
                    const channelObj = promotes.channel || promotes;
                    const channelId = channelObj.channelId || channelObj.id;
                    ensureNode(nodeMapRef.channel, channelId, () => ({
                        id: channelId,
                        label: "Channel",
                        name: channelObj.title,
                        color: "#4CAF50",
                        title: channelObj.title,
                        username: channelObj.username,
                        status: channelObj.status,
                        promotedCount: channelObj.promotedCount
                    }));
                    graphDataRef.links.push({
                        source: postId,
                        target: channelId,
                        label: "PROMOTES"
                    });
                }
            }
        }

        const fetchData = async () => {
            try {
                const [channelsRes, argotsRes, drugsRes] = await Promise.all([
                    axiosInstance.get(`${process.env.REACT_APP_API_BASE_URL}/neo4j/channels/depth`, {withCredentials: true}),
                    axiosInstance.get(`${process.env.REACT_APP_API_BASE_URL}/neo4j/argots/depth`, {withCredentials: true}),
                    axiosInstance.get(`${process.env.REACT_APP_API_BASE_URL}/neo4j/drugs`, {withCredentials: true})
                ]);
                const catalogRes = await axiosInstance.get(`${process.env.REACT_APP_API_BASE_URL}/channel/all`, {withCredentials: true});
                const catalogMap = new Map();
                catalogRes.data.data.forEach((ch) => {
                    if (ch.catalog?.description) {
                        catalogMap.set(ch.id, ch.catalog.description);
                    }
                });
                setChannelCatalogMap(catalogMap);
                await buildDrugNodes(drugsRes.data.data || []);
                await buildChannelNodes(channelsRes.data.data || []);
                await buildArgotNodes(argotsRes.data.data || []);
                const postsStream = ndjsonStream(`${process.env.REACT_APP_API_BASE_URL}/neo4j/posts/streamed`);
                await buildPostNodes(postsStream);
                const nodeMap = new Map();
                for (const n of graphDataRef.nodes) {
                    if (!nodeMap.has(n.id)) nodeMap.set(n.id, n);
                }
                const finalNodes = Array.from(nodeMap.values());
                const validIds = new Set(finalNodes.map((n) => n.id));
                const filteredLinks = graphDataRef.links.filter(link => {
                    const sourceId = typeof link.source === "object" ? link.source?.id : link.source;
                    const targetId = typeof link.target === "object" ? link.target?.id : link.target;
                    return validIds.has(sourceId) && validIds.has(targetId);
                });
                const cleanedLinks = filteredLinks.map(link => ({
                    source: typeof link.source === "object" ? link.source?.id : link.source,
                    target: typeof link.target === "object" ? link.target?.id : link.target,
                    label: link.label
                }));
                setGraphData({nodes: finalNodes, links: cleanedLinks});
                setOriginalGraphData({nodes: finalNodes, links: cleanedLinks});
                if (openedFromSidebar && (!finalNodes || finalNodes.length === 0)) {
                    setErrorMessage("표시할 데이터가 없습니다.");
                    setFetchError(true);
                }
            } catch (err) {
                setErrorMessage("네트워크 오류로 인해 그래프 생성에 실패했습니다.");
                setFetchError(true);
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
                                            <TableCell style={{fontWeight: 'bold'}}>Title</TableCell>
                                            <TableCell
                                                style={{wordBreak: 'break-word'}}>{selectedNode?.title}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell style={{fontWeight: 'bold'}}>Discovered At</TableCell>
                                            <TableCell
                                                style={{wordBreak: 'break-word'}}>{selectedNode?.discoveredAt}</TableCell>
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
            <GraphErrorModal
                open={fetchError}
                message={errorMessage}
                onClose={() => window.close()}
            />
        </div>
    );
};

export default MigrationTest;
