import { useState, useEffect } from "react";
import axios from "axios";

const useFetchPostDetails = () => {
    const [posts, setPosts] = useState([]);
    const [selectedDetails, setSelectedDetails] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const parseDateTime = (dateTime) => {
        if (!dateTime) return null;
        const dateString = dateTime.$date || dateTime;
        const parsedDate = new Date(dateString);
        return isNaN(parsedDate.getTime()) ? null : parsedDate.toISOString();
    };

    // 1. 게시글 목록
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                const response = await axios.get("http://localhost:8080/posts/all");
                const formattedData = response.data.map((post) => ({
                    id: post.id,
                    title: post.title,
                    content: post.content,
                    siteName: post.siteName,
                    promoSiteLink: post.promoSiteLink,
                    link: post.link,
                    timestamp: parseDateTime(post.timestamp),
                }));
                setPosts(formattedData);
            } catch (err) {
                setError(`Error fetching posts: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    const fetchPostsDetail = async (id) => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:8080/posts/id/${id}`);

            const post = response.data;

            const formattedPost = {
                id: post.id,
                title: post.title,
                content: post.content,
                siteName: post.siteName,
                promoSiteLink: post.promoSiteLink,
                link: post.link,
                timestamp: parseDateTime(post.timestamp),
            };

            setSelectedPost(formattedPost);
        } catch (err) {
            setError(`Error fetching post detail: ${err.message}`);
            setSelectedPost(null);
        } finally {
            setLoading(false);
        }
    };

    // 2. 게시글 유사도 분석용
    const fetchDetailsByPostId = async (postId) => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8080/post-similarity/${postId}`);
            const similarPosts = response.data?.similarPosts || [];

            const formattedDetails = similarPosts.map((item) => ({
                similarPost: item.similarPost,
                similarity: item.similarity,
            }));

            setSelectedDetails(formattedDetails);
            setSelectedPost(posts.find((post) => post.id === postId));
        } catch (err) {
            setError(`Error fetching similar posts: ${err.message}`);
            setSelectedDetails([]);
        } finally {
            setLoading(false);
        }
    };

    return {
        posts,
        selectedDetails,
        selectedPost,
        fetchDetailsByPostId,
        fetchPostsDetail,
        loading,
        error,
    };
};

export default useFetchPostDetails;