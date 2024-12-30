import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import useFetchPostDetails from "../hooks/useFetchPostDetails";
import "../css/page/Posts.css";

const Posts = () => {
    const { posts, selectedPost, fetchDetailsByPostId, loading, error } = useFetchPostDetails();
    const [selectedPostId, setSelectedPostId] = useState(null);

    const handlePostClick = (postId) => {
        setSelectedPostId(postId);
        fetchDetailsByPostId(postId); // Fetch post details
        console.log("Fetching details for postId:", postId);
    };

    return (
        <div className="posts-page">
            <Sidebar />
            <main className="posts-main">
                {/* Header */}
                <header className="posts-header">
                    <h1>Post Details View</h1>
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
                                                <strong>Timestamp:</strong> {post.timestamp}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    {/* Post Details */}
                    <section className="post-details">
                        <h3>Post Details</h3>
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
                                        <strong>Promo Link:</strong>{" "}
                                        <a
                                            href={`${selectedPost.promoSiteLink}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {selectedPost.promoSiteLink}
                                        </a>
                                    </p>
                                    <p>
                                        <strong>Timestamp:</strong> {selectedPost.timestamp}
                                    </p>
                                </div>

                                {selectedPost.link && (
                                    <iframe
                                        src={`${selectedPost.link}`}
                                        title="Promo Site"
                                        className="promo-iframe"
                                    ></iframe>
                                )}
                            </div>
                        ) : (
                            <p>Select a post to view its details.</p>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
};

export default Posts;
