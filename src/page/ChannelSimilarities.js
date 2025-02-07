import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import "../css/page/ChannelSimilarities.css";
import axios from "axios";

const ChannelSimilarities = () => {
    const [channels, setChannels] = useState([]);
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [similarChannels, setSimilarChannels] = useState([]);
    const [iframeUrl, setIframeUrl] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
    const [selectedSimilarChannel, setSelectedSimilarChannel] = useState(null); // 선택된 유사 채널 정보

    // Fetch all channels
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

    // Fetch similar channels for a specific channel
    const handleChannelClick = async (channel) => {
        setSelectedChannel(channel);
        setIframeUrl(""); // Reset iframe initially
        try {
            const response = await axios.get(`http://localhost:8080/channel-similarity/chId/${channel.channelId}`);
            const filteredSimilarChannels = response.data.similarChannels.filter(
                (sc) => sc.similarity >= 0.9
            );
            setSimilarChannels(filteredSimilarChannels);

            const channelInfoResponse = await axios.get(`http://localhost:8080/channels/id/${channel.channelId}`);
            if (channelInfoResponse.data && channelInfoResponse.data.link) {
                setIframeUrl(channelInfoResponse.data.link);
            } else {
                setIframeUrl(""); // Fallback if no link is found
            }
        } catch (error) {
            console.error("Error fetching similar channels or channel info:", error);
        }
    };

    // Toggle modal visibility
    const toggleModal = () => {
        setIsModalOpen((prev) => !prev);
    };

    const handleSimilarChannelClick = (channel) => {
        setSelectedSimilarChannel(channel);
    };

    // Close modal
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedSimilarChannel(null); // Reset selection
    };

    return (
        <div className="channel-similarities-page">
            <Sidebar />
            <main className="channel-similarities-main">
                <header className="channel-similarities-header">
                    <h1>채널 유사도 분석</h1>
                </header>
                <div className="content">
                    {/* Channel List */}
                    <aside className="channel-list">
                        <h3>채널 리스트</h3>
                        <ul>
                            {channels.map((channel) => (
                                <li
                                    key={channel.channelId}
                                    className="channel-item"
                                    onClick={() => handleChannelClick(channel)}
                                >
                                    <p className="channel-name">채널명: {channel.channelId}</p>
                                    <p>최초 감지 시간: {new Date(channel.updatedAt).toLocaleString()}</p>
                                </li>
                            ))}
                        </ul>
                    </aside>

                    {/* Channel Details */}
                    <section className="channel-details">
                        {selectedChannel ? (
                            <>
                                <h3>채널 상세 정보</h3>
                                <p>채널명: {selectedChannel.channelId}</p>
                                <p>
                                    최초 감지 시간:{" "}
                                    {new Date(selectedChannel.updatedAt).toLocaleString()}
                                </p>
                                <button className="similarity-modal-button" onClick={toggleModal}>
                                    유사도 보기
                                </button>
                                <h4>유사도가 0.9 이상인 채널</h4>
                                <ul>
                                    {similarChannels.map((ch, index) => (
                                        <li
                                            key={index}
                                            onClick={() => handleSimilarChannelClick(ch)}
                                            className="similar-channel-item"
                                        >
                                            {ch.similarChannel} (유사도: {(ch.similarity * 100).toFixed(2)}%)
                                        </li>
                                    ))}
                                </ul>
                                {iframeUrl && (
                                    <div className="iframe-container">
                                        <iframe
                                            src={iframeUrl}
                                            title="채널 링크"
                                            width="100%"
                                            height="400px"
                                            style={{ border: "none" }}
                                        />
                                    </div>
                                )}
                                <a href={iframeUrl.startsWith("http") ? iframeUrl : `https://${iframeUrl}`}
                                   target="_blank" rel="noopener noreferrer">
                                    텔레그램 링크 열기
                                </a>
                            </>
                        ) : (
                            <p>채널을 선택해 주세요.</p>
                        )}
                    </section>
                </div>

                {/* Modal */}
                {isModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <button className="modal-close-button" onClick={closeModal}>
                                닫기
                            </button>
                            <h3>유사도 네트워크</h3>
                            <div className="network-graph">
                                <div className="main-channel">
                                    <div className="main-channel-circle">
                                        <p>{selectedChannel?.channelId}</p>
                                    </div>
                                    {similarChannels.map((ch, index) => {
                                        const radius = 200; // Increased distance from the main channel
                                        const padding = 50; // Minimum padding around the main channel
                                        const angle = (index / similarChannels.length) * 2 * Math.PI; // Equally spaced angles
                                        const x = Math.cos(angle) * (radius + padding);
                                        const y = Math.sin(angle) * (radius + padding);

                                        return (
                                            <div
                                                key={index}
                                                className="similar-channel-circle"
                                                style={{
                                                    left: `calc(50% + ${x}px)`, // Dynamically calculated X position
                                                    top: `calc(50% + ${y}px)`,  // Dynamically calculated Y position
                                                    width: `${80 + ch.similarity * 40}px`, // Adjust size dynamically
                                                    height: `${80 + ch.similarity * 40}px`,
                                                }}
                                                onClick={() => handleSimilarChannelClick(ch)}
                                            >
                                                <p>{ch.similarChannel}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="similarity-details">
                                {selectedSimilarChannel ? (
                                    <>
                                        <h4>유사도 세부 정보</h4>
                                        <p>유사 채널명: {selectedSimilarChannel.similarChannel}</p>
                                        <p>유사도: {(selectedSimilarChannel.similarity * 100).toFixed(2)}%</p>
                                        <p>마약 타입: {selectedSimilarChannel.drugType || "정보 없음"}</p>
                                    </>
                                ) : (
                                    <p>유사 채널을 선택해주세요.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ChannelSimilarities;
