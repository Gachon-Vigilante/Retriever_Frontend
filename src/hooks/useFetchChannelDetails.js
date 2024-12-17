import { useState, useEffect } from "react";
import axios from "axios";

// Utility function to safely parse date strings
const parseDateTime = (dateTime) => {
    if (!dateTime) return "N/A"; // Return N/A if null or undefined
    const dateString = dateTime.$date || dateTime; // Check for nested $date
    const parsedDate = new Date(dateString);
    return isNaN(parsedDate.getTime()) ? "N/A" : parsedDate.toLocaleString();
};

const useFetchChannelDetails = () => {
    const [channels, setChannels] = useState([]); // 채널 목록
    const [selectedDetails, setSelectedDetails] = useState([]); // 선택된 채널 상세 정보
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 1. 채널 목록 가져오기 (channel_info 테이블 사용)
    useEffect(() => {
        const fetchChannels = async () => {
            setLoading(true);
            try {
                const response = await axios.get("http://localhost:8080/channels/all");
                const formattedData = response.data.map((channel) => ({
                    id: channel.id, // Use `_id` from channel_info
                    name: channel.name,
                    link: channel.link,
                    updatedAt: parseDateTime(channel.updatedAt), // Parse date properly
                }));
                setChannels(formattedData);
            } catch (err) {
                setError(`Error fetching channels: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchChannels();
    }, []);

    // 2. 채널 상세 정보 가져오기 (channel_data 테이블 사용)
    const fetchDetailsByChannelId = async (channelId) => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8080/chat/channel/${channelId}`);
            const formattedDetails = response.data.map((item) => ({
                msgUrl: item.msgUrl || "N/A", // Safe fallback for msgUrl
                text: item.text || "No text available", // Safe fallback for text
                timestamp: parseDateTime(item.timestamp), // Parse date properly
            }));
            setSelectedDetails(formattedDetails);
        } catch (err) {
            setError(`Error fetching channel details: ${err.message}`);
            setSelectedDetails([]); // Reset details on error
        } finally {
            setLoading(false);
        }
    };

    return {
        channels,
        selectedDetails,
        fetchDetailsByChannelId,
        loading,
        error,
    };
};

export default useFetchChannelDetails;
