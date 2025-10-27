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

                let chatBots = [];
                try {
                    const botsRes = await axios.get(`${process.env.REACT_APP_AI_BASE_URL}/api/v1/watson/c`, { withCredentials: true });
                    chatBots = (botsRes.data && botsRes.data.data) ? botsRes.data.data : Array.isArray(botsRes.data) ? botsRes.data : [];
                } catch (e) {
                    chatBots = [];
                }

                const rawList = (channelsRes && channelsRes.data && Array.isArray(channelsRes.data.data))
                    ? channelsRes.data.data
                    : Array.isArray(channelsRes.data)
                        ? channelsRes.data
                        : [];

                const formatted = rawList.map((channel) => {
                    const id = channel.id ?? channel._id ?? (channel.channelId ? String(channel.channelId) : undefined);
                    const channelId = channel.channelId ?? channel.channel_id ?? channel.telegram_id ?? channel.telegramId ?? undefined;
                    const channelIdCandidates = [id, channelId].filter(Boolean).map(String);

                     const matchingBot = chatBots.find((bot) => {
                         if (!bot || !bot.chats) return false;
                         const keys = Object.keys(bot.chats || {});
                         return channelIdCandidates.some((cid) => keys.includes(cid));
                     });

                     return {
                         id: id,
                         channelId: channelId,
                         title: channel.title || "제목 없음",
                         username: channel.username || "",
                         link: channel.link || "",
                         description: channel.about || channel.description || "",
                         status: (channel.status || "").toLowerCase() === "active" ? "active" : "inactive",
                         createdAt: channel.updatedAt || channel.checkedAt || channel.date || channel.createdAt || null,
                         hasChatBot: Boolean(matchingBot),
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