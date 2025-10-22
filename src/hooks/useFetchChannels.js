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
                    const botsRes = await axios.get(`${process.env.REACT_APP_AI_BASE_URL}/chatbots/all`, { withCredentials: true });
                    chatBots = (botsRes.data && botsRes.data.data) ? botsRes.data.data : Array.isArray(botsRes.data) ? botsRes.data : [];
                } catch (e) {
                    chatBots = [];
                }

                const formatted = (channelsRes.data && channelsRes.data.data ? channelsRes.data.data : channelsRes.data || []).map((channel) => {
                    const channelIdCandidates = [channel.id, channel._id].filter(Boolean).map(String);
                    const matchingBot = chatBots.find((bot) => {
                        if (!bot || !bot.chats) return false;
                        const keys = Object.keys(bot.chats);
                        return channelIdCandidates.some((cid) => keys.includes(cid));
                    });

                    return {
                        id: channel.id ?? channel._id,
                        name: channel.title || "제목 없음",
                        status: channel.status,
                        createdAt: channel.createdAt,
                        hasChatBot: Boolean(matchingBot),
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