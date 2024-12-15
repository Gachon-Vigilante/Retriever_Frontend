import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Chat from "../components/Chat"; // Reusing the Chat component
import "../css/page/AiChat.css";

const AiChat = () => {
    const [selectedChannel, setSelectedChannel] = useState(null);

    const channels = [
        { id: 1, name: "Channel Name 1", chatSendTime: "3 new Chats" },
        { id: 2, name: "Channel Name 2", chatSendTime: "2 new Chats" },
        { id: 3, name: "Channel Name 3", chatSendTime: "1 new Chat" },
        { id: 4, name: "Channel Name 4", chatSendTime: "637 Points" },
        { id: 5, name: "Channel Name 5", chatSendTime: "637 Points" },
        { id: 6, name: "Channel Name 6", chatSendTime: "637 Points" },
        { id: 7, name: "Channel Name 7", chatSendTime: "637 Points" },
        { id: 8, name: "Channel Name 8", chatSendTime: "637 Points" },
        { id: 9, name: "Channel Name 9", chatSendTime: "637 Points" },
        { id: 10, name: "Channel Name 10", chatSendTime: "637 Points" },
    ];

    return (
        <div className="ai-chat-page">
            <Sidebar />
            <main className="ai-chat-main">
                <header className="ai-chat-header">
                    <h1>Ai Chat</h1>
                    <div className="filters">
                        <select>
                            <option value="all">채널: All</option>
                            <option value="arrested">채널: 검거</option>
                            <option value="not-arrested">채널: 미검거</option>
                        </select>
                        <select>
                            <option value="all">마약 종류: All</option>
                            <option value="drug">마약 종류: 항정신성의약품</option>
                            <option value="marijuana">마약 종류: 대마</option>
                        </select>
                    </div>
                    <button className="download-button">Download</button>
                </header>
                <div className="ai-chat-content">
                    <div className="channel-list">
                        <h3>Telegram Channels</h3>
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
                                        <p className="channel-chatSendTime">{channel.chatSendTime}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="chat-window">
                        <h3>Channel AI</h3>
                        {selectedChannel && (
                            <p className="selected-channel-name">
                                {channels.find((channel) => channel.id === selectedChannel)?.name}
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
