import {useEffect, useState} from "react";
import axios from "axios";

const useFetchPosts = () => {
    const [channels, setChannels] = useState([]);
    const [selectedDetails, setSelectedDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. 채널 목록 가져오기 (channel_info 테이블 사용)
    useEffect(() => {
        const fetchChannels = async () => {
            try {
                const response = await axios.get("http://localhost:8080/channels/all");
                const formattedData = response.data.map((channel) => ({
                    id: channel.id,
                    name: channel.name,
                    updatedAt: channel.updatedAt,
                }));
                setChannels(formattedData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchChannels();
    }, []);

    // 2. 채널 상세 정보 가져오기 (channel_data 테이블 사용)
    const fetchDetailsById = async (channelId) => {
        setLoading(true);
        try {
            // 채널 데이터를 가져오는 API
            const response = await axios.get(`http://localhost:8080/chat/channel/${channelId}`);
            const formattedDetails = response.data.map((item) => ({
                channelId: item.channelId,
                msgUrl: item.msgUrl,
                text: item.text,
            }));
            setSelectedDetails(formattedDetails);
        } catch (err) {
            setError(err.message);
            setSelectedDetails(null);
        } finally {
            setLoading(false);
        }
    };

    return {
        channels,
        selectedDetails,
        fetchDetailsById,
        loading,
        error,
    };
};

export default useFetchPosts;
