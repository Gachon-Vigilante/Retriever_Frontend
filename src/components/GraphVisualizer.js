 "use client"
import "../css/components/GraphVisualizer.css";
import {useEffect, useRef, useState} from "react"
import NeoVis from "neovis.js"

const GraphVisualizer = () => {
    const [selectedNode, setSelectedNode] = useState(null)
    const [selectedEdge, setSelectedEdge] = useState(null)
    const [showRelatedOnly, setShowRelatedOnly] = useState(false)
    const showRelatedOnlyRef = useRef(showRelatedOnly)
    const vizRef = useRef(null)

    // 필터링 함수를 별도로 분리
    const filterRelatedNodes = (nodeId) => {
        if (!vizRef.current || !vizRef.current._network) return

        const allEdges = vizRef.current._network.body.data.edges.get()
        const allNodes = vizRef.current._network.body.data.nodes.get()

        const connectedIds = new Set()
        connectedIds.add(nodeId)

        // 해당 노드와 연결된 모든 노드의 ID를 수집
        allEdges.forEach((edge) => {
            if (edge.from === nodeId) connectedIds.add(edge.to)
            if (edge.to === nodeId) connectedIds.add(edge.from)
        })

        // 노드 업데이트
        const updatedNodes = allNodes.map((node) => ({
            ...node,
            hidden: !connectedIds.has(node.id),
        }))
        vizRef.current._network.body.data.nodes.update(updatedNodes)

        // 엣지 업데이트
        const updatedEdges = allEdges.map((edge) => ({
            ...edge,
            hidden: !(connectedIds.has(edge.from) && connectedIds.has(edge.to)),
        }))
        vizRef.current._network.body.data.edges.update(updatedEdges)
    }

    // 모든 노드와 엣지를 표시하는 함수
    const showAllNodes = () => {
        if (!vizRef.current || !vizRef.current._network) return

        const allNodes = vizRef.current._network.body.data.nodes.get()
        const allEdges = vizRef.current._network.body.data.edges.get()

        const updatedNodes = allNodes.map((node) => ({...node, hidden: false}))
        vizRef.current._network.body.data.nodes.update(updatedNodes)

        const updatedEdges = allEdges.map((edge) => ({...edge, hidden: false}))
        vizRef.current._network.body.data.edges.update(updatedEdges)
    }

    useEffect(() => {
        showRelatedOnlyRef.current = showRelatedOnly
    }, [showRelatedOnly])

    useEffect(() => {
        showRelatedOnlyRef.current = showRelatedOnly

        // 상태가 false로 변경되면 모든 노드 표시
        if (!showRelatedOnly && selectedNode) {
            showAllNodes()
        }
    }, [showRelatedOnly, selectedNode])

    useEffect(() => {
        const config = {
            containerId: "viz",
            neo4j: {
                serverUrl: "bolt://localhost:7687",
                serverUser: "neo4j",
                serverPassword: "kbs24rnrals.", // replace with your actual password
                database: "neo4j",
            },
            visConfig: {
                physics: {
                    enabled: true,
                    solver: "forceAtlas2Based", // 또는 "repulsion", "barnesHut"
                    forceAtlas2Based: {
                        gravitationalConstant: -50, // 노드 간 인력 (음수면 밀어냄)
                        centralGravity: 0.01, // 중심으로 끌리는 힘
                        springLength: 150, // 노드 사이 기본 거리
                        springConstant: 0.05,
                        damping: 0.4,
                        avoidOverlap: 1,
                    },
                    stabilization: {
                        iterations: 100,
                        fit: true,
                    },
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
                        size: 20,
                    },
                },
                edges: {
                    arrows: {
                        to: {
                            enabled: true,
                            scaleFactor: 0.5,
                            type: "arrow",
                        },
                    },
                    font: {
                        size: 20,
                        align: "middle",
                        background: "white",
                        strokeWidth: 0,
                        color: "black"
                    },
                },
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
                        },
                    },
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
                        },
                    },
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
                        },
                    },
                },
            },
            relationships: {
                SELLS: {
                    color: "BLUE",
                    arrows: true,
                    label: "SELLS",
                    id: (rel) => rel.properties.id,
                },
                REFERS_TO: {
                    color: "RED",
                    arrows: true,
                    label: "REFERS_TO",
                    id: (rel) => rel.properties.id,
                },
                PROMOTES: {
                    color: "GREEN",
                    arrows: true,
                    label: "PROMOTES",
                    id: (rel) => rel.properties.id,
                },
            SIMILAR: {
                color: "gray",
                arrows: true,
                label: "SIMILAR",
                id: (rel) => rel.properties.id,
            },
            },
            initialCypher: "MATCH (a)-[r]->(b) RETURN a, b, r",
        }

        vizRef.current = new NeoVis(config)

        vizRef.current.registerOnEvent("clickNode", (event) => {
            const node = event.node
            const labels = node.raw?.labels || []

            const label = labels[0] || "Unknown"
            const properties = node.raw?.properties || {}

            const nodeInfo = {
                id: node.id,
                label: label,
                group: label,
                caption: node.caption,
            }

            if (label === "Channel") {
                nodeInfo.username = properties.username
                nodeInfo.promotedCount = properties.promotedCount
                nodeInfo.status = properties.status
                nodeInfo.labels = labels.join(", ")
            } else if (label === "Post") {
                nodeInfo.siteName = properties.siteName
                nodeInfo.createdAt = properties.createdAt
                nodeInfo.link = properties.link
                nodeInfo.channelId = properties.channelId

                const allNodes = vizRef.current?._network?.body?.data?.nodes?.get?.() || []
                const allEdges = vizRef.current?._network?.body?.data?.edges?.get?.() || []

                // 이 채널이 홍보 중인 Channel 노드 목록
                const promotedChannels = allEdges
                    .filter((e) => e.from === node.id && e.label === "PROMOTES")
                    .map((e) => allNodes.find((n) => n.id === e.to && n.raw?.labels?.includes("Channel")))
                    .filter((n) => n)

                nodeInfo.promotedChannels = promotedChannels.map((c) => ({
                    id: c.id,
                    title: c.raw?.properties?.title,
                    username: c.raw?.properties?.username,
                }))

                // 홍보 중인 Channel이 판매하는 Argot 및 Drug 목록
                const argotDrugPairs = []
                promotedChannels.forEach((channel) => {
                    const sellsEdges = allEdges.filter((e) => e.from === channel.id && e.label === "SELLS")
                    const argots = sellsEdges
                        .map((e) => allNodes.find((n) => n.id === e.to && n.raw?.labels?.includes("Argot")))
                        .filter((n) => n)

                    argots.forEach((argot) => {
                        const refersEdge = allEdges.find((e) => e.from === argot.id && e.label === "REFERS_TO")
                        const drug = refersEdge
                            ? allNodes.find((n) => n.id === refersEdge.to && n.raw?.labels?.includes("Drug"))
                            : null
                        argotDrugPairs.push({
                            argotName: argot.raw?.properties?.name,
                            drugName: drug?.raw?.properties?.name,
                            drugType: drug?.raw?.properties?.type,
                        })
                    })
                })
                nodeInfo.soldDrugs = argotDrugPairs

                // 같은 Channel을 홍보 중인 다른 Post
                const sameChannelPosts = allEdges
                    .filter((e) => e.label === "PROMOTES" && e.to === properties.channelId && e.from !== node.id)
                    .map((e) => allNodes.find((n) => n.id === e.from && n.raw?.labels?.includes("Post")))
                    .filter((n) => n)
                    .map((p) => ({
                        id: p.id,
                        link: p.raw?.properties?.link,
                        siteName: p.raw?.properties?.siteName,
                    }))
                nodeInfo.relatedPosts = sameChannelPosts

                // 유사도 기준으로 가까운 Post 노드 찾기 (similarityScore > 0.7)
                const similarPosts = allEdges
                    .filter(
                        (e) =>
                            e.label === "SIMILAR" &&
                            e.from === node.id &&
                            e.to !== node.id &&
                            e?.raw?.properties?.similarityScore > 0.7,
                    )
                    .map((e) => allNodes.find((n) => n.id === e.to && n.raw?.labels?.includes("Post")))
                    .filter((n) => n)
                    .map((p) => ({
                        id: p.id,
                        link: p.raw?.properties?.link,
                        siteName: p.raw?.properties?.siteName,
                    }))
                nodeInfo.similarPosts = similarPosts

                const channelNode = allEdges
                    .filter((e) => e.label === "PROMOTES" && e.from === node.id)
                    .map((e) => allNodes.find((n) => n.id === e.to && n.raw?.labels?.includes("Channel")))
                    .find((n) => n)

                nodeInfo.promotedChannelTitle = channelNode?.raw?.properties?.title || "Unknown"
            } else if (label === "Drug") {
                nodeInfo.name = properties.name
                nodeInfo.type = properties.type
                nodeInfo.labels = labels.join(", ")
            } else if (label === "Argot") {
                nodeInfo.name = properties.name
                nodeInfo.drugId = properties.drugId
                nodeInfo.labels = labels.join(", ")
            }

            setSelectedNode(nodeInfo)

            // 필터링 로직 수정
            if (showRelatedOnlyRef.current) {
                filterRelatedNodes(node.id)
            }
        })

        vizRef.current.registerOnEvent("clickEdge", (event) => {
            setSelectedEdge({
                from: event.edge.from,
                to: event.edge.to,
                label: event.edge.raw?.type || event.edge.label || "Unknown",
                chatIds: event.edge?.raw?.properties?.chatIds || [],
            })
        })

        vizRef.current.render()
    }, [])

    return (
        <>
            {selectedNode && (
                <div className="sidebar-backdrop" onClick={() => setSelectedNode(null)}>
                  <div
                    className="sidebar sidebar-open"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="sidebar-content">
                      <h3>노드 정보</h3>
                      <p><strong>노드 ID:</strong> {selectedNode.id}</p>
                      <p><strong>분류:</strong> {selectedNode.group}</p>
                      {selectedNode.group === "Channel" ? (
                        <>
                          <p><strong>Username:</strong> {selectedNode.username || "N/A"}</p>
                          <p><strong>PromotedCount:</strong> {selectedNode.promotedCount ?? 0}</p>
                          <p><strong>Status:</strong> {selectedNode.status || "N/A"}</p>
                        </>
                      ) : (
                        <p><strong>{selectedNode.group === "Argot" ? "은어명" : "Caption"}:</strong> {selectedNode.caption}</p>
                      )}
                      {selectedNode.promotedChannelTitle && (
                        <p><strong>홍보 채널명:</strong> {selectedNode.promotedChannelTitle}</p>
                      )}
                      <button className="modals-button" onClick={() => {
                        if (!selectedNode || !vizRef.current) return;
                        const query =
                          selectedNode.group === "Drug"
                            ? `
                              MATCH (d)-[r1]-(a:Argot)
                              WHERE id(d) = ${selectedNode.id}
                              WITH d, r1, a
                              OPTIONAL MATCH (a)-[r2]-(c:Channel)
                              RETURN d AS n, r1 AS r, a AS m
                              UNION
                              MATCH (d)-[r1]-(a:Argot)
                              WHERE id(d) = ${selectedNode.id}
                              WITH a
                              OPTIONAL MATCH (a)-[r2]-(c:Channel)
                              RETURN a AS n, r2 AS r, c AS m
                            `
                            : `MATCH (n)-[r]-(m) WHERE id(n) = ${selectedNode.id} RETURN n, r, m`;
                        vizRef.current.renderWithCypher(query);
                        setShowRelatedOnly(true);
                      }}>관련 노드만 보기</button>
                      <button className="modals-button" onClick={() => {
                        if (!vizRef.current) return;
                        const initialQuery = "MATCH (a)-[r]->(b) RETURN a, b, r";
                        vizRef.current.renderWithCypher(initialQuery);
                        setShowRelatedOnly(false);
                      }}>모든 노드 보기</button>
                    </div>
                  </div>
                </div>
            )}
            {selectedEdge && (
                <div className="modal-overlay" onClick={() => setSelectedEdge(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>관계 정보</h3>
                        <div>
                            <p>
                                <strong>관계 타입:</strong> {selectedEdge.label}
                            </p>
                            <p>
                                <strong>From:</strong> {selectedEdge.from}
                            </p>
                            <p>
                                <strong>To:</strong> {selectedEdge.to}
                            </p>
                        </div>
                        <button className="modals-button" onClick={() => setSelectedEdge(null)}>
                            Close
                        </button>
                    </div>
                </div>
            )}
            <div id="viz" style={{width: "100%", height: "1200px"}}></div>
        </>
    )
}

export default GraphVisualizer

