import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import useFetchPostDetails from "../hooks/useFetchPostDetails";
import "../css/page/Posts.css";

const Posts = () => {
    const {
        posts,
        selectedDetails,
        selectedPost,
        fetchDetailsByPostId,
        loading,
        error,
    } = useFetchPostDetails();
    const [selectedPostId, setSelectedPostId] = useState(null);

    const handlePostClick = (postId) => {
        setSelectedPostId(postId);
        fetchDetailsByPostId(postId); // 문자열 그대로 전달
        console.log("Fetching details for postId:", postId);
    };

    return (
        <div className="posts-page">
            <Sidebar />
            <main className="posts-main">
                {/* Header */}
                <header className="posts-header">
                    <h1>Post Similarity Analysis</h1>
                </header>

                <div className="posts-content">
                    {/* Post List */}
                    <section className="posts-list">
                        <h3>Post List</h3>
                        {loading ? (
                            <p>Loading posts...</p>
                        ) : error ? (
                            <p className="error-message">{error}</p>
                        ) : (
                            <ul>
                                {posts.map((post) => (
                                    <li
                                        key={post.id}
                                        className={`post-item ${
                                            selectedPostId === post.id
                                                ? "active"
                                                : ""
                                        }`}
                                        onClick={() => handlePostClick(post.id)}
                                    >
                                        <div>
                                            <p>
                                                <strong>{post.title}</strong>
                                            </p>
                                            <p>
                                                <strong>Site:</strong>{" "}
                                                {post.siteName}
                                            </p>
                                            <p>
                                                <strong>Timestamp:</strong>{" "}
                                                {new Date(
                                                    post.timestamp
                                                ).toLocaleString()}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    {/* Post Details */}
                    <section className="post-details">
                        <h3>Similar Posts</h3>
                        {loading ? (
                            <p>Loading details...</p>
                        ) : selectedDetails.length > 0 ? (
                            <div className="details-content">
                                <ul>
                                    {selectedDetails.map((detail, index) => (
                                        <li key={index} className="detail-item">
                                            <div className="detail-box">
                                                <p>
                                                    <strong>Similar Post:</strong>{" "}
                                                    {detail.similarPost}
                                                </p>
                                                <p>
                                                    <strong>Similarity:</strong>{" "}
                                                    {(detail.similarity * 100).toFixed(2)}%
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                {selectedPost && selectedPost.promoSiteLink && (
                                    <iframe
                                        src={`https://${selectedPost.promoSiteLink}`}
                                        title="Promo Site"
                                        className="promo-iframe"
                                    ></iframe>
                                )}
                            </div>
                        ) : (
                            <p>No similar posts found for this post.</p>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
};

export default Posts;
