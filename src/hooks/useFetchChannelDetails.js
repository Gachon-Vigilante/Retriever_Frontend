"use client";

import { useState, useEffect } from "react";
import axios from "axios";

const parseDateTime = (dateTime) => {
    if (!dateTime) return "N/A";
    const dateString = dateTime.$date || dateTime;
    const parsedDate = new Date(dateString);
    return isNaN(parsedDate.getTime()) ? "N/A" : parsedDate.toLocaleString();
};

const useFetchChannelDetails = () => {
    const [channels, setChannels] = useState([]);
    const [selectedDetails, setSelectedDetails] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchChannels();
    }, []);

    const fetchChannels = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/channel/all`, { withCredentials: true });
            const formatted = response.data.data.map((ch) => ({
                id: ch.id,
                title: ch.title || "제목 없음",
                username: ch.username || "",
                status: ch.status || "unknown",
                link: ch.link || "",
                createdAt: parseDateTime(ch.createdAt),
                description: ch.catalog?.description || "",
            }));
            setChannels(formatted);
        } catch (err) {
            setError(`${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const fetchDetailsByChannelId = async (channelId) => {
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/chat/channel/${channelId}`, { withCredentials: true });
            const formatted = response.data.data.map((item) => ({
                msgUrl: item.url || item.msgUrl || "N/A",
                text: item.text || "내용 없음",
                image: item.media?.url || item.image,
                mediaType: item.media?.type || null,
                timestamp: parseDateTime(item.timestamp),
                sender: item.sender || null,
            }));
            setSelectedDetails(formatted);
        } catch (err) {
            console.error("Error fetching channel details:", err);
            setError(`${err.message}`);
            setSelectedDetails([]);
        } finally {
            setLoading(false);
        }
    };

    return {
        channels,
        selectedDetails,
        loading,
        error,
        fetchDetailsByChannelId,
    };
};

export default useFetchChannelDetails;