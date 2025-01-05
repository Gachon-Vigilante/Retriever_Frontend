import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Chat from "../components/Chat";
import "../css/page/AiChat.css";
import useFetchChannels from "../hooks/useFetchChannels";

const AiChat = () => {
    const [selectedChannel, setSelectedChannel] = useState(null);

    // Fetch channels using the custom hook
    const { channels, loading, error } = useFetchChannels();

    return (
        <div className="ai-chat-page">
            <Sidebar />
            <main className="ai-chat-main">
                <header className="ai-chat-header">
                    <h1>Ai Chat</h1>
                    {/*<div className="filters">*/}
                    {/*    <select>*/}
                    {/*        <option value="all">채널: All</option>*/}
                    {/*        <option value="arrested">채널: 검거</option>*/}
                    {/*        <option value="not-arrested">채널: 미검거</option>*/}
                    {/*    </select>*/}
                    {/*    <select>*/}
                    {/*        <option value="all">마약 종류: All</option>*/}
                    {/*        <option value="drug">마약 종류: 항정신성의약품</option>*/}
                    {/*        <option value="marijuana">마약 종류: 대마</option>*/}
                    {/*    </select>*/}
                    {/*</div>*/}
                    <button className="download-button">Download</button>
                </header>
                <div className="ai-chat-content">
                    <div className="channel-list">
                        <h3>Telegram Channels</h3>
                        {loading && <p>Loading channels...</p>}
                        {error && <p>Error loading channels: {error}</p>}
                        <ul>
                            {channels.map((channel) => (
                                <li
                                    key={channel.id}
                                    className={`channel-item ${
                                        selectedChannel === channel.id ? "active" : ""
                                    }`}
                                    onClick={() => setSelectedChannel(channel.id)}
                                >
                                    <div className="channel-info">
                                        <p className="channel-name">{channel.name}</p>
                                        <p className="channel-chatSendTime">
                                            {new Date(channel.updatedAt).toLocaleString()}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="chat-window">
                        <h3>Channel AI</h3>
                        {selectedChannel && (
                            <p className="selected-channel-name">
                                {
                                    channels.find(
                                        (channel) => channel.id === selectedChannel
                                    )?.name
                                }
                            </p>
                        )}
                        <Chat />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AiChat;
