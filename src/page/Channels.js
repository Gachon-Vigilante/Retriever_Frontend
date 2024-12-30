import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import useFetchChannelDetails from "../hooks/useFetchChannelDetails";
import "../css/page/Channels.css";

const Channels = () => {
    const { channels, selectedDetails, fetchDetailsByChannelId, loading, error } =
        useFetchChannelDetails();
    const [selectedChannelId, setSelectedChannelId] = useState(null);

    const handleChannelClick = (channelId) => {
        setSelectedChannelId(channelId); // Set the selected channel ID
        fetchDetailsByChannelId(channelId); // Fetch details
    };

    return (
        <div className="channel-page">
            <Sidebar />
            <main className="channel-main">
                {/* Header */}
                <header className="channel-header">
                    <h1>Telegram Channels</h1>
                    <button className="download-button">Download Data</button>
                </header>

                {/* Content */}
                <div className="channel-content">
                    {/* Channel List */}
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
                                            selectedChannelId === channel.id
                                                ? "active"
                                                : ""
                                        }`}
                                        onClick={() => handleChannelClick(channel.id)}
                                    >
                                        <div>
                                            <p className="channel-name">{channel.name}</p>
                                            <p className="channel-link">Link: {channel.link}</p>
                                            <p className="channel-updated">
                                                Updated: {channel.updatedAt}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    {/* Channel Details */}
                    <section className="channel-details">
                        <h3>Channel Details</h3>
                        {loading && selectedChannelId ? (
                            <p>Loading details...</p>
                        ) : selectedDetails.length > 0 ? (
                            <div className="details-content">
                                {selectedDetails.map((detail, index) => (
                                    <div key={index} className="detail-item">
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
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>Select a channel to view details</p>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
};

export default Channels;
