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
        setError(null);

        try {
            // 1) 메시지 엔드포인트에서 메시지 목록 조회 (/message/channel/{channelId})
            const msgRes = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/message/channel/${encodeURIComponent(channelId)}`, { withCredentials: true });
            const rawList = (msgRes && msgRes.data && Array.isArray(msgRes.data.data)) ? msgRes.data.data : Array.isArray(msgRes.data) ? msgRes.data : [];
            const formattedMessages = rawList.map((m) => ({
                id: m.id ?? m._id ?? m.messageId ?? null,
                channelId: m.channelId ?? channelId,
                messageId: m.messageId ?? null,
                text: m.message ?? m.text ?? m.body ?? "",
                timestamp: parseDateTime(m.date ?? m.timestamp ?? m.createdAt ?? m.time),
                fromId: m.fromId ?? m.from ?? m.sender ?? null,
                views: m.views ?? null,
                argots: Array.isArray(m.argots) ? m.argots : (Array.isArray(m.argot) ? m.argot : []),
                image: m.image ?? m.media?.url ?? null,
                mediaType: m.media?.type ?? m.mediaType ?? null,
                msgUrl: m.msgUrl ?? m.url ?? null,
                raw: m
            }));
            setSelectedDetails(formattedMessages);

            // 2) 채널 메타도 병행 조회 (있으면 채널 설명 등 보정)
            try {
                const metaRes = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/channel/id/${encodeURIComponent(channelId)}`, { withCredentials: true });
                const metaObj = (metaRes && metaRes.data && (typeof metaRes.data.data === "object")) ? metaRes.data.data : metaRes.data;
                setChannelMeta(metaObj || null);
            } catch (metaErr) {
                // 메타 조회 실패 시 무시(선택 상세는 이미 설정됨)
                console.debug("channel meta fetch failed", metaErr);
            }

        } catch (err) {
            console.error("Error fetching channel details:", err);
            setError(err.message || "채널 상세 불러오기 실패");
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