import { useState, useEffect } from "react";
import axios from "axios";

const useFetchPostDetails = () => {
    const [posts, setPosts] = useState([]);
    const [selectedDetails, setSelectedDetails] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [totalCount, setTotalCount] = useState(0);
    const [postPage, setPostPage] = useState(0);

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
                const response = await axios.get(
                    `${process.env.REACT_APP_API_BASE_URL}/posts/all?page=${postPage}&size=10`,
                    { withCredentials: true }
                );
                const formattedData = (response.data.posts || []).map((post) => ({
                    id: post.id,
                    title: post.title,
                    content: post.content,
                    siteName: post.siteName,
                    promoSiteLink: post.promoSiteLink,
                    siteLink: post.link,
                    timestamp: post.timestamp && !isNaN(Date.parse(post.timestamp))
                        ? new Date(post.timestamp).toLocaleDateString("ko-KR")
                        : "날짜 없음",
                    updatedAt: post.updatedAt && !isNaN(Date.parse(post.updatedAt))
                        ? new Date(post.updatedAt).toLocaleDateString("ko-KR")
                        : "날짜 없음",
                    createdAt: post.createdAt && !isNaN(Date.parse(post.createdAt))
                        ? new Date(post.createdAt).toLocaleDateString("ko-KR")
                        : "날짜 없음",
                }));
                setPosts(formattedData);
                setTotalCount(response.data.totalCount || 0);
            } catch (err) {
                setError(`Error fetching posts: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [postPage]);

    const fetchPostsDetail = async (id) => {
        try {
            setLoading(true);
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/posts/id/${id}`, { withCredentials: true });

            const post = response.data;

            const formattedPost = {
                id: post.id,
                title: post.title,
                content: post.content,
                siteName: post.siteName,
                promoSiteLink: post.promoSiteLink,
                siteLink: post.link,
                timestamp: post.timestamp && !isNaN(Date.parse(post.timestamp))
                    ? new Date(post.timestamp).toLocaleDateString("ko-KR")
                    : "날짜 없음",
                updatedAt: post.updatedAt && !isNaN(Date.parse(post.updatedAt))
                    ? new Date(post.updatedAt).toLocaleDateString("ko-KR")
                    : "날짜 없음",
                createdAt: post.createdAt && !isNaN(Date.parse(post.createdAt))
                    ? new Date(post.createdAt).toLocaleDateString("ko-KR")
                    : "날짜 없음",
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
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/post-similarity/${postId}`, { withCredentials: true });
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
        totalCount,
        postPage,
        setPostPage
    };
};

export default useFetchPostDetails;