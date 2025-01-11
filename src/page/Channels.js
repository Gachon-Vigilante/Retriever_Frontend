import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import useFetchChannelDetails from "../hooks/useFetchChannelDetails";
import "../css/page/Channels.css";

const Channels = () => {
    const { channels, selectedDetails, fetchDetailsByChannelId, loading, error } =
        useFetchChannelDetails();
    const [selectedChannelId, setSelectedChannelId] = useState(null);

    // Search states
    const [searchName, setSearchName] = useState(""); // Search by name
    const [searchId, setSearchId] = useState(""); // Search by ID
    const [searchLink, setSearchLink] = useState(""); // Search by link
    const [filteredChannels, setFilteredChannels] = useState(channels); // Filtered list
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state

    // Perform search based on all inputs
    const handleSearch = () => {
        const filtered = channels.filter((channel) => {
            const matchesName =
                searchName.trim() === "" ||
                channel.name.toLowerCase().includes(searchName.toLowerCase());
            const matchesId =
                searchId.trim() === "" || channel.id.toLowerCase().includes(searchId.toLowerCase());
            const matchesLink =
                searchLink.trim() === "" ||
                channel.link.toLowerCase().includes(searchLink.toLowerCase());
            return matchesName && matchesId && matchesLink;
        });

        if (filtered.length === 0) {
            setIsModalOpen(true); // Show modal if no results
        } else {
            setFilteredChannels(filtered); // Update the filtered list
        }
    };

    // Handle Enter key press in any input
    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    // Close modal
    const closeModal = () => {
        setIsModalOpen(false);
    };

    // Handle channel click
    const handleChannelClick = (channelId) => {
        setSelectedChannelId(channelId);
        fetchDetailsByChannelId(channelId);
    };

    return (
        <div className="channel-page">
            <Sidebar />
            <main className="channel-main">
                {/* Header */}
                <header className="channel-header">
                    <h1>텔레그램 채널</h1>
                    <div className="search-container">
                        {/* Search by Name */}
                        <input
                            type="text"
                            className="search-input"
                            placeholder="채널 이름 검색"
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                        {/* Search by ID */}
                        <input
                            type="text"
                            className="search-input"
                            placeholder="채널 ID 검색"
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                        {/* Search by Link */}
                        <input
                            type="text"
                            className="search-input"
                            placeholder="채널 링크 검색"
                            value={searchLink}
                            onChange={(e) => setSearchLink(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                        <button className="search-button" onClick={handleSearch}>
                            검색
                        </button>
                    </div>
                    <button className="download-button">데이터 다운로드</button>
                </header>

                {/* Content */}
                <div className="channel-content">
                    {/* Channel List */}
                    <section className="channel-list">
                        <h3>채널 리스트</h3>
                        {loading && !selectedChannelId ? (
                            <p>Loading channels...</p>
                        ) : error ? (
                            <p className="error-message">{error}</p>
                        ) : (
                            <ul>
                                {(filteredChannels.length > 0 ? filteredChannels : channels).map(
                                    (channel) => (
                                        <li
                                            key={channel.id}
                                            className={`channel-item ${
                                                selectedChannelId === channel.id ? "active" : ""
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
                                    )
                                )}
                            </ul>
                        )}
                    </section>

                    {/* Channel Details */}
                    <section className="channel-details">
                        <h3>채널 상세 정보</h3>
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
                            <p>채널을 선택해 주세요.</p>
                        )}
                    </section>
                </div>
            </main>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <p>검색 결과가 없습니다.</p>
                        <button className="close-button" onClick={closeModal}>
                            닫기
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Channels;
