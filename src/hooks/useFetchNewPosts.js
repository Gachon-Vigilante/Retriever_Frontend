import { useState, useEffect } from "react";
import axios from "axios";

const useFetchNewPosts = (limit = 4) => {
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNewPosts = async () => {
            try {
                const response = await axios.get("http://localhost:8080/posts/all");
                const sortedData = response.data
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, limit);
                const formattedData = sortedData.map(post => ({
                    name: post.content?.length > 30 ? post.content.slice(0, 30) + "..." : post.content || "제목 없음",
                    detail: post.createdAt && !isNaN(Date.parse(post.createdAt))
                        ? new Date(post.createdAt).toLocaleDateString("ko-KR")
                        : "날짜 없음",
                    createdAt: post.createdAt,
                }));
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
