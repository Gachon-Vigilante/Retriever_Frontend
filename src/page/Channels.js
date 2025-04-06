// "use client"
//
// import { useEffect, useState } from "react"
// import Sidebar from "../components/Sidebar"
// import useFetchChannelDetails from "../hooks/useFetchChannelDetails"
// import useFetchBookmarks from "../hooks/useFetchBookmarks"
// import "../css/page/Channels.css"
// import axios from "axios"
//
// const Channels = () => {
//     const { channels, selectedDetails, fetchDetailsByChannelId, loading, error } = useFetchChannelDetails()
//     const [selectedChannelId, setSelectedChannelId] = useState(null)
//
//     const [searchName, setSearchName] = useState("")
//     const [searchId, setSearchId] = useState("")
//     const [searchLink, setSearchLink] = useState("")
//     const [filteredChannels, setFilteredChannels] = useState([])
//
//     const [isModalOpen, setIsModalOpen] = useState(false)
//     const userId = "admin"
//     const { bookmarks, setBookmarks, loading: bookmarksLoading, error: bookmarksError } = useFetchBookmarks(userId)
//
//     // Check if a channel is bookmarked
//     const isBookmarked = (channelId) => bookmarks.some((bookmark) => bookmark.channelId === channelId)
//
//     // Toggle bookmark
//     const toggleBookmark = async (channel) => {
//         try {
//             if (isBookmarked(channel.id)) {
//                 const bookmark = bookmarks.find((bookmark) => bookmark.channelId === channel.id)
//                 await axios.delete(`http://localhost:8080/bookmarks/delete/${bookmark.id}`)
//                 setBookmarks((prev) => prev.filter((b) => b.channelId !== channel.id))
//             } else {
//                 const newBookmark = {
//                     channelId: channel.id,
//                     userId: userId,
//                 }
//                 await axios.post("http://localhost:8080/bookmarks/add", newBookmark)
//                 setBookmarks((prev) => [...prev, newBookmark])
//             }
//         } catch (error) {
//             console.error("Error toggling bookmark:", error)
//         }
//     }
//
//     // Sort channels to show bookmarked channels first
//     const sortChannels = (channels) => {
//         return [...channels].sort((a, b) => {
//             const aBookmarked = isBookmarked(a.id)
//             const bBookmarked = isBookmarked(b.id)
//             if (aBookmarked && !bBookmarked) return -1
//             if (!aBookmarked && bBookmarked) return 1
//             return 0
//         })
//     }
//
//     // Perform search and sort results
//     const handleSearch = () => {
//         const filtered = channels.filter((channel) => {
//             const channelName = channel.title || channel.name || ""
//             const channelId = channel.id || ""
//             const channelLink = channel.link || ""
//
//             const matchesName = searchName.trim() === "" || channelName.toLowerCase().includes(searchName.toLowerCase())
//             const matchesId = searchId.trim() === "" || channelId.toString().toLowerCase().includes(searchId.toLowerCase())
//             const matchesLink = searchLink.trim() === "" || channelLink.toLowerCase().includes(searchLink.toLowerCase())
//             return matchesName && matchesId && matchesLink
//         })
//
//         if (filtered.length === 0) {
//             setIsModalOpen(true)
//         } else {
//             setFilteredChannels(sortChannels(filtered)) // Sort filtered results
//         }
//     }
//
//     // Initial sorting when channels are loaded
//     useEffect(() => {
//         if (channels.length > 0) {
//             setFilteredChannels(sortChannels(channels))
//         }
//     }, [channels, bookmarks])
//
//     const closeModal = () => setIsModalOpen(false)
//
//     // Handle channel click
//     const handleChannelClick = (mongoId) => {
//         setSelectedChannelId(mongoId)
//
//         // 선택된 채널 찾기
//         const selectedChannel = channels.find((channel) => channel._id === mongoId)
//
//         if (selectedChannel) {
//             console.log(`Selected channel: ${selectedChannel.title || selectedChannel.name}`)
//             console.log(`Using numeric ID: ${selectedChannel.id}`)
//
//             // 채널 상세 정보 ��져오기
//             fetchDetailsByChannelId(mongoId)
//         } else {
//             console.error("Selected channel not found")
//         }
//     }
//
//     return (
//         <div className="channel-page">
//             <Sidebar />
//             <main className="channel-main">
//                 {/* Header */}
//                 <header className="channel-header">
//                     <div className="channel-title">
//                         <h1>텔레그램 채널</h1>
//                     </div>
//                     <div className="search-container">
//                         <input
//                             type="text"
//                             className="search-input"
//                             placeholder="채널 이름 검색"
//                             value={searchName}
//                             onChange={(e) => setSearchName(e.target.value)}
//                         />
//                         <input
//                             type="text"
//                             className="search-input"
//                             placeholder="채널 ID 검색"
//                             value={searchId}
//                             onChange={(e) => setSearchId(e.target.value)}
//                         />
//                         <input
//                             type="text"
//                             className="search-input"
//                             placeholder="채널 링크 검색"
//                             value={searchLink}
//                             onChange={(e) => setSearchLink(e.target.value)}
//                         />
//                         <button className="search-button" onClick={handleSearch}>
//                             검색
//                         </button>
//                     </div>
//                     {/*<button className="download-button">데이터 다운로드</button>*/}
//                 </header>
//
//                 {/* Content */}
//                 <div className="channel-content">
//                     <section className="channel-list">
//                         <h3>채널 리스트</h3>
//                         {loading ? (
//                             <p>Loading channels...</p>
//                         ) : error ? (
//                             <p className="error-message">{error}</p>
//                         ) : (
//                             <ul>
//                                 {filteredChannels.map((channel) => (
//                                     <li
//                                         key={channel._id}
//                                         className={`channel-item ${selectedChannelId === channel._id ? "active" : ""}`}
//                                         onClick={() => handleChannelClick(channel._id)}
//                                     >
//                                         <div>
//                                             <p className="channel-name">{channel.title || channel.name || "제목 없음"}</p>
//                                             <p className="channel-username">@{channel.username || "unknown"}</p>
//                                             {channel.id && (
//                                                 <p className="channel-numeric-id">
//                                                     <strong>채널 ID:</strong> {channel.id}
//                                                 </p>
//                                             )}
//                                             <p className="channel-link">Link: {channel.link}</p>
//                                             <p className="channel-updated">Updated: {channel.updatedAt}</p>
//                                         </div>
//                                         <button
//                                             className={`bookmark-button ${isBookmarked(channel._id) ? "bookmarked" : ""}`}
//                                             onClick={(e) => {
//                                                 e.stopPropagation() // Prevent triggering channel click
//                                                 toggleBookmark(channel)
//                                             }}
//                                         >
//                                             {isBookmarked(channel._id) ? "★" : "☆"}
//                                         </button>
//                                     </li>
//                                 ))}
//                             </ul>
//                         )}
//                     </section>
//
//                     <section className="channel-details">
//                         <h3>채널 상세 정보</h3>
//                         {loading && selectedChannelId ? (
//                             <p>Loading details...</p>
//                         ) : error ? (
//                             <p className="error-message">{error}</p>
//                         ) : selectedDetails.length > 0 ? (
//                             <div className="details-content">
//                                 {selectedDetails.map((detail, index) => {
//                                     // 미디어 타입 처리 로직
//                                     let fileType = detail.mediaType || ""
//                                     if (!fileType && detail.image) {
//                                         // Base64 이미지 타입 감지
//                                         if (detail.image.startsWith("/9j/")) fileType = "jpeg"
//                                         else if (detail.image.startsWith("R0lGOD")) fileType = "gif"
//                                         else if (detail.image.startsWith("iVBOR")) fileType = "png"
//                                         else if (detail.image.startsWith("AAAA")) fileType = "mp4"
//                                     }
//
//                                     return (
//                                         <div key={index} className="detail-item">
//                                             <p>
//                                                 <strong>Message URL:</strong>{" "}
//                                                 <a href={detail.msgUrl} target="_blank" rel="noreferrer">
//                                                     {detail.msgUrl}
//                                                 </a>
//                                             </p>
//                                             <p className="channel-text">
//                                                 <strong>Text:</strong> {detail.text}
//                                             </p>
//
//                                             {/* 발신자 정보 표시 */}
//                                             {detail.sender && (
//                                                 <p>
//                                                     <strong>Sender:</strong> {detail.sender.name || detail.sender.id || "Unknown"}
//                                                 </p>
//                                             )}
//
//                                             {/* 이미지 URL 직접 사용 (Base64가 아닌 경우) */}
//                                             {detail.image &&
//                                                 !detail.image.startsWith("/") &&
//                                                 !detail.image.startsWith("i") &&
//                                                 !detail.image.startsWith("R") &&
//                                                 !detail.image.startsWith("A") && (
//                                                     <img src={detail.image || "/placeholder.svg"} alt="채널 이미지" className="channel-image" />
//                                                 )}
//
//                                             {/* Base64 이미지 처리 */}
//                                             {detail.image &&
//                                                 (detail.image.startsWith("/") ||
//                                                     detail.image.startsWith("i") ||
//                                                     detail.image.startsWith("R")) &&
//                                                 fileType !== "mp4" && (
//                                                     <img
//                                                         src={`data:image/${fileType};base64,${detail.image}`}
//                                                         alt="채널 이미지"
//                                                         className="channel-image"
//                                                     />
//                                                 )}
//
//                                             {/* 비디오 처리 */}
//                                             {detail.image &&
//                                                 (detail.image.startsWith("A") || fileType === "mp4" || fileType === "video/mp4") && (
//                                                     <video controls width="300" className="channel-video">
//                                                         <source
//                                                             src={
//                                                                 detail.image.startsWith("A") ? `data:video/mp4;base64,${detail.image}` : detail.image
//                                                             }
//                                                             type="video/mp4"
//                                                         />
//                                                         Your browser does not support the video tag.
//                                                     </video>
//                                                 )}
//
//                                             <p>
//                                                 <strong>Timestamp:</strong> {detail.timestamp}
//                                             </p>
//                                         </div>
//                                     )
//                                 })}
//                             </div>
//                         ) : (
//                             <p>채널을 선택해 주세요.</p>
//                         )}
//                     </section>
//                 </div>
//             </main>
//         </div>
//     )
// }
//
// export default Channels
//
"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import useFetchChannelDetails from "../hooks/useFetchChannelDetails";
import useFetchBookmarks from "../hooks/useFetchBookmarks";
import "../css/page/Channels.css";
import axios from "axios";

const Channels = () => {
    const { channels, selectedDetails, fetchDetailsByChannelId, loading, error } = useFetchChannelDetails();
    const [selectedChannelId, setSelectedChannelId] = useState(null);

    const [searchName, setSearchName] = useState("");
    const [searchId, setSearchId] = useState("");
    const [searchLink, setSearchLink] = useState("");
    const [filteredChannels, setFilteredChannels] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const userId = "admin";
    const { bookmarks, setBookmarks } = useFetchBookmarks(userId);

    const isBookmarked = (channelId) => bookmarks.some((b) => b.channelId === channelId);

    const toggleBookmark = async (channel) => {
        try {
            if (isBookmarked(channel._id)) {
                const bookmark = bookmarks.find((b) => b.channelId === channel._id);
                await axios.delete(`http://localhost:8080/bookmarks/delete/${bookmark.id}`);
                setBookmarks((prev) => prev.filter((b) => b.channelId !== channel._id));
            } else {
                const newBookmark = { channelId: channel._id, userId };
                await axios.post("http://localhost:8080/bookmarks/add", newBookmark);
                setBookmarks((prev) => [...prev, newBookmark]);
            }
        } catch (err) {
            console.error("Error toggling bookmark:", err);
        }
    };

    const sortChannels = (channels) => {
        return [...channels].sort((a, b) => {
            const aBookmarked = isBookmarked(a._id);
            const bBookmarked = isBookmarked(b._id);
            return bBookmarked - aBookmarked;
        });
    };

    const handleSearch = () => {
        const filtered = channels.filter((channel) => {
            const name = channel.title || "";
            const id = channel._id?.toString() || "";
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
    };

    useEffect(() => {
        if (channels.length > 0) {
            setFilteredChannels(sortChannels(channels));
        }
    }, [channels, bookmarks]);

    const handleChannelClick = (channelId) => {
        setSelectedChannelId(channelId);
        fetchDetailsByChannelId(channelId); // 💡 int64 기반 _id 넘겨줌
    };

    const closeModal = () => setIsModalOpen(false);

    return (
        <div className="channel-page">
            <Sidebar />
            <main className="channel-main">
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
                </header>

                <div className="channel-content">
                    <section className="channel-list">
                        <h3>채널 리스트</h3>
                        {loading ? (
                            <p>Loading...</p>
                        ) : error ? (
                            <p className="error-message">{error}</p>
                        ) : (
                            <ul>
                                {filteredChannels.map((channel) => (
                                    <li
                                        key={channel._id}
                                        className={`channel-item ${selectedChannelId === channel._id ? "active" : ""}`}
                                        onClick={() => handleChannelClick(channel._id)}
                                    >
                                        <div>
                                            <p className="channel-name">{channel.title || "제목 없음"}</p>
                                            <p className="channel-username">@{channel.username || "unknown"}</p>
                                            <p className="channel-id"><strong>ID:</strong> {channel._id}</p>
                                            <p className="channel-status"><strong>Status:</strong> {channel.status}</p>
                                            <p className="channel-updated"><strong>Updated:</strong> {channel.updatedAt}</p>
                                        </div>
                                        <button
                                            className={`bookmark-button ${isBookmarked(channel._id) ? "bookmarked" : ""}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleBookmark(channel);
                                            }}
                                        >
                                            {isBookmarked(channel._id) ? "★" : "☆"}
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
                                                <strong>Text:</strong> {detail.text}
                                            </p>

                                            {/* 이미지 렌더링 */}
                                            {detail.image && fileType !== "mp4" && (
                                                isBase64 ? (
                                                    <img
                                                        src={`data:image/${fileType};base64,${detail.image}`}
                                                        alt="img"
                                                        className="channel-image"
                                                    />
                                                ) : (
                                                    <img
                                                        src={detail.image}
                                                        alt="img"
                                                        className="channel-image"
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
                        ) : (
                            <p>채널을 선택해 주세요.</p>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
};

export default Channels;