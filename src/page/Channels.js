import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import useFetchChannelDetails from "../hooks/useFetchChannelDetails";
import useFetchBookmarks from "../hooks/useFetchBookmarks";
import "../css/page/Channels.css";
import axios from "axios";

const Channels = () => {
    const { channels, selectedDetails, fetchDetailsByChannelId, loading, error } =
        useFetchChannelDetails();
    const [selectedChannelId, setSelectedChannelId] = useState(null);

    const [searchName, setSearchName] = useState("");
    const [searchId, setSearchId] = useState("");
    const [searchLink, setSearchLink] = useState("");
    const [filteredChannels, setFilteredChannels] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const userId = "admin";
    const { bookmarks, setBookmarks, loading: bookmarksLoading, error: bookmarksError } =
        useFetchBookmarks(userId);

    // Check if a channel is bookmarked
    const isBookmarked = (channelId) =>
        bookmarks.some((bookmark) => bookmark.channelId === channelId);

    // Toggle bookmark
    const toggleBookmark = async (channel) => {
        try {
            if (isBookmarked(channel.id)) {
                const bookmark = bookmarks.find(
                    (bookmark) => bookmark.channelId === channel.id
                );
                await axios.delete(
                    `http://localhost:8080/bookmarks/delete/${bookmark.id}`
                );
                setBookmarks((prev) =>
                    prev.filter((b) => b.channelId !== channel.id)
                );
            } else {
                const newBookmark = {
                    channelId: channel.id,
                    userId: userId,
                };
                await axios.post("http://localhost:8080/bookmarks/add", newBookmark);
                setBookmarks((prev) => [...prev, newBookmark]);
            }
        } catch (error) {
            console.error("Error toggling bookmark:", error);
        }
    };

    // Sort channels to show bookmarked channels first
    const sortChannels = (channels) => {
        return [...channels].sort((a, b) => {
            const aBookmarked = isBookmarked(a.id);
            const bBookmarked = isBookmarked(b.id);
            if (aBookmarked && !bBookmarked) return -1;
            if (!aBookmarked && bBookmarked) return 1;
            return 0;
        });
    };

    // Perform search and sort results
    const handleSearch = () => {
        const filtered = channels.filter((channel) => {
            const matchesName =
                searchName.trim() === "" ||
                channel.name.toLowerCase().includes(searchName.toLowerCase());
            const matchesId =
                searchId.trim() === "" ||
                channel.id.toLowerCase().includes(searchId.toLowerCase());
            const matchesLink =
                searchLink.trim() === "" ||
                channel.link.toLowerCase().includes(searchLink.toLowerCase());
            return matchesName && matchesId && matchesLink;
        });

        if (filtered.length === 0) {
            setIsModalOpen(true);
        } else {
            setFilteredChannels(sortChannels(filtered)); // Sort filtered results
        }
    };

    // Initial sorting when channels are loaded
    useEffect(() => {
        if (channels.length > 0) {
            setFilteredChannels(sortChannels(channels));
        }
    }, [channels, bookmarks]);

    const closeModal = () => setIsModalOpen(false);

    // Handle channel click
    const handleChannelClick = (channelId) => {
        setSelectedChannelId(channelId);
        fetchDetailsByChannelId(channelId); // Ensure details are fetched
    };

    return (
        <div className="channel-page">
            <Sidebar />
            <main className="channel-main">
                {/* Header */}
                <header className="channel-header">
                    <h1>텔레그램 채널</h1>
                    <div className="search-container">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="채널 이름 검색"
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                        />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="채널 ID 검색"
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                        />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="채널 링크 검색"
                            value={searchLink}
                            onChange={(e) => setSearchLink(e.target.value)}
                        />
                        <button className="search-button" onClick={handleSearch}>
                            검색
                        </button>
                    </div>
                    <button className="download-button">데이터 다운로드</button>
                </header>

                {/* Content */}
                <div className="channel-content">
                    <section className="channel-list">
                        <h3>채널 리스트</h3>
                        {loading ? (
                            <p>Loading channels...</p>
                        ) : error ? (
                            <p className="error-message">{error}</p>
                        ) : (
                            <ul>
                                {filteredChannels.map((channel) => (
                                    <li
                                        key={channel.id}
                                        className={`channel-item ${
                                            selectedChannelId === channel.id ? "active" : ""
                                        }`}
                                        onClick={() => handleChannelClick(channel.id)} // Ensure click triggers
                                    >
                                        <div>
                                            <p className="channel-name">{channel.name}</p>
                                            <p className="channel-link">Link: {channel.link}</p>
                                            <p className="channel-updated">
                                                Updated: {channel.updatedAt}
                                            </p>
                                        </div>
                                        <button
                                            className={`bookmark-button ${
                                                isBookmarked(channel.id) ? "bookmarked" : ""
                                            }`}
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent triggering channel click
                                                toggleBookmark(channel);
                                            }}
                                        >
                                            {isBookmarked(channel.id) ? "★" : "☆"}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

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
                                        <p style={{whiteSpace: "pre-wrap"}}>
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
            </main>
        </div>
    );
};

export default Channels;