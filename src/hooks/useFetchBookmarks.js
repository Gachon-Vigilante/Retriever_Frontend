import { useState, useEffect } from "react";
import axios from "axios";

const useFetchBookmarks = (userId) => {
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBookmarks = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_BASE_URL}/bookmarks/user/${userId}`,
                    { withCredentials: true }
                );
                setBookmarks(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching bookmarks:", error);
                setError(error);
                setLoading(false);
            }
        };

        fetchBookmarks();
    }, [userId]);

    return { bookmarks, setBookmarks, loading, error };
};

export default useFetchBookmarks;