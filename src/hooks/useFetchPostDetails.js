import { useState, useEffect } from "react";
import axios from "axios";

const useFetchPostDetails = () => {
    const [posts, setPosts] = useState([]);
    const [selectedDetails, setSelectedDetails] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const parseDateTime = (dateTime) => {
        if (!dateTime) return null; // ✅ 날짜가 없으면 null 반환
        const dateString = dateTime.$date || dateTime;
        const parsedDate = new Date(dateString);
        return isNaN(parsedDate.getTime()) ? null : parsedDate.toISOString(); // ✅ UTC 형식으로 변환
    };

    // 1. Fetch post list
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                const response = await axios.get("http://localhost:8080/posts/all");
                const formattedData = response.data.map((post) => ({
                    id: post.id,
                    title: post.title,
                    siteName: post.siteName,
                    promoSiteLink: post.promoSiteLink,
                    link: post.link,
                    timestamp: parseDateTime(post.timestamp), // ✅ Date 객체를 ISO 문자열로 변환
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

    // 2. Fetch similar posts
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
        loading,
        error,
    };
};

export default useFetchPostDetails;