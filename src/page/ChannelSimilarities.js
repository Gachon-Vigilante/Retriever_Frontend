import React, { useState, useEffect } from "react";
import { Buffer } from "buffer"; // Base64 변환용
import Sidebar from "../components/Sidebar";
import "../css/page/ChannelSimilarities.css";
import axios from "axios";

const ChannelSimilarities = () => {
    // 📌 채널 유사도 목록 (channel-similarity 테이블 기반)
    const [channels, setChannels] = useState([]);
    // 📌 현재 클릭하여 선택된 채널 (channel-similarity 문서 1개)
    const [selectedChannel, setSelectedChannel] = useState(null);
    // 📌 유사 채널 상세 리스트 (similarChannels + title/link 등)
    const [similarChannels, setSimilarChannels] = useState([]);
    // 📌 선택된 채널의 텔레그램 링크 (iframeUrl)
    const [iframeUrl, setIframeUrl] = useState("");
    const [loading, setLoading] = useState(false);

    // ==============================
    // 1) 왼쪽: 채널 리스트 불러오기
    // ==============================
    useEffect(() => {
        const fetchChannels = async () => {
            try {
                // channel-similarity 테이블 전체 목록
                const response = await axios.get("http://localhost:8080/channel-similarity/all");
                const data = response.data; // [{_id, channelId, similarChannels, ...}, ...]

                // 각 entry의 channelId를 가지고 channel_info에서 title, updatedAt 등을 얻어온 뒤 합치기
                // (이미 "channel-similarity" 테이블 안에 title이 없을 테니 여기서 enrich)
                const enriched = await Promise.all(
                    data.map(async (entry) => {
                        try {
                            // /channels/id/{channelId}로 실제 channel_info 조회
                            const channelRes = await axios.get(
                                `http://localhost:8080/channels/id/${Number(entry.channelId)}`
                            );
                            const info = channelRes.data || {}; // channel_info 문서

                            return {
                                ...entry,
                                title: info.title || "제목 없음",
                                updatedAt: info.updatedAt || null,
                            };
                        } catch (err) {
                            // 해당 channelId를 가진 channel_info를 찾지 못하면 fallback
                            console.error("채널 enrich 실패:", err);
                            return {
                                ...entry,
                                title: "제목 없음",
                                updatedAt: null,
                            };
                        }
                    })
                );

                setChannels(enriched);
            } catch (error) {
                console.error("채널 목록 불러오기 실패:", error);
            }
        };

        fetchChannels();
    }, []);

    // ==============================
    // 2) 유사 채널 상세 정보 불러오기 (단순화: channel_similarity의 channelId만 사용)
    // ==============================
    const fetchDetailedSimilarChannels = async (similarChannelsArray) => {
        const detailedChannels = await Promise.all(
            similarChannelsArray.map(async (sc) => {
                try {
                    const res = await axios.get(`http://localhost:8080/channels/id/${String(sc.channelId)}`);
                    const info = res.data || {};
                    return {
                        channelId: sc.channelId,
                        similarity: sc.similarity,
                        title: info.title || `채널 ${sc.channelId}`,
                        link: info.link || "#",
                    };
                } catch (err) {
                    console.error("유사 채널 정보 불러오기 실패:", err);
                    return {
                        channelId: sc.channelId,
                        similarity: sc.similarity,
                        title: `채널 ${sc.channelId}`,
                        link: "#",
                    };
                }
            })
        );
        return detailedChannels;
    };

    // ==============================
    // 3) 채널 클릭 시: 상세 정보 + 유사 채널
    // ==============================
    const handleChannelClick = async (channelItem) => {
        // channelItem = channel-similarity 문서 (왼쪽 리스트에서 선택)
        setSelectedChannel(channelItem);
        setIframeUrl("");
        setSimilarChannels([]);
        setLoading(true);

        try {
            // 3-1) 선택된 채널의 유사 채널들 불러오기
            //      -> /channel-similarity/chId/{channelId} 가정
            const response = await axios.get(
                `http://localhost:8080/channel-similarity/chId/${Number(channelItem.channelId)}`
            );
            const similarityDoc = response.data; // { _id, channelId, similarChannels, ... }

            // 3-2) similarityDoc.similarChannels 중에서 similarity >= 0.7 필터
            const filtered = similarityDoc.similarChannels.filter((sc) => sc.similarity >= 0.7);

            // 3-3) 각 유사 채널 ID로 채널 title/link 가져오기
            const detailed = await fetchDetailedSimilarChannels(filtered);
            setSimilarChannels(detailed);

            // 3-4) 선택된 채널의 텔레그램 링크도 가져오기 (/channels/id/{channelId})
            const channelInfoResponse = await axios.get(
                `http://localhost:8080/channels/id/${Number(channelItem.channelId)}`
            );
            if (channelInfoResponse.data?.link) {
                setIframeUrl(channelInfoResponse.data.link);
            }
        } catch (error) {
            console.error("유사 채널 또는 채널 정보 불러오기 실패:", error);
        } finally {
            setLoading(false);
        }
    };

    // ==============================
    // 4) 네트워크 그래프 열기 (새 창)
    // ==============================
    const openNetworkGraph = () => {
        if (!selectedChannel) return;

        const graphData = {
            rootChannel: Number(selectedChannel.channelId),
            // 메인 채널 노드
            nodes: [
                {
                    id: Number(selectedChannel.channelId),
                    text: selectedChannel.title || String(selectedChannel.channelId),
                    type: "main",
                    color: "#ff5733",
                },
                // 유사 채널 노드
                ...similarChannels.map((ch) => ({
                    id: Number(ch.channelId),
                    text: ch.title || String(ch.channelId),
                    type: "similar",
                    color: "#3375ff",
                })),
            ],
            // 메인 채널과 유사 채널을 연결
            lines: similarChannels.map((ch) => ({
                from: Number(selectedChannel.channelId),
                to: Number(ch.channelId),
                text: `유사도 ${(ch.similarity * 100).toFixed(2)}%`,
                width: 2 + ch.similarity * 5,
            })),
        };

        const encodedData = Buffer.from(JSON.stringify(graphData)).toString("base64");
        window.open(`/network-graph?data=${encodedData}`, "_blank");
    };

    return (
        <div className="channel-similarities-page">
            <Sidebar />
            <main className="channel-similarities-main with-sidebar">
                <header className="channel-similarities-header">
                    <div className="channel-similarities-title">
                        <h1>채널 유사도 분석</h1>
                    </div>
                </header>

                <div className="content">
                    {/* ==============================
                        왼쪽: 채널 리스트 (channel-similarity 문서 목록)
                    =============================== */}
                    <aside className="channel-list">
                        <h3>채널 리스트</h3>
                        <ul>
                            {channels.map((channel) => (
                                <li
                                    key={channel.channelId}
                                    className={`channel-item ${
                                        selectedChannel?.channelId === channel.channelId ? "selected" : ""
                                    }`}
                                    onClick={() => handleChannelClick(channel)}
                                >
                                    {/* channel-similarity 문서 + channel_info.title 로 enrich */}
                                    <p className="channel-name">채널명: {channel.title || "제목 없음"}</p>
                                    <p>
                                        업데이트 시각:{" "}
                                        {channel.updatedAt
                                            ? new Date(channel.updatedAt).toLocaleString()
                                            : "정보 없음"}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </aside>

                    {/* ==============================
                        오른쪽: 선택된 채널 & 유사 채널 목록
                    =============================== */}
                    <section className="channel-details">
                        {selectedChannel ? (
                            <>
                                <h3>선택된 채널 정보</h3>
                                <p>채널 ID: {selectedChannel.channelId}</p>
                                <p>
                                    업데이트 시각:{" "}
                                    {selectedChannel.updatedAt
                                        ? new Date(selectedChannel.updatedAt).toLocaleString()
                                        : "정보 없음"}
                                </p>

                                <button className="similarity-modal-button" onClick={openNetworkGraph}>
                                    유사도 보기 (새 창)
                                </button>

                                <h4>유사 채널 (0.7 이상)</h4>
                                {loading ? (
                                    <p>유사 채널 불러오는 중...</p>
                                ) : (
                                    <div className="similarity-results">
                                        {similarChannels.length > 0 ? (
                                            <ul>
                                                {similarChannels.map((similar, index) => (
                                                    <li key={index} className="similarity-box">
                                                        <h4>채널 ID: {similar.title !== undefined ? similar.title : "채널 정보 없음"}</h4>
                                                        <p>
                                                            <strong>유사도:</strong>{" "}
                                                            {(similar.similarity * 100).toFixed(2)}%
                                                        </p>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p>유사한 채널이 없습니다.</p>
                                        )}
                                    </div>
                                )}

                                {/* 텔레그램 링크 열기 */}
                                <a
                                    href={
                                        iframeUrl.startsWith("http")
                                            ? iframeUrl
                                            : `https://${iframeUrl}`
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    텔레그램 링크 열기
                                </a>
                            </>
                        ) : (
                            <p>채널을 선택해 주세요.</p>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
};

export default ChannelSimilarities;