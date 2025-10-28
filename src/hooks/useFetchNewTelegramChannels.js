import { useState, useEffect } from "react";
import axios from "axios";

const useFetchNewTelegramChannels = (limit = 5) => {
    const [channels, setChannels] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNewChannels = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/channel/all`, { withCredentials: true });
                const raw = (response && response.data && Array.isArray(response.data.data))
                    ? response.data.data
                    : Array.isArray(response.data)
                        ? response.data
                        : [];

                const withDates = raw.map((ch) => {
                    const createdAt = ch.updatedAt || ch.checkedAt || ch.date || ch.createdAt || null;
                    return { raw: ch, createdAt };
                });

                const sortedData = withDates
                    .sort((a, b) => {
                        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                        return db - da;
                    })
                    .slice(0, limit)
                    .map(({ raw, createdAt }) => {
                        const channelId = raw.channelId ?? raw.channel_id ?? raw.telegram_id ?? raw.telegramId ?? null;
                        const title = raw.title || raw.name || "제목 없음";
                        const status = (raw.status || "").toLowerCase() === "active" ? "active" : "inactive";
                        const detail = createdAt && !isNaN(Date.parse(createdAt))
                            ? new Date(createdAt).toLocaleDateString("ko-KR")
                            : (raw.about || raw.description || raw.catalog?.summary || "날짜 없음");

                        return {
                            title,
                            channelId,
                            createdAt,
                            status,
                            detail,
                            raw,
                        };
                    });

                setChannels(sortedData);
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
