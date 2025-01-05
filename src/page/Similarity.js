import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import "../css/page/Similarity.css";
import axios from "axios";

const Similarity = () => {
    const [posts, setPosts] = useState([]); // Post data
    const [selectedPost, setSelectedPost] = useState(null); // Selected post
    const [similarPosts, setSimilarPosts] = useState([]); // Similar posts
    const [iframeSrc, setIframeSrc] = useState(""); // Iframe URL

    // Fetch all posts
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get("http://localhost:8080/posts/all");
                setPosts(response.data);
            } catch (error) {
                console.error("Error fetching posts:", error);
            }
        };

        fetchPosts();
    }, []);

    // Handle post selection
    const handlePostClick = (post) => {
        setSelectedPost(post);
        setIframeSrc(post.link); // Set iframe URL
        fetchSimilarPosts(post.id);
    };

    // Fetch similar posts for selected post
    const fetchSimilarPosts = async (postId) => {
        try {
            // Fetch similar posts from post_similarity table
            const response = await axios.get(
                `http://localhost:8080/post-similarity/post/${postId}`
            );

            if (response.data && response.data.similarPosts) {
                // Fetch details for each similar post from posts table
                const similarPostsWithDetails = await Promise.all(
                    response.data.similarPosts.map(async (similarPost) => {
                        try {
                            const postResponse = await axios.get(
                                `http://localhost:8080/posts/${similarPost.similarPost}`
                            );
                            const postDetails = postResponse.data;

                            return {
                                ...similarPost,
                                link: postDetails.link || "#", // Use '#' if link is missing
                                title: postDetails.title || "Unknown Title", // Fallback for missing title
                            };
                        } catch (error) {
                            console.error(
                                `Error fetching post details for ${similarPost.similarPost}:`,
                                error
                            );
                            return {
                                ...similarPost,
                                link: "#",
                                title: "Unknown Title",
                            };
                        }
                    })
                );

                // Sort similar posts by similarity
                const sortedSimilarPosts = similarPostsWithDetails.sort(
                    (a, b) => b.similarity - a.similarity
                );

                setSimilarPosts(sortedSimilarPosts);
            } else {
                setSimilarPosts([]); // No similar posts found
            }
        } catch (error) {
            console.error("Error fetching similar posts:", error);
            setSimilarPosts([]); // Reset similar posts on error
        }
    };

    return (
        <div className="similarity-page">
            <Sidebar />
            <main className="similarity-main">
                {/* Header */}
                <header className="similarity-header">
                    <h1>Similarity Analysis</h1>
                </header>

                <div className="content">
                    {/* Post List */}
                    <aside className="item-list">
                        <h3>Posts</h3>
                        <ul>
                            {posts.map((post) => (
                                <li
                                    key={post.id}
                                    className={`item ${selectedPost?.id === post.id ? "selected" : ""}`}
                                    onClick={() => handlePostClick(post)}
                                >
                                    <p className="item-title">{post.title}</p>
                                    <p className="item-site">
                                        <strong>Site:</strong> {post.siteName}
                                    </p>
                                    <p className="item-timestamp">
                                        <strong>Timestamp:</strong>{" "}
                                        {new Date(post.timestamp).toLocaleString()}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </aside>

                    {/* Similarity Details */}
                    <section className="similarity-details">
                        {selectedPost ? (
                            <>
                                {/* Iframe for promoSiteLink */}
                                <div className="iframe-container">
                                    <iframe
                                        src={iframeSrc}
                                        title="Promo Site"
                                        width="100%"
                                        height="600px"
                                        style={{ border: "none" }}
                                    />
                                </div>

                                {/* Similarity Results */}
                                <h3>Similarity Results for: {selectedPost.title}</h3>
                                <div className="similarity-results">
                                    {similarPosts.length > 0 ? (
                                        <ul>
                                            {similarPosts.map((similarPost, index) => (
                                                <li key={index} className="similarity-box">
                                                    <h4>
                                                        <a
                                                            href={similarPost.link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="similarity-link"
                                                        >
                                                            {similarPost.title}
                                                        </a>
                                                    </h4>
                                                    <p>
                                                        <strong>Similarity:</strong>{" "}
                                                        {(similarPost.similarity * 100).toFixed(2)}%
                                                    </p>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>No similar posts found.</p>
                                    )}
                                </div>
                            </>
                        ) : (
                            <p>Select a post to analyze similarity.</p>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
};

export default Similarity;
