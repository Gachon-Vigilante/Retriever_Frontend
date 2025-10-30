import { useState, useEffect } from "react";
import axiosInstance from "../axiosConfig";

const useFetchPostDetails = () => {
    const [posts, setPosts] = useState([]);
    const [selectedDetails, setSelectedDetails] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [totalCount, setTotalCount] = useState(0);
    const [postPage, setPostPage] = useState(0);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                const size = 10;

                const initRes = await axiosInstance.get(
                    `${process.env.REACT_APP_API_BASE_URL}/posts/all?page=1&size=1`,
                    { withCredentials: true }
                );
                const initData = initRes.data?.data ?? initRes.data;
                let attemptTotal = Number(initData?.totalCount ?? initData?.total ?? 0);
                setTotalCount(attemptTotal);

                let attempts = 0;
                const maxAttempts = 10;
                let postsArray = [];
                let lastRespData = initData;

                while (attempts < maxAttempts) {
                    const totalPages = Math.max(1, Math.ceil(attemptTotal / size));
                    let backendPage = totalPages - (Number(postPage) || 0);
                    if (backendPage < 1) backendPage = 1;

                    const response = await axiosInstance.get(
                        `${process.env.REACT_APP_API_BASE_URL}/posts/all?page=${backendPage}&size=${size}`,
                        { withCredentials: true }
                    );
                    lastRespData = response.data?.data ?? response.data;
                    postsArray = lastRespData?.posts ?? [];

                    if ((postsArray && postsArray.length > 0) || backendPage <= 1) {
                        break;
                    }

                    if (postsArray.length === 0 && attemptTotal > size) {
                        attemptTotal = Math.max(0, attemptTotal - size);
                        attempts++;
                        continue;
                    }
                    break;
                }

                const formattedData = (postsArray || []).map((post) => {
                    const isoDate = post.discoveredAt || post.createdAt || post.publishedAt || post.updatedAt || post.timestamp || null;

                    return {
                        id: post.id,
                        title: post.title || "제목 없음",
                        content: post.text ?? post.description ?? post.title ?? "",
                        siteName: post.siteName ?? null,
                        promoSiteLink: post.promoSiteLink ?? null,
                        siteLink: post.link ?? post.siteLink ?? null,
                        createdAt: isoDate,
                        updatedAt: post.updatedAt || post.publishedAt || post.createdAt || post.timestamp || null,
                        timestamp: post.timestamp || null,
                    };
                });

                setPosts(formattedData);
                setTotalCount(Number(lastRespData?.totalCount ?? attemptTotal));
            } catch (err) {
                setError(`${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [postPage]);

    const fetchPostsDetail = async (id) => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`${process.env.REACT_APP_API_BASE_URL}/posts/id/${id}`, { withCredentials: true });

            const respData = response.data?.data ?? response.data;
            const post = respData?.post ?? respData;

            if (!post) {
                setSelectedPost(null);
                return;
            }

            const isoDate = post.discoveredAt || post.createdAt || post.publishedAt || post.updatedAt || post.timestamp || null;

            const formattedPost = {
                id: post.id,
                title: post.title || "제목 없음",
                content: post.text ?? post.description ?? post.title ?? "",
                siteName: post.siteName ?? null,
                promoSiteLink: post.promoSiteLink ?? null,
                siteLink: post.link ?? post.siteLink ?? null,
                createdAt: isoDate,
                updatedAt: post.updatedAt || post.publishedAt || post.createdAt || post.timestamp || null,
                timestamp: post.timestamp || null,
            };

            setSelectedPost(formattedPost);
        } catch (err) {
            setError(`${err.message}`);
            setSelectedPost(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchDetailsByPostId = async (postId) => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`${process.env.REACT_APP_API_BASE_URL}/post-similarity/${postId}`, { withCredentials: true });
            const respData = response.data?.data ?? response.data;
            const similarPosts = respData?.similarPosts ?? respData?.similarPosts ?? [];

            const formattedDetails = (similarPosts || []).map((item) => ({
                similarPost: item.similarPost,
                similarity: item.similarity,
            }));

            setSelectedDetails(formattedDetails);
            setSelectedPost(posts.find((post) => post.id === postId) ?? null);
        } catch (err) {
            setError(`${err.message}`);
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