import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Sidebar from "../components/Sidebar";
import useFetchPostDetails from "../hooks/useFetchPostDetails";
import "../css/page/Posts.css";

const Posts = () => {
    const { posts, selectedPost, fetchDetailsByPostId, loading, error } = useFetchPostDetails();
    const [selectedPostId, setSelectedPostId] = useState(null);

    // ✅ 검색 조건 상태
    const [searchTitle, setSearchTitle] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [filteredPosts, setFilteredPosts] = useState([]);

    // ✅ posts 데이터가 변경되면 filteredPosts를 초기화
    useEffect(() => {
        setFilteredPosts(posts);
    }, [posts]);

    // ✅ 게시글 클릭 시 상세 정보 가져오기
    const handlePostClick = (postId) => {
        setSelectedPostId(postId);
        fetchDetailsByPostId(postId);
    };

    // ✅ 검색 버튼 클릭 시 필터링
    const handleSearch = () => {
        let filtered = posts;

        // 제목 검색 필터
        if (searchTitle.trim() !== "") {
            filtered = filtered.filter((post) =>
                post.title.toLowerCase().includes(searchTitle.toLowerCase())
            );
        }

        // ✅ 날짜 범위 필터
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
                        <div className="datepickers">
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
                        </div>

                        <button className="search-button" onClick={handleSearch}>
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
                                                <p className="post-title">{post.title}</p>
                                                <p className="post-site">
                                                    <strong>Site:</strong> {post.siteName}
                                                </p>
                                                <p className="post-timestamp">
                                                    <strong>Posted Time:</strong>{" "}
                                                    {new Date(post.timestamp).toLocaleString()}
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
                                    <p>
                                        <strong>Post Title:</strong> {selectedPost.title}
                                    </p>
                                    <p>
                                        <strong>Site Name:</strong> {selectedPost.siteName}
                                    </p>
                                    <p>
                                        <strong>게시일:</strong>{" "}
                                        {new Date(selectedPost.timestamp).toLocaleString()}
                                    </p>
                                    <p>
                                        <strong>Promo Link:</strong>{" "}
                                        <a href={selectedPost.promoSiteLink} target="_blank" rel="noopener noreferrer">
                                            {selectedPost.promoSiteLink}
                                        </a>
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