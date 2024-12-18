import { useState, useEffect } from "react";
import axios from "axios";

const useFetchPostDetails = () => {
    const [posts, setPosts] = useState([]); // Posts list
    const [selectedDetails, setSelectedDetails] = useState([]); // Similar posts
    const [selectedPost, setSelectedPost] = useState(null); // Selected post details
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const parseDateTime = (dateTime) => {
        if (!dateTime) return "N/A"; // Return N/A if null or undefined
        const dateString = dateTime.$date || dateTime; // Check for nested $date
        const parsedDate = new Date(dateString);
        return isNaN(parsedDate.getTime()) ? "N/A" : parsedDate.toLocaleString();
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

    // 2. Fetch similar posts
    const fetchDetailsByPostId = async (postId) => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8080/post-similarity/${postId}`);

            // 데이터 안전 확인
            const similarPosts = response.data?.similarPosts || []; // similarPosts가 undefined일 경우 빈 배열 사용

            const formattedDetails = similarPosts.map((item) => ({
                similarPost: item.similarPost,
                similarity: item.similarity,
            }));

            setSelectedDetails(formattedDetails);

            // 선택된 Post 저장
            setSelectedPost(posts.find((post) => post.id === postId));
        } catch (err) {
            setError(`Error fetching similar posts: ${err.message}`);
            setSelectedDetails([]); // 초기화
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
