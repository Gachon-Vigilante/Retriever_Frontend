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
    const [channelMeta, setChannelMeta] = useState(null);
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
        if (!channelId) return;
        setLoading(true);
        setChannelMeta(null);
        setSelectedDetails([]);
        try {
            const metaRes = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/channel/id/${channelId}`, { withCredentials: true });
            const metaObj = (metaRes && metaRes.data && (typeof metaRes.data.data === "object")) ? metaRes.data.data : metaRes.data;
            setChannelMeta(metaObj || null);

            let messagesRaw = [];
            if (metaObj) {
                if (Array.isArray(metaObj.messages)) messagesRaw = metaObj.messages;
                else if (Array.isArray(metaObj.chats)) messagesRaw = metaObj.chats;
                else if (Array.isArray(metaObj.catalog?.messages)) messagesRaw = metaObj.catalog.messages;
                else if (Array.isArray(metaObj.catalog?.messageIds)) {
                    messagesRaw = [];
                } else {
                    messagesRaw = [];
                }
            }

            const formatted = messagesRaw.map((item) => ({
                msgUrl: item.url || item.msgUrl || "N/A",
                text: item.text || item.message || item.body || "내용 없음",
                image: item.media?.url || item.image || item.img || null,
                mediaType: item.media?.type || item.type || null,
                timestamp: parseDateTime(item.timestamp || item.date || item.createdAt || item.time),
                sender: item.sender || item.from || item.author || null,
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
        channelMeta,
        loading,
        error,
        fetchDetailsByChannelId,
    };
};

export default useFetchChannelDetails;