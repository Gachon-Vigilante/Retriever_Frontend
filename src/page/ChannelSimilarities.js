import React, { useState, useEffect } from "react";
import { Buffer } from "buffer"; // Base64 변환용
import Sidebar from "../components/Sidebar";
import "../css/page/ChannelSimilarities.css";
import axios from "axios";

const ChannelSimilarities = () => {
    const [channels, setChannels] = useState([]);
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [similarChannels, setSimilarChannels] = useState([]);
    const [iframeUrl, setIframeUrl] = useState("");
    const [loading, setLoading] = useState(false);

    // 📌 모든 채널 유사도 분석 대상 가져오기
    useEffect(() => {
        const fetchChannels = async () => {
            try {
                const response = await axios.get("http://localhost:8080/channel-similarity/all");
                setChannels(response.data);
            } catch (error) {
                console.error("채널 목록 불러오기 실패:", error);
            }
        };

        fetchChannels();
    }, []);

    // 📌 유사 채널 상세 정보 fetch 함수
    const fetchDetailedSimilarChannels = async (similarChannels) => {
        return await Promise.all(
            similarChannels.map(async (sc) => {
                try {
                    const res = await axios.get(`http://localhost:8080/channels/id/${sc.similarChannel}`);
                    const info = res.data;
                    return {
                        ...sc,
                        title: info.title || `채널 ${sc.similarChannel}`,
                        link: info.link || "#",
                    };
                } catch (error) {
                    console.error(`유사 채널 정보 조회 실패: ${sc.similarChannel}`, error);
                    return {
                        ...sc,
                        title: `채널 ${sc.similarChannel}`,
                        link: "#",
                    };
                }
            })
        );
    };

    // 📌 채널 선택 시
    const handleChannelClick = async (channel) => {
        setSelectedChannel(channel);
        setIframeUrl("");
        setSimilarChannels([]);
        setLoading(true);

        try {
            const response = await axios.get(`http://localhost:8080/channel-similarity/chId/${channel.channelId}`);
            const filtered = response.data.similarChannels.filter((sc) => sc.similarity >= 0.7);

            const detailed = await fetchDetailedSimilarChannels(filtered);
            setSimilarChannels(detailed);

            const channelInfoResponse = await axios.get(`http://localhost:8080/channels/id/${channel.channelId}`);
            if (channelInfoResponse.data?.link) {
                setIframeUrl(channelInfoResponse.data.link);
            }
        } catch (error) {
            console.error("유사 채널 또는 채널 정보 불러오기 실패:", error);
        } finally {
            setLoading(false);
        }
    };

    // 📌 네트워크 그래프 열기
    const openNetworkGraph = () => {
        if (!selectedChannel) return;

        const graphData = {
            rootChannel: selectedChannel.channelId,
            nodes: [
                { id: selectedChannel.channelId, text: selectedChannel.channelId, type: "main", color: "#ff5733" },
                ...similarChannels.map((ch) => ({
                    id: ch.similarChannel,
                    text: ch.title || ch.similarChannel,
                    type: "similar",
                    color: "#3375ff",
                })),
            ],
            lines: similarChannels.map((ch) => ({
                from: selectedChannel.channelId,
                to: ch.similarChannel, // channelId로 변경
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
            <main className="channel-similarities-main">
                <header className="channel-similarities-header">
                    <div className="channel-similarities-title">
                        <h1>채널 유사도 분석</h1>
                    </div>
                </header>
                <div className="content">
                    {/* 📌 채널 리스트 */}
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
                                    <p className="channel-name">채널 ID: {channel.channelId}</p>
                                    <p>감지 시각: {new Date(channel.updatedAt).toLocaleString()}</p>
                                </li>
                            ))}
                        </ul>
                    </aside>

                    {/* 📌 유사도 분석 결과 */}
                    <section className="channel-details">
                        {selectedChannel ? (
                            <>
                                <h3>선택된 채널 정보</h3>
                                <p>채널 ID: {selectedChannel.channelId}</p>
                                <p>감지 시각: {new Date(selectedChannel.updatedAt).toLocaleString()}</p>
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
                                                        <h4>
                                                            <a
                                                                href={
                                                                    similar.link?.startsWith("http")
                                                                        ? similar.link
                                                                        : `https://${similar.link}`
                                                                }
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="similarity-link"
                                                            >
                                                                {similar.title}
                                                            </a>
                                                        </h4>
                                                        <p>
                                                            <strong>유사도:</strong>{" "}
                                                            {(similar.similarity * 100).toFixed(2)}%
                                                        </p>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p>유사한 채널 정보가 없습니다.</p>
                                        )}
                                    </div>
                                )}
                                <a
                                    href={iframeUrl.startsWith("http") ? iframeUrl : `https://${iframeUrl}`}
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