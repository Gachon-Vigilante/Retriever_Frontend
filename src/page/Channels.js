"use client";

import React, {useEffect, useRef, useState} from "react";
import { useSearchParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import useFetchChannelDetails from "../hooks/useFetchChannelDetails";
import useFetchChannels from "../hooks/useFetchChannels";
import useFetchBookmarks from "../hooks/useFetchBookmarks";
import "../css/page/Channels.css";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import ReactPaginate from "react-paginate";
import "../css/components/Pagination.css";

const Channels = () => {
    const [searchParams] = useSearchParams();
    const initialTitle = searchParams.get("title");

    const { selectedDetails, channelMeta, fetchDetailsByChannelId, loading: detailsLoading, error: detailsError } = useFetchChannelDetails();
    const { channels, loading: channelsLoading, error: channelsError } = useFetchChannels();

    useEffect(() => {
        if (channels && channels.length > 0 && initialTitle) {
            const matched = channels.find(c => (c.title || "").trim() === decodeURIComponent(initialTitle).trim());
            if (matched) {
                setSelectedChannelId(matched.id);
                fetchDetailsByChannelId(matched.channelId ?? matched.id);
                setSelectedChannelDescription(matched.description || "가격 정보 없음");
            }
        }
    }, [channels, initialTitle]);

    useEffect(() => {
        if (channelMeta) {
            const desc = channelMeta.about || channelMeta.description || channelMeta.catalog?.summary || "";
            if (desc) setSelectedChannelDescription(desc);
        }
    }, [channelMeta]);

    const [selectedChannelId, setSelectedChannelId] = useState(null);
    const [modalImage, setModalImage] = useState(null);


    const [searchName, setSearchName] = useState("");
    const [searchId, setSearchId] = useState("");
    const [searchLink, setSearchLink] = useState("");
    const [filteredChannels, setFilteredChannels] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const {bookmarks, setBookmarks} = useFetchBookmarks();
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

    const isBookmarked = (channelId) => {
        if (!Array.isArray(bookmarks)) return false;
        return bookmarks.some((b) => b.channelId === channelId);
    };
const toggleBookmark = async (channel) => {
    try {
        if (isBookmarked(channel.id)) {
            const bookmark = bookmarks.find((b) => b.channelId === channel.id);
            await axios.delete(
                `${process.env.REACT_APP_API_BASE_URL}/bookmarks/delete/${bookmark.id}`,
                { withCredentials: true }
            );
            setBookmarks((prev) => prev.filter((b) => b.channelId !== channel.id));
        } else {
            await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/bookmarks/${channel.id}/add`,
                null,
                { withCredentials: true }
            );
            setBookmarks((prev) => [...prev, { channelId: channel.id }]);
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
        if (channels && channels.length > 0) {
            setFilteredChannels(sortChannels(channels));
        }
    }, [channels, bookmarks]);

    const handleChannelClick = (channel) => {
        setSelectedChannelId(channel.id);
        const apiParam = channel.channelId ?? channel.id;
        fetchDetailsByChannelId(apiParam);
        setSelectedChannelDescription(channel.description || "가격 정보 없음");
    };

    const [isTooltipVisible, setIsTooltipVisible] = useState(false);
    const [isTooltipClicked, setIsTooltipClicked] = useState(false);
    const tooltipRef = useRef(null);

    const handleClick = () => {
        setIsTooltipClicked(!isTooltipClicked);
        setIsTooltipVisible(!isTooltipClicked);
    };

    const handleMouseEnter = () => {
        if (!isTooltipClicked) setIsTooltipVisible(true);
    };

    const handleMouseLeave = () => {
        if (!isTooltipClicked) setIsTooltipVisible(false);
    };

    const handleClickOutside = (event) => {
        if (
            tooltipRef.current &&
            !tooltipRef.current.contains(event.target)
        ) {
            setIsTooltipClicked(false);
            setIsTooltipVisible(false);
        }
    };
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const closeModal = () => setIsModalOpen(false);


    return (
        <div className="channel-page">
            <Sidebar/>
            <main className="channel-main with-sidebar">
                <header className="channel-header">
                    <h1>텔레그램 채널</h1>
                    <div className="search-container-channel">
                        <input
                            type="text"
                            className="search-input-channel"
                            placeholder="채널 이름 검색"
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                        />
                        <input
                            type="text"
                            className="search-input-channel"
                            placeholder="채널 ID 검색"
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                        />
                        <button className="search-button" onClick={() => {
                        }}>
                            검색
                        </button>
                    </div>
                    <div style={{ position: "absolute", top: 25, right: 20 }}>
                        <button
                            className="tooltip-button"
                            onClick={handleClick}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            style={{
                                width: "50px",
                                height: "50px",
                                borderRadius: "50%",
                                border: "#007bff 1px solid",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: 0,
                                backgroundColor: "#fff",
                                cursor: "pointer",
                                fontSize: "3rem",
                                color: "#007bff",
                                fontWeight: "bold"
                            }}
                        >
                            ?
                        </button>
                        {isTooltipVisible && (
                            <div className="tooltip-box">
                                - 인터넷에서 마약 거래가 탐지된 텔레그램 채널을 확인하는 화면입니다.<br/><br/>
                                - 텔레그램 채널의 목록을 좌측에서 확인할 수 있습니다.<br/><br/>
                                - 채널을 클릭하면 채널에서 송수신된 채팅과 미디어를 조회할 수 있고, 좌측 상단에는 해당 텔레그램 채널에서 확인 가능한 마약의 품목과 가격 정보가 표시됩니다.<br/><br/>
                                - 기본적으로는 마약 거래가 탐지되는 것으로 확인되는 채널만 표시되지만, 목록 상단의 "Inactive 채널도 보기"를 클릭하면 그렇지 않은 채널들도 함께 볼 수 있습니다.
                            </div>
                        )}
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
                        <h3 className="tooltip" data-tooltip="탐지된 모든 텔레그램 채널을 active/inactive 형태로 표시합니다.">채널 리스트</h3>
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
                                                onClick={() => handleChannelClick(channel)}
                                            >
                                                <div>
                                                    <p className="channel-name">{channel.title || "제목 없음"}</p>
                                                    <p className="channel-username">@{channel.username || "unknown"}</p>
                                                    <p className="channel-id"><strong>ID:</strong> {channel.channelId ?? channel.id}</p>
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
                                    pageLinkClassName={"pagination-link"}
                                    pageClassName={"pagination-page"}
                                />
                            </>
                        ) : (
                            <>
                                <h4>🟢 활성화 채널</h4>
                                <ul>
                                    {filteredChannels
                                        .filter((channel) => channel.status === "active")
                                        .slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage)
                                        .map((channel) => (
                                            <li
                                                key={channel.id}
                                                className={`channel-item ${selectedChannelId === channel.id ? "active" : ""}`}
                                                onClick={() => handleChannelClick(channel)}
                                            >
                                                <div>
                                                    <p className="channel-name">{channel.title || "제목 없음"}</p>
                                                    <p className="channel-username">@{channel.username || "unknown"}</p>
                                                    <p className="channel-id"><strong>ID:</strong> {channel.channelId ?? channel.id}</p>
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
                                    pageLinkClassName={"pagination-link"}
                                    pageClassName={"pagination-page"}
                                />

                                <h4>🔴 비활성화 채널</h4>
                                <ul>
                                    {filteredChannels
                                        .filter((channel) => channel.status === "inactive")
                                        .slice((inactivePage - 1) * itemsPerPage, inactivePage * itemsPerPage)
                                        .map((channel) => (
                                            <li
                                                key={channel.id}
                                                className={`channel-item ${selectedChannelId === channel.id ? "active" : ""}`}
                                                onClick={() => handleChannelClick(channel)}
                                            >
                                                <div>
                                                    <p className="channel-name">{channel.title || "제목 없음"}</p>
                                                    <p className="channel-username">@{channel.username || "unknown"}</p>
                                                    <p className="channel-id"><strong>ID:</strong> {channel.channelId ?? channel.id}</p>
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
                                    pageLinkClassName={"pagination-link"}
                                    pageClassName={"pagination-page"}
                                />
                            </>
                        )}
                    </section>


                    <section className="channel-details">
                        <h3 className="tooltip" data-tooltip="선택한 텔레그램 채널의 상세 채팅 내역을 확인합니다.">채널 상세 정보</h3>
                        {detailsLoading && selectedChannelId ? (
                            <p>Loading details...</p>
                        ) : detailsError ? (
                            <p className="error-message">채널 상세를 불러오는 중 에러가 발생했습니다: {detailsError}</p>
                        ) : selectedDetails.length > 0 ? (
                            <div className="details-content">
                                {selectedDetails.map((detail, index) => {
                                    let fileType = detail.mediaType || "";

                                    if (detail.image) {
                                        if (detail.image.startsWith("/9j/")) fileType = "jpeg";
                                        else if (detail.image.startsWith("iVBOR")) fileType = "png";
                                        else if (detail.image.startsWith("R0lGOD")) fileType = "gif";
                                        else if (detail.image.startsWith("AAAA")) fileType = "mp4";
                                    }

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
