// import { useState, useEffect } from "react";
// import axios from "axios";
//
// const useFetchBookmarks = (userId) => {
//     const [bookmarks, setBookmarks] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//
//     useEffect(() => {
//         const fetchBookmarks = async () => {
//             try {
//                 const response = await axios.get(
//                     `${process.env.REACT_APP_API_BASE_URL}/bookmarks/me`,
//                     { withCredentials: true }
//                 );
//                 setBookmarks(response.data);
//                 setLoading(false);
//             } catch (error) {
//                 console.error("Error fetching bookmarks:", error);
//                 setError(error);
//                 setLoading(false);
//             }
//         };
//
//         fetchBookmarks();
//     }, [userId]);
//
//     return { bookmarks, setBookmarks, loading, error };
// };
//
// export default useFetchBookmarks;


// src/hooks/useFetchBookmarks.js
// 응답을 안전하게 배열로 정규화하여 setBookmarks에 항상 배열이 들어가도록 함
import { useState, useEffect } from "react";
import axios from "axios";

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

    useEffect(() => {
        const fetchBookmarks = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_BASE_URL}/bookmarks/me`,
                    { withCredentials: true }
                );
                setBookmarks(normalizeToArray(response.data));
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