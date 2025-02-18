import React, { useState, useEffect } from "react";
import { Buffer } from "buffer"; // Base64 변환을 위해 추가
import Sidebar from "../components/Sidebar";
import "../css/page/ChannelSimilarities.css";
import axios from "axios";

const ChannelSimilarities = () => {
    const [channels, setChannels] = useState([]);
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [similarChannels, setSimilarChannels] = useState([]);
    const [iframeUrl, setIframeUrl] = useState("");
    const [selectedSimilarChannel, setSelectedSimilarChannel] = useState(null);

    // 📌 모든 채널 가져오기
    useEffect(() => {
        const fetchChannels = async () => {
            try {
                const response = await axios.get("http://localhost:8080/channel-similarity/all");
                setChannels(response.data);
            } catch (error) {
                console.error("Error fetching channels:", error);
            }
        };

        fetchChannels();
    }, []);

    // 📌 특정 채널 선택 시 유사 채널 정보 가져오기
    const handleChannelClick = async (channel) => {
        setSelectedChannel(channel);
        setIframeUrl("");

        try {
            const response = await axios.get(`http://localhost:8080/channel-similarity/chId/${channel.channelId}`);
            const filteredSimilarChannels = response.data.similarChannels.filter((sc) => sc.similarity >= 0.9);
            setSimilarChannels(filteredSimilarChannels);

            const channelInfoResponse = await axios.get(`http://localhost:8080/channels/id/${channel.channelId}`);
            if (channelInfoResponse.data && channelInfoResponse.data.link) {
                setIframeUrl(channelInfoResponse.data.link);
            } else {
                setIframeUrl("");
            }
        } catch (error) {
            console.error("Error fetching similar channels or channel info:", error);
        }
    };

    // 📌 유사 채널 선택 시 정보 표시
    const handleSimilarChannelClick = (channel) => {
        setSelectedSimilarChannel(channel);
    };

    // 📌 네트워크 그래프를 새 탭에서 열기
    const openNetworkGraph = () => {
        if (!selectedChannel) return;

        const graphData = {
            rootChannel: selectedChannel.channelId,
            nodes: [
                { id: selectedChannel.channelId, text: selectedChannel.channelId, type: "main", color: "#ff5733" },
                ...similarChannels.map((ch) => ({
                    id: ch.similarChannel,
                    text: ch.similarChannel,
                    type: "similar",
                    color: "#3375ff"
                })),
            ],
            lines: similarChannels.map((ch) => ({
                from: selectedChannel.channelId,
                to: ch.similarChannel,
                text: `유사도 ${(ch.similarity * 100).toFixed(2)}%`,
                width: 2 + ch.similarity * 5,
            })),
        };

        // ✅ Base64로 변환하여 URL에 전달
        const graphDataString = Buffer.from(JSON.stringify(graphData)).toString("base64");

        // ✅ 새 탭에서 그래프 열기
        window.open(`/network-graph?data=${graphDataString}`, "_blank");
    };

    return (
        <div className="channel-similarities-page">
            <Sidebar />
            <main className="channel-similarities-main">
                <header className="channel-similarities-header">
                    <h1>채널 유사도 분석</h1>
                </header>
                <div className="content">
                    {/* 📌 채널 리스트 */}
                    <aside className="channel-list">
                        <h3>채널 리스트</h3>
                        <ul>
                            {channels.map((channel) => (
                                <li key={channel.channelId} className="channel-item" onClick={() => handleChannelClick(channel)}>
                                    <p className="channel-name">채널명: {channel.channelId}</p>
                                    <p>최초 감지 시간: {new Date(channel.updatedAt).toLocaleString()}</p>
                                </li>
                            ))}
                        </ul>
                    </aside>

                    {/* 📌 채널 상세 정보 */}
                    <section className="channel-details">
                        {selectedChannel ? (
                            <>
                                <h3>채널 상세 정보</h3>
                                <p>채널명: {selectedChannel.channelId}</p>
                                <p>최초 감지 시간: {new Date(selectedChannel.updatedAt).toLocaleString()}</p>
                                <button className="similarity-modal-button" onClick={openNetworkGraph}>
                                    유사도 보기 (새 창)
                                </button>
                                <h4>유사도가 0.9 이상인 채널</h4>
                                <ul>
                                    {similarChannels.map((ch, index) => (
                                        <li key={index} onClick={() => handleSimilarChannelClick(ch)} className="similar-channel-item">
                                            {ch.similarChannel} (유사도: {(ch.similarity * 100).toFixed(2)}%)
                                        </li>
                                    ))}
                                </ul>
                                {iframeUrl && (
                                    <div className="iframe-container">
                                        <iframe src={iframeUrl} title="채널 링크" width="100%" height="400px" style={{ border: "none" }} />
                                    </div>
                                )}
                                <a href={iframeUrl.startsWith("http") ? iframeUrl : `https://${iframeUrl}`} target="_blank" rel="noopener noreferrer">
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