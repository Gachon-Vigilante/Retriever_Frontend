import React, { useEffect, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import axios from "axios";
import { Drawer, Table, TableBody, TableCell, TableContainer, TableRow, Paper } from "@mui/material";
import styles from "../css/components/MigrationTest.module.css";

const clusterColors = [
  "#e6194b", "#3cb44b", "#ffe119", "#4363d8", "#f58231",
  "#911eb4", "#46f0f0", "#f032e6", "#bcf60c", "#fabebe",
  "#008080", "#e6beff", "#9a6324", "#fffac8", "#800000",
  "#aaffc3", "#808000", "#ffd8b1", "#000075", "#808080"
];

const getClusterColor = (cluster) => {
  if (cluster === -1) return "#cccccc";
  return clusterColors[cluster % clusterColors.length];
};

const MigrationTest = () => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [showRelatedOnly, setShowRelatedOnly] = useState(false);
  const fgRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, channelsRes, argotsRes, drugsRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_BASE_URL}/neo4j/posts/streamed`, { withCredentials: true }),
          axios.get(`${process.env.REACT_APP_API_BASE_URL}/neo4j/channels/depth`, { withCredentials: true }),
          axios.get(`${process.env.REACT_APP_API_BASE_URL}/neo4j/argots/depth`, { withCredentials: true }),
          axios.get(`${process.env.REACT_APP_API_BASE_URL}/neo4j/drugs`, { withCredentials: true })
        ]);

        const nodes = [];
        const links = [];

        const postMap = new Map();
        const channelMap = new Map();
        const argotMap = new Map();
        const drugMap = new Map();

        postsRes.data.forEach((post) => {
          const { postId, content, siteName, createdAt, similarPosts = [], promotesChannels = [], cluster = -1 } = post;
          postMap.set(postId, true);
          nodes.push({
            id: postId,
            label: "Post",
            cluster,
            name: siteName || content?.slice(0, 20),
            color: getClusterColor(cluster),
            siteName,
            createdAt,
            content
          });

          similarPosts.forEach((similar) => {
            if (!postMap.has(similar.postId)) {
              nodes.push({
                id: similar.postId,
                label: "Post",
                cluster: similar.cluster ?? -1,
                name: similar.siteName || similar.content?.slice(0, 20),
                color: getClusterColor(similar.cluster ?? -1),
                siteName: similar.siteName,
                createdAt: similar.createdAt,
                content: similar.content
              });
              postMap.set(similar.postId, true);
            }
            links.push({ source: postId, target: similar.postId, label: "SIMILAR" });
          });

          promotesChannels.forEach((channel) => {
            if (!channelMap.has(channel.id)) {
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
            }
            links.push({ source: postId, target: channel.id, label: "PROMOTES" });
          });
        });

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
            const argotId = `${channel.id}:${argot.name}`;
            if (!argotMap.has(argotId)) {
              argotMap.set(argotId, true);
              nodes.push({
                id: argotId,
                label: "Argot",
                name: argot.name,
                color: "#000",
                drugId: argot.drugId
              });
            }
            links.push({ source: channel.id, target: argotId, label: "SELLS" });

            if (argot.drugId && !drugMap.has(argot.drugId)) {
              // Optional: add drug node here only if missing in drugRes pass
              nodes.push({
                id: argot.drugId,
                label: "Drug",
                name: argot.drugName || argot.drugId,
                color: "#FF5722"
              });
              drugMap.set(argot.drugId, true);
            }
            if (argot.drugId) {
              links.push({ source: argotId, target: argot.drugId, label: "REFERS_TO" });
            }
          });
        });

        drugsRes.data.forEach((drug) => {
          if (!drugMap.has(drug.id)) {
            drugMap.set(drug.id, true);
            nodes.push({
              id: drug.id,
              label: "Drug",
              name: drug.name || drug.drugName || drug.id,
              color: "#FF5722"
            });
          }
        });

        // Optionally remove or comment out the argotsRes.data block, since argots are now handled via channels
        // argotsRes.data.forEach((argot) => { ... });

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

        setGraphData({ nodes, links: cleanedLinks });
      } catch (err) {
        console.error("Graph fetch error:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeLabel={(node) => `${node.label}: ${node.name}`}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.name;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;

          ctx.fillStyle = node.color;
          ctx.beginPath();

          switch (node.label) {
            case "Post": // square
              ctx.rect(node.x - 6, node.y - 6, 12, 12);
              break;
            case "Channel": // circle
              ctx.arc(node.x, node.y, 6, 0, 2 * Math.PI, false);
              break;
            case "Argot": // diamond
              ctx.moveTo(node.x, node.y - 6);
              ctx.lineTo(node.x + 6, node.y);
              ctx.lineTo(node.x, node.y + 6);
              ctx.lineTo(node.x - 6, node.y);
              ctx.closePath();
              break;
            case "Drug": // star
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
            default: // fallback to circle
              ctx.arc(node.x, node.y, 6, 0, 2 * Math.PI, false);
          }

          ctx.fill();
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
        linkWidth={1}
        cooldownTicks={100}
        onEngineStop={() => fgRef.current.zoomToFit(400)}
        onNodeClick={(node) => setSelectedNode(node)}
      />
      <Drawer anchor="left" open={!!selectedNode} onClose={() => setSelectedNode(null)}>
        <div style={{ width: 300, padding: 20 }}>
          <h3>{selectedNode?.label} 정보</h3>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <button
              className={styles.modalsButton}
              onClick={() => {
                if (!selectedNode || !fgRef.current) return;
                const allEdges = fgRef.current.graphData.links;
                const allNodes = fgRef.current.graphData.nodes;

                const connectedIds = new Set();
                connectedIds.add(selectedNode.id);
                allEdges.forEach((edge) => {
                  if (edge.source === selectedNode.id) connectedIds.add(edge.target);
                  if (edge.target === selectedNode.id) connectedIds.add(edge.source);
                });

                // hide unrelated nodes and edges
                const updatedNodes = allNodes.map((node) => ({
                  ...node,
                  hidden: !connectedIds.has(node.id),
                }));
                const updatedLinks = allEdges.map((edge) => ({
                  ...edge,
                  hidden: !(connectedIds.has(edge.source) && connectedIds.has(edge.target)),
                }));
                fgRef.current.graphData.nodes = updatedNodes;
                fgRef.current.graphData.links = updatedLinks;
                setGraphData({ nodes: updatedNodes, links: updatedLinks });
                setShowRelatedOnly(true);
              }}
            >
              관련 노드만 보기
            </button>

            <button
              className={styles.modalsButton}
              onClick={() => {
                if (!fgRef.current) return;
                const allNodes = graphData.nodes.map((node) => ({ ...node, hidden: false }));
                const allLinks = graphData.links.map((link) => ({ ...link, hidden: false }));
                fgRef.current.graphData.nodes = allNodes;
                fgRef.current.graphData.links = allLinks;
                setGraphData({ nodes: allNodes, links: allLinks });
                setShowRelatedOnly(false);
              }}
            >
              모든 노드 보기
            </button>
          </div>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableBody>
                {selectedNode?.label === "Channel" && (
                  <>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>{selectedNode?.title}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Username</TableCell>
                      <TableCell>{selectedNode?.username}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Status</TableCell>
                      <TableCell>{selectedNode?.status}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Promoted</TableCell>
                      <TableCell>{selectedNode?.promotedCount}</TableCell>
                    </TableRow>
                  </>
                )}
                {selectedNode?.label === "Argot" && (
                  <>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>{selectedNode?.name || selectedNode?.drugName}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Drug ID</TableCell>
                      <TableCell>{selectedNode?.drugId}</TableCell>
                    </TableRow>
                  </>
                )}
                {selectedNode?.label === "Drug" && (
                  <>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>{selectedNode?.name}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Drug ID</TableCell>
                      <TableCell>{selectedNode?.id}</TableCell>
                    </TableRow>
                  </>
                )}
                {selectedNode?.label === "Post" && (
                  <>
                    <TableRow>
                      <TableCell>Site</TableCell>
                      <TableCell>{selectedNode?.siteName}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Created At</TableCell>
                      <TableCell>{selectedNode?.createdAt}</TableCell>
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </Drawer>
    </div>
  );
};

export default MigrationTest;