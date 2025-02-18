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
        const graphDataString = query.get("data");

        try {
            if (graphDataString) {
                const decodedString = Buffer.from(graphDataString, "base64").toString("utf-8");
                const parsedData = JSON.parse(decodedString);

                adjustNodeDistances(parsedData);
                setGraphData(parsedData);
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

    // ✅ 배경을 연회색으로 설정하고, 크기 자동 조절
    const graphOptions = {
        layout: {
            layoutName: "force",
            maxLayoutTimes: 3000,
            linkDistance: (link) => calculateDistance(link), // 유사도 기반 거리 설정
        },
        defaultNodeShape: 0,
        defaultLineShape: 1,
        defaultNodeColor: "#409EFF",
        defaultExpandHolderPosition: "hide",
        backgroundColor: "#f5f5f5", // 연회색 배경
    };

    const handleNodeClick = (node) => {
        setSelectedNode(node);
    };

    // ✅ 유사도 기반으로 노드 거리 조정
    const adjustNodeDistances = (data) => {
        data.lines.forEach((line) => {
            line.similarity = parseFloat(line.text.replace("유사도: ", "").replace("%", "")) / 100;
        });
    };

    // ✅ 유사도 기반으로 link 거리 계산 (유사도 클수록 가까움)
    const calculateDistance = (link) => {
        const maxDistance = 250; // 최대 거리
        const minDistance = 100; // 최소 거리
        return minDistance + (1 - link.similarity) * (maxDistance - minDistance);
    };

    // ✅ 창 닫기 기능
    const closePage = () => {
        window.close();
    };

    return (
        <div className="network-graph-container">
            {/* 📌 상단 헤더 */}
            <div className="graph-header">
                채널 유사도 네트워크
            </div>

            {/* 📌 그래프 및 상세 정보 */}
            <div className="graph-content">
                {/* 📌 네트워크 그래프 */}
                <div className="graph-area">
                    {graphData ? (
                        <div className="graph-wrapper">
                            <RelationGraph ref={graphRef} options={graphOptions} onNodeClick={handleNodeClick} />
                        </div>
                    ) : (
                        <p>데이터가 없습니다.</p>
                    )}
                </div>

                {/* 📌 클릭한 노드의 정보 + 닫기 버튼 */}
                <div className="node-details">
                    <button className="close-btn" onClick={closePage}>✖</button>
                    <h3>채널 상세 정보</h3>
                    {selectedNode ? (
                        <div className="node-info">
                            <p><strong>채널명:</strong> {selectedNode.text}</p>
                            {graphData.lines
                                .filter((line) => line.to === selectedNode.id)
                                .map((line, index) => (
                                    <p key={index}><strong>유사도:</strong> {line.text}</p>
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