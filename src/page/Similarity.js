import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import "../css/page/Similarity.css";
import axios from "axios";

const Similarity = () => {
    const [toggle, setToggle] = useState("posts"); // Toggle between channels and posts
    const [posts, setPosts] = useState([]); // Post data
    const [selectedPost, setSelectedPost] = useState(null); // Selected post
    const [similarPosts, setSimilarPosts] = useState([]); // Similar posts

    const [channels] = useState([]); // Placeholder for channels (unchanged functionality)
    const [selectedChannel] = useState(null); // Placeholder for selected channel

    // Fetch all posts on component mount
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

    // Handle post selection and fetch similarity data
    const handlePostClick = (post) => {
        setSelectedPost(post);
        fetchSimilarPosts(post.id);
    };

    // Fetch similar posts for the selected post
    const fetchSimilarPosts = async (postId) => {
        try {
            const response = await axios.get(`http://localhost:8080/post-similarity/post/${postId}`);
            if (response.data && response.data.similarPosts) {
                setSimilarPosts(response.data.similarPosts);
            } else {
                setSimilarPosts([]); // No similar posts found
            }
        } catch (error) {
            console.error("Error fetching similar posts:", error);
        }
    };

    return (
        <div className="similarity-page">
            <Sidebar />
            <main className="similarity-main">
                <header className="similarity-header">
                    <h1>Similarity Analysis</h1>
                    <div className="toggle-buttons">
                        <button
                            className={`toggle-button ${toggle === "posts" ? "active" : ""}`}
                            onClick={() => setToggle("posts")}
                        >
                            Posts
                        </button>
                        <button
                            className={`toggle-button ${toggle === "channels" ? "active" : ""}`}
                            onClick={() => setToggle("channels")}
                        >
                            Channels
                        </button>
                    </div>
                </header>

                <div className="content">
                    {/* Post Section */}
                    {toggle === "posts" && (
                        <>
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
                                            <p className="item-content">{post.content}</p>
                                        </li>
                                    ))}
                                </ul>
                            </aside>

                            <section className="similarity-details">
                                {selectedPost ? (
                                    <>
                                        <h3>Analyzing Similarity for: {selectedPost.title}</h3>
                                        <p>{selectedPost.content}</p>
                                        <div className="similarity-results">
                                            <h4>Similarity Scores:</h4>
                                            {similarPosts.length > 0 ? (
                                                <ul>
                                                    {similarPosts.map((similarPost) => (
                                                        <li key={similarPost.id}>
                                                            {similarPost.title}: {similarPost.similarityScore}%
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
                        </>
                    )}

                    {/* Channel Section (Unchanged) */}
                    {toggle === "channels" && (
                        <>
                            <aside className="item-list">
                                <h3>Channels</h3>
                                <ul>
                                    {channels.map((channel) => (
                                        <li
                                            key={channel.id}
                                            className={`item ${selectedChannel?.id === channel.id ? "selected" : ""}`}
                                        >
                                            <p className="item-name">{channel.name}</p>
                                            <p className="item-description">{channel.description}</p>
                                        </li>
                                    ))}
                                </ul>
                            </aside>

                            <section className="similarity-details">
                                <p>Channel similarity analysis is not implemented yet.</p>
                            </section>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Similarity;
