import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import useFetchChannelDetails from "../hooks/useFetchChannelDetails";
import "../css/page/Channels.css";

const Channels = () => {
    const { channels, selectedDetails, fetchDetailsByChannelId, loading, error } =
        useFetchChannelDetails();
    const [selectedChannelId, setSelectedChannelId] = useState(null);

    const handleChannelClick = (channelId) => {
        setSelectedChannelId(channelId); // 선택된 채널 ID 설정
        fetchDetailsByChannelId(channelId); // 상세 정보 가져오기
    };

    return (
        <div className="channel-page">
            <Sidebar />
            <main className="channel-main">
                {/* 헤더 */}
                <header className="channel-header">
                    <h1>Telegram Channels</h1>
                    <button className="download-button">Download Channel Data</button>
                </header>

                {/* 채널 목록 및 상세 정보 */}
                <div className="channel-content">
                    {/* 채널 목록 */}
                    <section className="channel-list">
                        <h3>Channel List</h3>
                        {loading && !selectedChannelId ? (
                            <p>Loading channels...</p>
                        ) : error ? (
                            <p className="error-message">{error}</p>
                        ) : (
                            <ul>
                                {channels.map((channel) => (
                                    <li
                                        key={channel.id}
                                        className={`channel-item ${
                                            selectedChannelId === channel.id ? "active" : ""
                                        }`}
                                        onClick={() => handleChannelClick(channel.id)}
                                    >
                                        <div className="channel-info">
                                            <p className="channel-name">{channel.name}</p>
                                            <p className="channel-link">Link: {channel.link}</p>
                                            <p className="channel-updated">
                                                Updated At: {channel.updatedAt}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    {/* 채널 상세 정보 */}
                    <section className="channel-details">
                        <h3>Channel Details</h3>
                        {loading && selectedChannelId ? (
                            <p>Loading details...</p>
                        ) : selectedDetails.length > 0 ? (
                            <div className="details-content">
                                <ul>
                                    {selectedDetails.map((detail, index) => (
                                        <li key={index} className="detail-item">
                                            <p>
                                                <strong>Message URL:</strong>{" "}
                                                <a href={detail.msgUrl} target="_blank" rel="noreferrer">
                                                    {detail.msgUrl}
                                                </a>
                                            </p>
                                            <p>
                                                <strong>Text:</strong> {detail.text}
                                            </p>
                                            <p>
                                                <strong>Timestamp:</strong> {detail.timestamp}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <p>Select a channel to view its details</p>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
};

export default Channels;
