// import React, { useState } from "react";
// import Sidebar from "../components/Sidebar";
// import "../css/page/Similarity.css";
// import useFetchData from "../hooks/useFetchSimilarityData";
// import axios from "axios";
//
// const Similarity = () => {
//     const [selectedItem, setSelectedItem] = useState(null); // Selected post or channel
//     const [similarities, setSimilarities] = useState([]); // Similar posts or channels
//     const [iframeSrc, setIframeSrc] = useState(""); // Iframe URL
//     const [mode, setMode] = useState("post"); // Current mode: "post" or "channel"
//
//     // Fetch data using custom hook
//     const { data: posts, loading: postsLoading, error: postsError } = useFetchData(
//         mode === "post" ? "http://localhost:8080/posts/all" : null,
//         [mode]
//     );
//     const { data: channels, loading: channelsLoading, error: channelsError } = useFetchData(
//         mode === "channel" ? "http://localhost:8080/channels/all" : null,
//         [mode]
//     );
//
//     // Toggle between post and channel modes
//     const handleToggle = () => {
//         setMode((prevMode) => (prevMode === "post" ? "channel" : "post"));
//         setSelectedItem(null);
//         setSimilarities([]);
//         setIframeSrc("");
//     };
//
//     // Fetch similarity details
//     const fetchSimilarities = async (id) => {
//         try {
//             const endpoint =
//                 mode === "post"
//                     ? `http://localhost:8080/post-similarity/post/${id}`
//                     : `http://localhost:8080/channel-similarity/chId/${id}`;
//             const response = await axios.get(endpoint);
//             const fetchedSimilarities = response.data.similarPosts || response.data.similarChannels;
//
//             // Fetch additional details for each similarity
//             const detailedSimilarities = await Promise.all(
//                 fetchedSimilarities.map(async (item) => {
//                     try {
//                         const detailEndpoint = `http://localhost:8080/${
//                             mode === "post" ? "posts" : "channels"
//                         }/id/${item.similarPost || item.similarChannel}`;
//                         const detailResponse = await axios.get(detailEndpoint);
//
//                         console.log("Detail Data:", detailResponse.data); // 🛠 디버깅용 로그 추가
//
//                         return {
//                             ...item,
//                             link: detailResponse.data.link || "#",
//                             title: detailResponse.data.title || "Unknown Title",
//                         };
//                     } catch (error) {
//                         console.error(`Error fetching details for ${item.similarPost || item.similarChannel}:`, error);
//                         return {
//                             ...item,
//                             link: "#",
//                             title: "Unknown Title",
//                         };
//                     }
//                 })
//             );
//
//             // Sort by similarity and update state
//             setSimilarities(detailedSimilarities.sort((a, b) => b.similarity - a.similarity));
//         } catch (error) {
//             console.error(`Error fetching ${mode} similarities:`, error);
//             setSimilarities([]);
//         }
//     };
//
//     // Handle item (post or channel) selection
//     const handleItemClick = (item) => {
//         setSelectedItem(item);
//         setIframeSrc(item.link || "");
//         fetchSimilarities(item.id);
//     };
//
//     return (
//         <div className="similarity-page">
//             <Sidebar />
//             <main className="similarity-main">
//                 {/* Header */}
//                 <header className="similarity-header">
//                     <h1>유사도 분석</h1>
//                     <button className="toggle-button" onClick={handleToggle}>
//                         {mode === "post" ? "채널 유사도 분석" : "게시글 유사도 분석"}
//                     </button>
//                 </header>
//
//                 <div className="content">
//                     {/* Item List */}
//                     <aside className="item-list">
//                         <h3>{mode === "post" ? "게시글" : "채널"}</h3>
//                         {mode === "post" && postsError && <p>{postsError}</p>}
//                         {mode === "channel" && channelsError && <p>{channelsError}</p>}
//                         {(mode === "post" ? postsLoading : channelsLoading) ? (
//                             <p>Loading...</p>
//                         ) : (
//                             <ul>
//                                 {(mode === "post" ? posts : channels).map((item) => (
//                                     <li
//                                         key={item.id}
//                                         className={`item ${
//                                             selectedItem?.id === item.id ? "selected" : ""
//                                         }`}
//                                         onClick={() => handleItemClick(item)}
//                                     >
//                                         <p className="item-title">{item.title}</p>
//                                         <p className="item-site">
//                                             <strong>Site:</strong> {item.siteName || "Unknown Site"}
//                                         </p>
//                                         <p className="item-timestamp">
//                                             <strong>Timestamp:</strong>{" "}
//                                             {new Date(item.timestamp).toLocaleString()}
//                                         </p>
//                                     </li>
//                                 ))}
//                             </ul>
//                         )}
//                     </aside>
//
//                     {/* Similarity Details */}
//                     <section className="similarity-details">
//                         {selectedItem ? (
//                             <>
//                                 <div className="iframe-container">
//                                     <iframe
//                                         src={iframeSrc}
//                                         title="Promo Site"
//                                         width="100%"
//                                         height="600px"
//                                         style={{ border: "none" }}
//                                     />
//                                 </div>
//                                 <h3>
//                                     유사도 분석 결과: {selectedItem.title || "Unknown Title"}
//                                 </h3>
//                                 <div className="similarity-results">
//                                     {similarities.length > 0 ? (
//                                         <ul>
//                                             {similarities.map((similar, index) => (
//                                                 <li key={index} className="similarity-box">
//                                                     <h4>
//                                                         <a
//                                                             href={similar.link}
//                                                             target="_blank"
//                                                             rel="noopener noreferrer"
//                                                             className="similarity-link"
//                                                         >
//                                                             {similar.title}
//                                                         </a>
//                                                     </h4>
//                                                     <p>
//                                                         <strong>유사도:</strong>{" "}
//                                                         {(similar.similarity * 100).toFixed(2)}%
//                                                     </p>
//                                                 </li>
//                                             ))}
//                                         </ul>
//                                     ) : (
//                                         <p>유사한 {mode === "post" ? "게시글" : "채널"} 정보가 없습니다.</p>
//                                     )}
//                                 </div>
//                             </>
//                         ) : (
//                             <p>{mode === "post" ? "게시글" : "채널"}을 선택해 주세요.</p>
//                         )}
//                     </section>
//                 </div>
//             </main>
//         </div>
//     );
// };
//
// export default Similarity;

import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import "../css/page/Similarity.css";
import axios from "axios";

const Similarity = () => {
    const [selectedItem, setSelectedItem] = useState(null); // 선택한 게시글
    const [similarities, setSimilarities] = useState([]); // 유사 게시글 목록
    const [iframeSrc, setIframeSrc] = useState(""); // Iframe URL
    const [posts, setPosts] = useState([]); // 게시글 목록
    const [loading, setLoading] = useState(true); // 데이터 로딩 상태
    const [error, setError] = useState(null); // 에러 상태

    // 📌 모든 게시글 가져오기
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get("http://localhost:8080/posts/all");
                setPosts(response.data);
            } catch (error) {
                console.error("Error fetching posts:", error);
                setError("게시글 데이터를 불러오는 중 오류 발생");
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    // 📌 특정 게시글 선택 시 유사 게시글 정보 가져오기
    const fetchSimilarities = async (id) => {
        try {
            const response = await axios.get(`http://localhost:8080/post-similarity/post/${id}`);
            const fetchedSimilarities = response.data.similarPosts || [];

            // 유사 게시글의 상세 정보 가져오기
            const detailedSimilarities = await Promise.all(
                fetchedSimilarities.map(async (item) => {
                    try {
                        const detailResponse = await axios.get(`http://localhost:8080/posts/id/${item.similarPost}`);
                        const details = detailResponse.data;

                        return {
                            ...item,
                            link: details.link || "#",
                            title: details.title || "Unknown Title",
                        };
                    } catch (error) {
                        console.error(`Error fetching details for ${item.similarPost}:`, error);
                        return {
                            ...item,
                            link: "#",
                            title: "Unknown Title",
                        };
                    }
                })
            );

            setSimilarities(detailedSimilarities.sort((a, b) => b.similarity - a.similarity));
        } catch (error) {
            console.error("Error fetching post similarities:", error);
            setSimilarities([]);
        }
    };

    // 📌 게시글 클릭 시 실행
    const handleItemClick = (item) => {
        setSelectedItem(item);
        setIframeSrc(item.link || "");
        fetchSimilarities(item.id);
    };

    return (
        <div className="similarity-page">
            <Sidebar />
            <main className="similarity-main">
                {/* 헤더 */}
                <header className="similarity-header">
                    <h1>게시글 유사도 분석</h1>
                </header>

                <div className="content">
                    {/* 게시글 리스트 */}
                    <aside className="item-list">
                        <h3>게시글 리스트</h3>
                        {error && <p className="error-message">{error}</p>}
                        {loading ? (
                            <p>Loading...</p>
                        ) : (
                            <ul>
                                {posts.map((item) => (
                                    <li
                                        key={item.id}
                                        className={`item ${selectedItem?.id === item.id ? "selected" : ""}`}
                                        onClick={() => handleItemClick(item)}
                                    >
                                        <p className="item-title">{item.title}</p>
                                        <p className="item-site">
                                            <strong>사이트:</strong> {item.siteName || "Unknown Site"}
                                        </p>
                                        <p className="item-timestamp">
                                            <strong>작성 시간:</strong>{" "}
                                            {new Date(item.timestamp).toLocaleString()}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </aside>

                    {/* 유사도 분석 결과 */}
                    <section className="similarity-details">
                        {selectedItem ? (
                            <>
                                <div className="iframe-container">
                                    <iframe
                                        src={iframeSrc}
                                        title="게시글 링크"
                                        width="100%"
                                        height="600px"
                                        style={{ border: "none" }}
                                    />
                                </div>
                                <h3>유사도 분석 결과: {selectedItem.title || "Unknown Title"}</h3>
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
                                        <p>유사한 게시글 정보가 없습니다.</p>
                                    )}
                                </div>
                            </>
                        ) : (
                            <p>게시글을 선택해 주세요.</p>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
};

export default Similarity;