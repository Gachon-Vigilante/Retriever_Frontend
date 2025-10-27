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
            const raw = (response && response.data && Array.isArray(response.data.data)) ? response.data.data : Array.isArray(response.data) ? response.data : [];
            const formatted = raw.map((ch) => ({
                id: ch.id ?? ch._id ?? (ch.channelId ? String(ch.channelId) : undefined),
                title: ch.title || "제목 없음",
                username: ch.username || "",
                status: (ch.status || "unknown").toLowerCase(),
                link: ch.link || "",
                createdAt: parseDateTime(ch.updatedAt || ch.checkedAt || ch.date || ch.createdAt),
                description: ch.about || ch.description || ch.catalog?.description || "",
                raw: ch
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
            const raw = (response && response.data && Array.isArray(response.data.data)) ? response.data.data : Array.isArray(response.data) ? response.data : [];
            const formatted = raw.map((item) => ({
                msgUrl: item.url || item.msgUrl || "N/A",
                text: item.text || item.message || "내용 없음",
                image: item.media?.url || item.image || null,
                mediaType: item.media?.type || null,
                timestamp: parseDateTime(item.timestamp || item.date || item.createdAt),
                sender: item.sender || item.from || null,
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