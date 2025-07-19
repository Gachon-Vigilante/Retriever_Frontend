import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Sidebar from "../components/Sidebar";
import useFetchPostDetails from "../hooks/useFetchPostDetails";
import "../css/page/Posts.css";
import ReactPaginate from "react-paginate";

const Posts = () => {
    const {
        posts,
        selectedPost,
        fetchPostsDetail,
        loading,
        error,
        totalCount,
        postPage,
        setPostPage
    } = useFetchPostDetails();
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [similarities, setSimilarities] = useState([]);

    const [isTooltipVisible, setIsTooltipVisible] = useState(false);

    const handleClick = () => {
      setIsTooltipVisible((prev) => !prev);
    };

    const handleMouseEnter = () => {
      setIsTooltipVisible(true);
    };

    const handleMouseLeave = () => {
      setIsTooltipVisible(false);
    };

    const [searchTitle, setSearchTitle] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [filteredPosts, setFilteredPosts] = useState([]);

    const itemsPerPage = 10;

    useEffect(() => {
        setFilteredPosts(posts);
    }, [posts]);

    useEffect(() => {
        let filtered = posts;

        if (searchTitle.trim() !== "") {
            filtered = filtered.filter((post) =>
                post.title && post.title.toLowerCase().includes(searchTitle.toLowerCase())
            );
        }

        if (startDate || endDate) {
            filtered = filtered.filter((post) => {
                const dateStr = post.timestamp || post.createdAt;
                if (!dateStr) return false;
                const postDate = new Date(dateStr);
                return (
                    (!startDate || postDate.getTime() >= startDate.getTime()) &&
                    (!endDate || postDate.getTime() <= endDate.getTime())
                );
            });
        }

        setFilteredPosts(filtered);
    }, [searchTitle, startDate, endDate, posts]);

    const pageCount = Math.ceil(totalCount / itemsPerPage);

    const handlePostClick = (postId) => {
        setSelectedPostId(postId);
        fetchPostsDetail(postId);
    };

    return (
        <div className="posts-page">
            <Sidebar />
            <main className="posts-main with-sidebar">
                <header className="posts-header" style={{ position: "relative" }}>
                    {/*<div className="posts-title">*/}
                        <h1>거래 게시글</h1>
                    {/*</div>*/}
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
                    <div style={{ position: "absolute", top: 5, right: 1 }}>
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
                              이 화면에서는 거래 게시글의 제목과 날짜 범위로 검색할 수 있습니다.
                            검색 후 게시글을 클릭하면 상세 정보와 유사도 분석 결과를 확인할 수 있습니다.
                          </div>
                        )}
                    </div>
                </header>
                <div className="posts-content">
                    <section className="posts-list">
                        <h3 className="tooltip" data-tooltip="탐지된 거래글 목록이 표시됩니다.">거래글 목록</h3>
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
                        <ReactPaginate
                            previousLabel={"<"}
                            nextLabel={">"}
                            pageCount={pageCount}
                            onPageChange={({ selected }) => setPostPage(selected)}
                            pageRangeDisplayed={5}
                            marginPagesDisplayed={0}
                            breakLabel={null}
                            containerClassName={"pagination"}
                            activeClassName={"active"}
                        />
                    </section>

                    {/* Post Details */}
                    <section className="post-details">
                        <h3 className="tooltip" data-tooltip="선택한 게시글의 상세정보와, 실제 사이트에 게시된 홍보글을 확인합니다.">게시글 상세</h3>
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