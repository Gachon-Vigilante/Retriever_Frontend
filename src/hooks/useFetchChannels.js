import { useEffect, useState } from "react";
import axios from "axios";

const useFetchChannels = () => {
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                const [channelsRes, botsRes] = await Promise.all([
                    axios.get(`${process.env.REACT_APP_API_BASE_URL}/channels/all`, { withCredentials: true }),         // channel_info
                    axios.get(`${process.env.REACT_APP_API_BASE_URL}/chatbots/all`, { withCredentials: true }),         // chat_bots
                ]);

                const chatBots = botsRes.data;

                const formatted = channelsRes.data.map((channel) => {
                    const matchingBot = chatBots.find((bot) =>
                        bot.chats && Object.keys(bot.chats).includes(String(channel._id))
                    );

                    return {
                        id: channel.id,
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