import { useEffect, useState } from "react";
import axios from "axios";

const useFetchChannelsWithBookmarks = (userId) => {
    const [channels, setChannels] = useState([]);
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch all channels
                const channelResponse = await axios.get("http://localhost:8080/channels/all");
                const channels = channelResponse.data;

                // Fetch bookmarks for the user
                const bookmarkResponse = await axios.get(`http://localhost:8080/bookmarks/user/${userId}`);
                const bookmarks = bookmarkResponse.data;

                setChannels(channels);
                setBookmarks(bookmarks);
            } catch (err) {
                console.error("Error fetching channels/bookmarks:", err);
                setError("Failed to fetch data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    const isBookmarked = (channelId) =>
        bookmarks.some((bookmark) => bookmark.channelId === channelId);

    return { channels, bookmarks, isBookmarked, loading, error, setBookmarks };
};

export default useFetchChannelsWithBookmarks;