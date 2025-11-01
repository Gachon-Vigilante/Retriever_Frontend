import { useState, useEffect } from "react";
import axiosInstance from "../axiosConfig";

const useFetchNewPosts = (limit = 4) => {
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNewPosts = async () => {
            try {
                const response = await axiosInstance.get(
                    `${process.env.REACT_APP_API_BASE_URL}/posts/all?page=0&size=${limit}`,
                    { withCredentials: true }
                );

                const respData = response.data?.data ?? response.data;
                const postsArray = respData?.posts ?? [];

                const sortedData = (postsArray || [])
                    .sort((a, b) => new Date(b.createdAt || b.updatedAt || b.publishedAt || b.timestamp) - new Date(a.createdAt || a.updatedAt || a.publishedAt || a.timestamp))
                    .slice(0, limit);

                const formattedData = sortedData.map(post => {
                    const isoDate = post.createdAt || post.publishedAt || post.discoveredAt || post.timestamp || null;
                    return {
                        name: post.text?.length > 30 ? post.text.slice(0, 30) + "..." : (post.title ?? post.text ?? "제목 없음"),
                        detail: isoDate && !isNaN(Date.parse(isoDate))
                            ? new Date(isoDate).toLocaleDateString("ko-KR")
                            : "날짜 없음",
                        createdAt: isoDate,
                    };
                });
                setPosts(formattedData);
            } catch (err) {
                console.error("Error fetching posts data:", err);
                setError(err);
            }
        };

        fetchNewPosts();
    }, [limit]);

    return { posts, error };
};

export default useFetchNewPosts;
