import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import "../css/page/Similarity.css";
import useFetchData from "../hooks/useFetchSimilarityData";
import axios from "axios";

const Similarity = () => {
    const [selectedItem, setSelectedItem] = useState(null); // Selected post or channel
    const [similarities, setSimilarities] = useState([]); // Similar posts or channels
    const [iframeSrc, setIframeSrc] = useState(""); // Iframe URL
    const [mode, setMode] = useState("post"); // Current mode: "post" or "channel"

    // Fetch data using custom hook
    const { data: posts, loading: postsLoading, error: postsError } = useFetchData(
        mode === "post" ? "http://localhost:8080/posts/all" : null,
        [mode]
    );
    const { data: channels, loading: channelsLoading, error: channelsError } = useFetchData(
        mode === "channel" ? "http://localhost:8080/channels/all" : null,
        [mode]
    );

    // Toggle between post and channel modes
    const handleToggle = () => {
        setMode((prevMode) => (prevMode === "post" ? "channel" : "post"));
        setSelectedItem(null);
        setSimilarities([]);
        setIframeSrc("");
    };

    // Fetch similarity details
    const fetchSimilarities = async (id) => {
        try {
            const endpoint =
                mode === "post"
                    ? `http://localhost:8080/post-similarity/post/${id}`
                    : `http://localhost:8080/channel-similarity/chId/${id}`;
            const response = await axios.get(endpoint);
            const fetchedSimilarities = response.data.similarPosts || response.data.similarChannels;

            // Fetch additional details for each similarity
            const detailedSimilarities = await Promise.all(
                fetchedSimilarities.map(async (item) => {
                    try {
                        const detailEndpoint = `http://localhost:8080/${
                            mode === "post" ? "posts" : "channels"
                        }/${item.similarPost || item.similarChannel}`;
                        const detailResponse = await axios.get(detailEndpoint);
                        const details = detailResponse.data;

                        return {
                            ...item,
                            link: details.link || "#",
                            title: details.title || "Unknown Title",
                        };
                    } catch (error) {
                        console.error(`Error fetching details for ${item.similarPost || item.similarChannel}:`, error);
                        return {
                            ...item,
                            link: "#",
                            title: "Unknown Title",
                        };
                    }
                })
            );

            // Sort by similarity and update state
            setSimilarities(detailedSimilarities.sort((a, b) => b.similarity - a.similarity));
        } catch (error) {
            console.error(`Error fetching ${mode} similarities:`, error);
            setSimilarities([]);
        }
    };

    // Handle item (post or channel) selection
    const handleItemClick = (item) => {
        setSelectedItem(item);
        setIframeSrc(item.link || "");
        fetchSimilarities(item.id);
    };

    return (
        <div className="similarity-page">
            <Sidebar />
            <main className="similarity-main">
                {/* Header */}
                <header className="similarity-header">
                    <h1>유사도 분석</h1>
                    <button className="toggle-button" onClick={handleToggle}>
                        {mode === "post" ? "채널 유사도 분석" : "게시글 유사도 분석"}
                    </button>
                </header>

                <div className="content">
                    {/* Item List */}
                    <aside className="item-list">
                        <h3>{mode === "post" ? "게시글" : "채널"}</h3>
                        {mode === "post" && postsError && <p>{postsError}</p>}
                        {mode === "channel" && channelsError && <p>{channelsError}</p>}
                        {(mode === "post" ? postsLoading : channelsLoading) ? (
                            <p>Loading...</p>
                        ) : (
                            <ul>
                                {(mode === "post" ? posts : channels).map((item) => (
                                    <li
                                        key={item.id}
                                        className={`item ${
                                            selectedItem?.id === item.id ? "selected" : ""
                                        }`}
                                        onClick={() => handleItemClick(item)}
                                    >
                                        <p className="item-title">{item.title}</p>
                                        <p className="item-site">
                                            <strong>Site:</strong> {item.siteName || "Unknown Site"}
                                        </p>
                                        <p className="item-timestamp">
                                            <strong>Timestamp:</strong>{" "}
                                            {new Date(item.timestamp).toLocaleString()}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </aside>

                    {/* Similarity Details */}
                    <section className="similarity-details">
                        {selectedItem ? (
                            <>
                                <div className="iframe-container">
                                    <iframe
                                        src={iframeSrc}
                                        title="Promo Site"
                                        width="100%"
                                        height="600px"
                                        style={{ border: "none" }}
                                    />
                                </div>
                                <h3>
                                    유사도 분석 결과: {selectedItem.title || "Unknown Title"}
                                </h3>
                                <div className="similarity-results">
                                    {similarities.length > 0 ? (
                                        <ul>
                                            {similarities.map((similar, index) => (
                                                <li key={index} className="similarity-box">
                                                    <h4>
                                                        <a
                                                            href={similar.link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="similarity-link"
                                                        >
                                                            {similar.title}
                                                        </a>
                                                    </h4>
                                                    <p>
                                                        <strong>유사도:</strong>{" "}
                                                        {(similar.similarity * 100).toFixed(2)}%
                                                    </p>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>유사한 {mode === "post" ? "게시글" : "채널"} 정보가 없습니다.</p>
                                    )}
                                </div>
                            </>
                        ) : (
                            <p>{mode === "post" ? "게시글" : "채널"}을 선택해 주세요.</p>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
};

export default Similarity;
