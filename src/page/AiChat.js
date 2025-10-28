import React, { useState } from "react";
import ReactPaginate from "react-paginate";
import Sidebar from "../components/Sidebar";
import Chat from "../components/Chat";
import "../css/page/AiChat.css";
import useFetchChannels from "../hooks/useFetchChannels";
import ToolTip from "../components/ToolTip";

const AiChat = () => {
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [channelPage, setChannelPage] = useState(0);
    const channelsPerPage = 10;
    const { channels, loading, error } = useFetchChannels();

    return (
        <div className="ai-chat-page">
            <Sidebar />
            <main className="ai-chat-main with-sidebar">
                <ToolTip title="AI 관리" tooltipText="AI를 통해 텔레그램 채널에 대해 정보를 파악할 수 있습니다." />
                <div className="ai-chat-content">
                    <div className="chatbot-list">
                        <h3 className="tooltip" data-tooltip="현재 active 상태인 텔레그램 채널을 표시합니다.">텔레그램 채널</h3>
                        {loading && <p>채널 목록 로딩 중...</p>}
                        {error && <p className="tooltip-error">채널을 불러오는 중 오류가 발생했습니다: {error}</p>}
                        <ul className="ai-channel-list">
                            {channels
                                .filter(channel => channel.status === "active")
                                .slice(channelPage * channelsPerPage, (channelPage + 1) * channelsPerPage)
                                .map((channel) => (
                                <li
                                    key={channel.id ?? channel.channelId}
                                    className={`channel-item ${String(selectedChannel?.id ?? selectedChannel?.channelId) === String(channel.channelId ?? channel.id) ? "active" : ""}`}
                                    onClick={() => {
                                        setSelectedChannel(channel);
                                    }}
                                >
                                    <div className="channel-info">
                                        <p className="channel-name">{channel.title || channel.name || "제목 없음"}</p>
                                        <p className="channel-chatSendTime">
                                            {channel.createdAt ? new Date(channel.createdAt).toLocaleString() : "-"}
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
                        {selectedChannel && (
                            <p className="selected-channel-name">
                                {selectedChannel.title || selectedChannel.name || `ID: ${selectedChannel.id ?? selectedChannel.channelId}`}
                            </p>
                        )}
                        <Chat selectedChannel={selectedChannel} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AiChat;