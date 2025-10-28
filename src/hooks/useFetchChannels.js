import { useEffect, useState } from "react";
import axios from "axios";

const useFetchChannels = () => {
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                const channelsRes = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/channel/all`, { withCredentials: true });

                const rawList = (channelsRes && channelsRes.data && Array.isArray(channelsRes.data.data))
                    ? channelsRes.data.data
                    : Array.isArray(channelsRes.data)
                        ? channelsRes.data
                        : [];

                const formatted = rawList.map((channel) => {
                    const id = channel.id ?? channel._id ?? (channel.channelId ? String(channel.channelId) : undefined);
                    const channelId = channel.channelId ?? channel.channel_id ?? channel.telegram_id ?? channel.telegramId ?? undefined;

                    return {
                        id: id,
                        channelId: channelId,
                        title: channel.title || "제목 없음",
                        username: channel.username || "",
                        link: channel.link || "",
                        description: channel.about || channel.description || "",
                        status: (channel.status || "").toLowerCase() === "active" ? "active" : "inactive",
                        createdAt: channel.updatedAt || channel.checkedAt || channel.date || channel.createdAt || null,
                        hasChatBot: false,
                        raw: channel
                    };
                });

                setChannels(formatted);
            } catch (err) {
                setError(err.message || "채널 불러오기 실패");
            } finally {
                setLoading(false);
            }
        };

        fetch();
    }, []);

    return { channels, loading, error };
};

export default useFetchChannels;