import { useState, useEffect } from "react";
import axios from "axios";

const useFetchNewTelegramChannels = (limit = 4) => {
    const [channels, setChannels] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNewChannels = async () => {
            try {
                const response = await axios.get("http://localhost:8080/channels/all");
                const sortedData = response.data
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, limit);
                const formattedData = response.data.map(channel => ({
                    name: channel.title,
                    detail: channel.createdAt && !isNaN(Date.parse(channel.createdAt))
                        ? new Date(channel.createdAt).toLocaleDateString("ko-KR")
                        : "날짜 없음",
                    createdAt: channel.createdAt,
                }));
                setChannels(formattedData);
            } catch (err) {
                console.error("Error fetching telegram channels:", err);
                setError(err);
            }
        };

        fetchNewChannels();
    }, [limit]);

    return { channels, error };
};

export default useFetchNewTelegramChannels;
