import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import useFetchChannelDetails from "../hooks/useFetchChannelDetails";
import "../css/page/Channels.css";

const Channels = () => {
    const { channels, selectedDetails, fetchDetailsById, loading, error } =
        useFetchChannelDetails();
    const [selectedChannelId, setSelectedChannelId] = useState(null);

    const handleChannelClick = (channelId) => {
        setSelectedChannelId(channelId);
        fetchDetailsById(channelId); // 선택된 채널의 상세 정보 가져오기
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
                        {loading ? (
                            <p>Loading channels...</p>
                        ) : error ? (
                            <p className="error-message">Error: {error}</p>
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
                                            <p className="channel-updated">
                                                Updated At:{" "}
                                                {new Date(channel.updatedAt).toLocaleString()}
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
                        {loading ? (
                            <p>Loading details...</p>
                        ) : selectedDetails && selectedDetails.length > 0 ? (
                            <div className="details-content">
                                <p>
                                    <strong>Channel ID:</strong>{" "}
                                    {selectedDetails[0]?.channelId || "N/A"}
                                </p>
                                <p>
                                    <strong>Message URL:</strong>{" "}
                                    {selectedDetails[0]?.msgUrl || "N/A"}
                                </p>
                                <ul>
                                    <strong>Messages:</strong>
                                    {selectedDetails.map((msg, index) => (
                                        <li key={index} className="message-item">
                                            {msg.text}
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
