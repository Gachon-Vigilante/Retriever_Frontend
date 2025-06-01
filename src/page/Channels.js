/* eslint-disable */
"use client";

import {useEffect, useState} from "react";
import { useSearchParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import useFetchChannelDetails from "../hooks/useFetchChannelDetails";
import useFetchBookmarks from "../hooks/useFetchBookmarks";
import "../css/page/Channels.css";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import ReactPaginate from "react-paginate";

const Channels = () => {
    const [searchParams] = useSearchParams();
    const initialTitle = searchParams.get("title");

    const {channels, selectedDetails, fetchDetailsByChannelId, loading, error} = useFetchChannelDetails();
    useEffect(() => {
        if (channels.length > 0 && initialTitle) {
            const matched = channels.find(c => (c.title || "").trim() === decodeURIComponent(initialTitle).trim());
            if (matched) {
                setSelectedChannelId(matched.id);
                fetchDetailsByChannelId(matched.id);
                setSelectedChannelDescription(matched.description || "가격 정보 없음");
            }
        }
    }, [channels, initialTitle]);
    const [selectedChannelId, setSelectedChannelId] = useState(null);
    // Removed expandedImages state
    const [modalImage, setModalImage] = useState(null);

    // Channel price ranges state
    const [channelPriceRanges, setChannelPriceRanges] = useState({});

    const [searchName, setSearchName] = useState("");
    const [searchId, setSearchId] = useState("");
    const [searchLink, setSearchLink] = useState("");
    const [filteredChannels, setFilteredChannels] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const userId = "admin";
    const {bookmarks, setBookmarks} = useFetchBookmarks(userId);
    const [showInactive, setShowInactive] = useState(false);

    const [selectedChannelDescription, setSelectedChannelDescription] = useState("");

    const [activePage, setActivePage] = useState(1);
    const [inactivePage, setInactivePage] = useState(1);
    const itemsPerPage = 5;
    const totalActivePages = Math.ceil(
        filteredChannels.filter((channel) => channel.status === "active").length / itemsPerPage
    );
    const totalInactivePages = Math.ceil(
        filteredChannels.filter((channel) => channel.status === "inactive").length / itemsPerPage
    );

    const isBookmarked = (channelId) => bookmarks.some((b) => b.channelId === channelId);

    const toggleBookmark = async (channel) => {
        try {
            if (isBookmarked(channel.id)) {
                const bookmark = bookmarks.find((b) => b.channelId === channel.id);
                await axios.delete(`http://localhost:8080/bookmarks/delete/${bookmark.id}`);
                setBookmarks((prev) => prev.filter((b) => b.channelId !== channel.id));
            } else {
                const newBookmark = {channelId: channel.id, userId};
                await axios.post("http://localhost:8080/bookmarks/add", newBookmark);
                setBookmarks((prev) => [...prev, newBookmark]);
            }
        } catch (err) {
            console.error("Error toggling bookmark:", err);
        }
    };

    const sortChannels = (channels) => {
        return [...channels].sort((a, b) => {
            const aBookmarked = isBookmarked(a.id);
            const bBookmarked = isBookmarked(b.id);
            return bBookmarked - aBookmarked;
        });
    };

    useEffect(() => {
        const filtered = channels.filter((channel) => {
            const name = channel.title || "";
            const id = channel.id?.toString() || "";
            const link = channel.link || "";

            return (
                (searchName === "" || name.toLowerCase().includes(searchName.toLowerCase())) &&
                (searchId === "" || id.includes(searchId)) &&
                (searchLink === "" || link.toLowerCase().includes(searchLink.toLowerCase()))
            );
        });

        if (filtered.length === 0) {
            setIsModalOpen(true);
        } else {
            setFilteredChannels(sortChannels(filtered));
        }
    }, [searchName, searchId, searchLink, channels, bookmarks]);

    useEffect(() => {
        if (channels.length > 0) {
            setFilteredChannels(sortChannels(channels));
        }
    }, [channels, bookmarks]);

    const handleChannelClick = (channelId) => {
        setSelectedChannelId(channelId);
        fetchDetailsByChannelId(channelId); // 💡 int64 기반 _id 넘겨줌
        const selected = channels.find((ch) => ch.id === channelId);
        setSelectedChannelDescription(selected?.description || "가격 정보 없음");
    };

    // Removed toggleImageSize function as image expansion is now handled via modal

    const closeModal = () => setIsModalOpen(false);


    return (
        <div className="channel-page">
            <Sidebar/>
            <main className="channel-main with-sidebar">
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
                        <button className="search-button" onClick={() => {
                        }}>
                            검색
                        </button>
                    </div>
                </header>

                <div className="channel-content">
                    <section className="channel-list">
                        <div
                            className="channel-price-summary"
                            style={{
                                position: "sticky",
                                top: 0,
                                zIndex: 10,
                                backgroundColor: "#f9f9f9",
                                padding: "10px",
                                borderBottom: "1px solid #ccc"
                            }}
                        >
                            <strong>선택한 채널 가격 정보:</strong>
                            <pre style={{ margin: 0 }}>{selectedChannelDescription}</pre>
                        </div>
                        <h3>채널 리스트</h3>
                        <label className="status-filter">
                            <input
                                type="checkbox"
                                checked={showInactive}
                                onChange={(e) => setShowInactive(e.target.checked)}
                            />
                            Inactive 채널도 보기
                        </label>

                        {!showInactive ? (
                            <>
                                <ul>
                                    {filteredChannels
                                        .filter((channel) => channel.status === "active")
                                        .slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage)
                                        .map((channel) => (
                                            <li
                                                key={channel.id}
                                                className={`channel-item ${selectedChannelId === channel.id ? "active" : ""}`}
                                                onClick={() => handleChannelClick(channel.id)}
                                            >
                                                <div>
                                                    <p className="channel-name">{channel.title || "제목 없음"}</p>
                                                    <p className="channel-username">@{channel.username || "unknown"}</p>
                                                    <p className="channel-id"><strong>ID:</strong> {channel.id}</p>
                                                    <p className="channel-status">
                                                        <strong>Status:</strong> {channel.status}</p>
                                                    <p className="channel-updated">
                                                        <strong>Updated:</strong> {channel.createdAt}</p>
                                                </div>
                                                <button
                                                    className={`bookmark-button ${isBookmarked(channel.id) ? "bookmarked" : ""}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleBookmark(channel);
                                                    }}
                                                >
                                                    {isBookmarked(channel.id) ? "★" : "☆"}
                                                </button>
                                            </li>
                                        ))}
                                </ul>
                                <ReactPaginate
                                    previousLabel={"<"}
                                    nextLabel={">"}
                                    pageCount={totalActivePages}
                                    onPageChange={({selected}) => setActivePage(selected + 1)}
                                    containerClassName={"pagination"}
                                    activeClassName={"active"}
                                />
                            </>
                        ) : (
                            <>
                                <h4>🟢 Active 채널</h4>
                                <ul>
                                    {filteredChannels
                                        .filter((channel) => channel.status === "active")
                                        .slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage)
                                        .map((channel) => (
                                            <li
                                                key={channel.id}
                                                className={`channel-item ${selectedChannelId === channel.id ? "active" : ""}`}
                                                onClick={() => handleChannelClick(channel.id)}
                                            >
                                                <div>
                                                    <p className="channel-name">{channel.title || "제목 없음"}</p>
                                                    <p className="channel-username">@{channel.username || "unknown"}</p>
                                                    <p className="channel-id"><strong>ID:</strong> {channel.id}</p>
                                                    <p className="channel-status">
                                                        <strong>Status:</strong> {channel.status}</p>
                                                    <p className="channel-updated">
                                                        <strong>Updated:</strong> {channel.createdAt}</p>
                                                </div>
                                                <button
                                                    className={`bookmark-button ${isBookmarked(channel.id) ? "bookmarked" : ""}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleBookmark(channel);
                                                    }}
                                                >
                                                    {isBookmarked(channel.id) ? "★" : "☆"}
                                                </button>
                                            </li>
                                        ))}
                                </ul>
                                <ReactPaginate
                                    previousLabel={"<"}
                                    nextLabel={">"}
                                    pageCount={totalActivePages}
                                    onPageChange={({selected}) => setActivePage(selected + 1)}
                                    containerClassName={"pagination"}
                                    activeClassName={"active"}
                                />

                                <h4>🔴 Inactive 채널</h4>
                                <ul>
                                    {filteredChannels
                                        .filter((channel) => channel.status === "inactive")
                                        .slice((inactivePage - 1) * itemsPerPage, inactivePage * itemsPerPage)
                                        .map((channel) => (
                                            <li
                                                key={channel.id}
                                                className={`channel-item ${selectedChannelId === channel.id ? "active" : ""}`}
                                                onClick={() => handleChannelClick(channel.id)}
                                            >
                                                <div>
                                                    <p className="channel-name">{channel.title || "제목 없음"}</p>
                                                    <p className="channel-username">@{channel.username || "unknown"}</p>
                                                    <p className="channel-id"><strong>ID:</strong> {channel.id}</p>
                                                    <p className="channel-status">
                                                        <strong>Status:</strong> {channel.status}</p>
                                                    <p className="channel-updated">
                                                        <strong>Updated:</strong> {channel.createdAt}</p>
                                                </div>
                                                <button
                                                    className={`bookmark-button ${isBookmarked(channel.id) ? "bookmarked" : ""}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleBookmark(channel);
                                                    }}
                                                >
                                                    {isBookmarked(channel.id) ? "★" : "☆"}
                                                </button>
                                            </li>
                                        ))}
                                </ul>
                                <ReactPaginate
                                    previousLabel={"<"}
                                    nextLabel={">"}
                                    pageCount={totalInactivePages}
                                    onPageChange={({selected}) => setInactivePage(selected + 1)}
                                    containerClassName={"pagination"}
                                    activeClassName={"active"}
                                />
                            </>
                        )}
                    </section>


                    <section className="channel-details">
                        <h3>채널 상세 정보</h3>
                        {loading && selectedChannelId ? (
                            <p>Loading details...</p>
                        ) : error ? (
                            <p className="error-message">{error}</p>
                        ) : selectedDetails.length > 0 ? (
                            <div className="details-content">
                                {selectedDetails.map((detail, index) => {
                                    let fileType = detail.mediaType || "";

                                    // 파일 타입 추정 (Base64 기반)
                                    if (detail.image) {
                                        if (detail.image.startsWith("/9j/")) fileType = "jpeg";
                                        else if (detail.image.startsWith("iVBOR")) fileType = "png";
                                        else if (detail.image.startsWith("R0lGOD")) fileType = "gif";
                                        else if (detail.image.startsWith("AAAA")) fileType = "mp4";
                                    }

                                    // Base64인지 URL인지 구분
                                    const isBase64 = detail.image && !detail.image.startsWith("http");

                                    return (
                                        <div key={index} className="detail-item">
                                            <p>
                                                <strong>Message URL:</strong>{" "}
                                                <a href={detail.msgUrl} target="_blank" rel="noreferrer">
                                                    {detail.msgUrl}
                                                </a>
                                            </p>
                                            <p>
                                                <strong>Text:</strong>
                                            </p>
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                rehypePlugins={[rehypeHighlight]}
                                                children={detail.text}
                                            />

                                            {/* 이미지 렌더링 */}
                                            {detail.image && fileType !== "mp4" && (
                                                isBase64 ? (
                                                    <img
                                                        src={isBase64 ? `data:image/${fileType};base64,${detail.image}` : detail.image}
                                                        alt="img"
                                                        className="channel-image"
                                                        onClick={() => setModalImage(isBase64 ? `data:image/${fileType};base64,${detail.image}` : detail.image)}
                                                    />
                                                ) : (
                                                    <img
                                                        src={detail.image}
                                                        alt="img"
                                                        className="channel-image"
                                                        onClick={() => setModalImage(detail.image)}
                                                    />
                                                )
                                            )}

                                            {/* 영상 렌더링 */}
                                            {detail.image && fileType === "mp4" && (
                                                isBase64 ? (
                                                    <video controls className="channel-video">
                                                        <source
                                                            src={`data:video/mp4;base64,${detail.image}`}
                                                            type="video/mp4"
                                                        />
                                                    </video>
                                                ) : (
                                                    <video controls className="channel-video">
                                                        <source
                                                            src={detail.image}
                                                            type="video/mp4"
                                                        />
                                                    </video>
                                                )
                                            )}

                                            <p>
                                                <strong>Timestamp:</strong> {detail.timestamp}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : selectedChannelId ? (
                            <p>채팅 데이터가 없습니다.</p>
                        ) : (
                            <p>채널을 선택해 주세요.</p>
                        )}
                    </section>
                </div>
            </main>
            {modalImage && (
                <div className="image-modal" onClick={() => setModalImage(null)}>
                    <img src={modalImage} alt="Full Size" className="modal-image"/>
                </div>
            )}
        </div>
    );
};

export default Channels;