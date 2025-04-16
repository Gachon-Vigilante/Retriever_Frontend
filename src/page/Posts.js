import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Sidebar from "../components/Sidebar";
import useFetchPostDetails from "../hooks/useFetchPostDetails";
import "../css/page/Posts.css";
import axios from "axios";
import {Buffer} from "buffer";

const Posts = () => {
    const { posts, selectedPost, fetchPostsDetail, loading, error } = useFetchPostDetails();
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [similarities, setSimilarities] = useState([]);

    // ✅ 검색 조건 상태
    const [searchTitle, setSearchTitle] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [filteredPosts, setFilteredPosts] = useState([]);

    // ✅ posts 데이터가 변경되면 filteredPosts를 초기화
    useEffect(() => {
        setFilteredPosts(posts);
    }, [posts]);

    // ✅ 검색 조건에 따라 필터링
    useEffect(() => {
        let filtered = posts;

        if (searchTitle.trim() !== "") {
            filtered = filtered.filter((post) =>
                post.content && post.content.toLowerCase().includes(searchTitle.toLowerCase())
            );
        }

        if (startDate || endDate) {
            filtered = filtered.filter((post) => {
                if (!post.timestamp) return false;
                const postDate = new Date(post.timestamp);
                return (
                    (!startDate || postDate.getTime() >= startDate.getTime()) &&
                    (!endDate || postDate.getTime() <= endDate.getTime())
                );
            });
        }

        setFilteredPosts(filtered);
    }, [searchTitle, startDate, endDate, posts]);

    // ✅ 게시글 클릭 시 상세 정보 가져오기
    const handlePostClick = (postId) => {
        setSelectedPostId(postId);
        fetchPostsDetail(postId);
    };

    const fetchSimilarities = async (id) => {
        try {
            const res = await axios.get(`http://localhost:8080/post-similarity/post/${id}`);
            const fetched = res.data.similarPosts || [];

            const detailed = await Promise.all(
                fetched.map(async (item) => {
                    try {
                        const detail = await axios.get(`http://localhost:8080/posts/id/${item.similarPost}`);
                        return {
                            ...item,
                            title: detail.data.title || "제목 없음",
                            link: detail.data.link || "#",
                        };
                    } catch {
                        return {
                            ...item,
                            title: `게시글 ${item.similarPost}`,
                            link: "#",
                        };
                    }
                })
            );

            setSimilarities(detailed.sort((a, b) => b.similarity - a.similarity));
        } catch (err) {
            console.error("유사 게시글 로드 실패:", err);
            setSimilarities([]);
        }
    };

    const openGraph = () => {
        if (!selectedPost) return;

        const graphData = {
            rootPost: selectedPost.id,
            nodes: [
                { id: selectedPost.id, text: selectedPost.title, type: "main", color: "#ff5733" },
                ...similarities.map((post) => ({
                    id: post.similarPost,
                    text: post.title || post.similarPost,
                    type: "similar",
                    color: "#3375ff",
                })),
            ],
            lines: similarities.map((post) => ({
                from: selectedPost.id,
                to: post.similarPost,
                text: `유사도: ${(post.similarity * 100).toFixed(2)}%`,
                width: 2 + post.similarity * 5,
            })),
        };

        const encoded = encodeURIComponent(Buffer.from(JSON.stringify(graphData)).toString("base64"));
        window.open(`/network-graph?data=${encoded}`, "_blank");
    };

    return (
        <div className="posts-page">
            <Sidebar />
            <main className="posts-main">
                {/* 검색 조건 UI 추가 */}
                <header className="posts-header">
                    <div className="posts-title">
                        <h1>거래 게시글</h1>
                    </div>
                    <div className="search-container">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="거래글 제목 검색"
                            value={searchTitle}
                            onChange={(e) => setSearchTitle(e.target.value)}
                        />
                        {/*<div className="datepickers">*/}
                            <DatePicker
                                selected={startDate}
                                onChange={(date) => setStartDate(date)}
                                className="search-input"
                                placeholderText="시작 날짜"
                                dateFormat="yyyy-MM-dd"
                                showMonthYearDropdown
                            />
                            <DatePicker
                                selected={endDate}
                                onChange={(date) => setEndDate(date)}
                                className="search-input"
                                placeholderText="종료 날짜"
                                dateFormat="yyyy-MM-dd"
                                showMonthYearDropdown
                            />
                        {/*</div>*/}

                        <button className="search-button" onClick={() => {}}>
                            검색
                        </button>
                    </div>
                </header>
                <div className="posts-content">
                    {/* Post List */}
                    <section className="posts-list">
                        <h3>거래글 목록</h3>
                        {loading ? (
                            <p>Loading posts...</p>
                        ) : error ? (
                            <p className="error-message">{error}</p>
                        ) : (
                            <ul>
                                {filteredPosts.length > 0 ? (
                                    filteredPosts.map((post) => (
                                        <li
                                            key={post.id}
                                            className={`post-item ${
                                                selectedPostId === post.id ? "active" : ""
                                            }`}
                                            onClick={() => handlePostClick(post.id)}
                                        >
                                            <div>
                                                <p className="post-title">
                                                    {post.content.length > 30 ? post.content.slice(0, 30) + "..." : post.content}
                                                </p>
                                                <p className="post-site">
                                                    <strong>Site:</strong> {post.siteName}
                                                </p>
                                                <p className="post-timestamp">
                                                    <strong>Posted Time:</strong>{" "}
                                                    {new Date(post.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </li>
                                    ))
                                ) : (
                                    <p>검색 결과가 없습니다.</p>
                                )}
                            </ul>
                        )}
                    </section>

                    {/* Post Details */}
                    <section className="post-details">
                        <h3>게시글 상세</h3>
                        {selectedPost ? (
                            <div className="details-content">
                                <div className="detail-box">
                                    <p> {/* 게시글 제목의 경우 null값으로 반환되므로 03.27 이후 미사용 예정*/}
                                        <strong>게시글 제목:</strong> {selectedPost.title}
                                    </p>
                                    <p>
                                        <strong>사이트명:</strong> {selectedPost.siteName}
                                    </p>
                                    <p>
                                        <strong>게시일:</strong>{" "}
                                        {new Date(selectedPost.createdAt).toLocaleString()}
                                    </p>
                                    <p>
                                        <strong>게시글 내용:</strong> {selectedPost.content}
                                    </p>
                                    <p>
                                        <strong>Promo Link:</strong>{" "}
                                        {selectedPost.promoSiteLink}
                                    </p>
                                </div>

                                {/* ✅ iframe 추가 */}
                                {selectedPost.link && (
                                    <iframe
                                        src={selectedPost.link}
                                        title="Promo Site"
                                        className="promo-iframe"
                                        width="100%"
                                        height="500px"
                                        style={{
                                            border: "none",
                                            marginTop: "20px",
                                            borderRadius: "8px",
                                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)"
                                        }}
                                    ></iframe>
                                )}
                                <h3>유사도 분석 결과: {selectedPost.title}</h3>
                                <button className="similarity-modal-button" onClick={openGraph}>
                                    유사도 보기 (새 창)
                                </button>
                                <div className="similarity-results">
                                    {similarities.length > 0 ? (
                                        <ul>
                                            {similarities.map((similar, idx) => (
                                                <li key={idx} className="similarity-box">
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
                                                    <p><strong>유사도:</strong> {(similar.similarity * 100).toFixed(2)}%</p>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>유사한 게시글이 없습니다.</p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <p>게시글을 선택해 주세요.</p>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
};

export default Posts;