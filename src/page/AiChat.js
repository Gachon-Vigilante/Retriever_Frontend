import React, { useState } from "react";
import ReactPaginate from "react-paginate";
import Sidebar from "../components/Sidebar";
import Chat from "../components/Chat";
import "../css/page/AiChat.css";
import useFetchChannels from "../hooks/useFetchChannels";
import ToolTip from "../components/ToolTip";

const AiChat = () => {
    const [selectedChannelId, setSelectedChannelId] = useState(null);
    const [channelPage, setChannelPage] = useState(0);
    const channelsPerPage = 10;
    const { channels, loading, error } = useFetchChannels();

    return (
        <div className="ai-chat-page">
            <Sidebar />
            <main className="ai-chat-main with-sidebar">
                {/*<header className="ai-chat-header">*/}
                {/*    <h1>AI 관리</h1>*/}
                {/*</header>*/}
                <ToolTip title="AI 관리" tooltipText="AI를 통해 텔레그램 채널에 대해 정보를 파악할 수 있습니다." />
                <div className="ai-chat-content">
                    <div className="chatbot-list">
                        <h3 className="tooltip" data-tooltip="현재 active 상태인 텔레그램 채널을 표시합니다.">Active 텔레그램 채널</h3>
                        {loading && <p>Loading channels...</p>}
                        {error && <p>Error loading channels: {error}</p>}
                        <ul className="ai-channel-list">
                            {channels
                                .filter(channel => channel.status === "active")
                                .slice(channelPage * channelsPerPage, (channelPage + 1) * channelsPerPage)
                                .map((channel) => (
                                <li
                                    key={channel.id}
                                    className={`channel-item ${selectedChannelId === channel.id ? "active" : ""}`}
                                    onClick={() => setSelectedChannelId(channel.id)}
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
                        <ReactPaginate
                            previousLabel={"<"}
                            nextLabel={">"}
                            pageCount={Math.ceil(channels.filter(channel => channel.status === "active").length / channelsPerPage)}
                            onPageChange={({ selected }) => setChannelPage(selected)}
                            containerClassName={"pagination"}
                            activeClassName={"active"}
                        />
                    </div>
                    <div className="chat-window">
                        <h3>채널별 AI</h3>
                        {selectedChannelId && (
                            <p className="selected-channel-name">
                                {
                                    channels.find((ch) => ch.id === selectedChannelId)?.name
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