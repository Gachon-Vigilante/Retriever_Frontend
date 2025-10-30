import { useState, useEffect } from "react";
import axiosInstance from "../axiosConfig";

const normalizeToArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.bookmarks)) return data.bookmarks;
    return [];
};

const useFetchBookmarks = (userId) => {
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchBookmarks = async () => {
        try {
            const response = await axiosInstance.get(
                `${process.env.REACT_APP_API_BASE_URL}/bookmarks/me`,
                { withCredentials: true }
            );
            setBookmarks(normalizeToArray(response.data));
            setLoading(false);
        } catch (err) {
            console.error("Error fetching bookmarks:", err);
            setError(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookmarks();
    }, [userId]);

    return { bookmarks, setBookmarks, loading, error, refreshBookmarks: fetchBookmarks };
};

export default useFetchBookmarks;