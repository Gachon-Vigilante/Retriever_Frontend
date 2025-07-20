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
                              - 마약 판매가 탐지된 웹 게시글을 확인하는 화면입니다.<br/><br/>
                              - 탐지된 게시글의 목록을 좌측에서 확인할 수 있습니다.<br/><br/>
                              - 게시글을 클릭하면 게시글의 제목, 게시된 사이트 이름, 게시일자, 탐지된 내용을 우측에서 볼 수 있습니다.<br/><br/>
                              - 아직 게시물이 접근 가능한 상태일 경우, 해당 게시물을 미리 볼 수 있습니다.
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
                                                    <strong>Site:</strong> {post.siteName || '없음'}
                                                </p>
                                                <p className="post-timestamp">
                                                    <strong>발견일시:</strong>{" "}
                                                    {new Date(post.createdAt).toLocaleDateString()}
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
                                    {/*<p> /!* 게시글 제목의 경우 null값으로 반환되므로 03.27 이후 미사용 예정*!/*/}
                                    {/*    <strong>게시글 제목:</strong> {selectedPost.title}*/}
                                    {/*</p>*/}
                                    <p>
                                        <strong>사이트 링크:</strong> {selectedPost.siteLink}
                                    </p>
                                    <p>
                                        <strong>발견일시:</strong>{" "}
                                        {new Date(selectedPost.createdAt).toLocaleDateString()}
                                    </p>
                                    <p>
                                        <strong>게시글 내용:</strong> {selectedPost.content}
                                    </p>
                                    <p>
                                        <strong>홍보 채널:</strong>{" "}
                                        {selectedPost.promoSiteLink}
                                    </p>
                                </div>

                                {selectedPost.siteLink && (
                                    <iframe
                                        src={selectedPost.siteLink}
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