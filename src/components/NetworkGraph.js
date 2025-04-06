import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import RelationGraph from "relation-graph/react";
import { Buffer } from "buffer";
import "../css/components/NetworkGraph.css";

const NetworkGraph = () => {
    const graphRef = useRef(null);
    const location = useLocation();
    const [selectedNode, setSelectedNode] = useState(null);
    const [graphData, setGraphData] = useState(null);

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const encoded = query.get("data");

        try {
            if (encoded) {
                const decoded = Buffer.from(decodeURIComponent(encoded), "base64").toString("utf-8");
                const parsed = JSON.parse(decoded);

                // 👉 유사도 수치 저장
                adjustSimilarity(parsed);
                setGraphData(parsed);
            }
        } catch (error) {
            console.error("Error decoding graph data:", error);
        }
    }, [location.search]);

    useEffect(() => {
        if (graphRef.current && graphData) {
            graphRef.current.setJsonData(graphData);
            graphRef.current.updateView();
        }
    }, [graphData]);

    const graphOptions = {
        layout: {
            layoutName: "force",
            maxLayoutTimes: 3000,
            linkDistance: (link) => calculateDistance(link),
        },
        defaultNodeColor: "#409EFF",
        backgroundColor: "#f5f5f5",
        // 🔽 노드 별 모양을 유형에 따라 설정
        nodeConfig: (node) => {
            if (node.type === "post") {
                return {
                    shape: 2, // shape 2 = 직사각형
                    width: 160,
                    height: 60,
                };
            } else {
                return {
                    shape: 0, // shape 0 = 원형 (기본값)
                    radius: 40,
                };
            }
        },
    };

    const adjustSimilarity = (data) => {
        data.lines.forEach((line) => {
            const match = line.text.match(/(\d+(\.\d+)?)%/);
            line.similarity = match ? parseFloat(match[1]) / 100 : 0.5;
        });
    };

    const calculateDistance = (link) => {
        const maxDistance = 250;
        const minDistance = 100;
        return minDistance + (1 - link.similarity) * (maxDistance - minDistance);
    };

    const closePage = () => window.close();

    return (
        <div className="network-graph-container">
            <div className="graph-header">유사도 네트워크</div>
            <div className="graph-content">
                <div className="graph-area">
                    {graphData ? (
                        <div className="graph-wrapper">
                            <RelationGraph ref={graphRef} options={graphOptions} onNodeClick={setSelectedNode} />
                        </div>
                    ) : (
                        <p>데이터가 없습니다.</p>
                    )}
                </div>
                <div className="node-details">
                    <button className="close-btn" onClick={closePage}>✖</button>
                    <h3>상세 정보</h3>
                    {selectedNode ? (
                        <div className="node-info">
                            <p><strong>이름:</strong> {selectedNode.text}</p>
                            <p><strong>유형:</strong> {selectedNode.type === "post" ? "게시글" : "채널"}</p>
                            {graphData?.lines
                                .filter((line) => line.to === selectedNode.id || line.from === selectedNode.id)
                                .map((line, i) => (
                                    <p key={i}><strong>유사도:</strong> {line.text}</p>
                                ))}
                        </div>
                    ) : (
                        <p>노드를 클릭하여 정보를 확인하세요.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NetworkGraph;