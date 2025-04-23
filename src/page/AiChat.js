import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Chat from "../components/Chat";
import "../css/page/AiChat.css";
import useFetchChannels from "../hooks/useFetchChannels";

const AiChat = () => {
    const [selectedChannelId, setSelectedChannelId] = useState(null);
    const { channels, loading, error } = useFetchChannels();

    return (
        <div className="ai-chat-page">
            <Sidebar />
            <main className="ai-chat-main with-sidebar">
                <header className="ai-chat-header">
                    <h1>AI 관리</h1>
                </header>
                <div className="ai-chat-content">
                    <div className="chatbot-list">
                        <h3>텔레그램 채널</h3>
                        {loading && <p>Loading channels...</p>}
                        {error && <p>Error loading channels: {error}</p>}
                        <ul>
                            {channels.map((channel) => (
                                <li
                                    key={channel._id}
                                    className={`channel-item ${selectedChannelId === channel._id ? "active" : ""}`}
                                    onClick={() => setSelectedChannelId(channel._id)}
                                >
                                    <div className="channel-info">
                                        <p className="channel-name">{channel.name}</p>
                                        <p className="channel-chatSendTime">
                                            {new Date(channel.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="chat-window">
                        <h3>채널별 AI</h3>
                        {selectedChannelId && (
                            <p className="selected-channel-name">
                                {
                                    channels.find((ch) => ch._id === selectedChannelId)?.name
                                }
                            </p>
                        )}
                        <Chat channelId={selectedChannelId} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AiChat;