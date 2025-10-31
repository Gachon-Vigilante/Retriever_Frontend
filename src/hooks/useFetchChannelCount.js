import { useState, useEffect } from "react";
import axiosInstance from "../axiosConfig";

const useFetchChannelCount = () => {
    const [channelCount, setChannelCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchChannelCount = async () => {
            try {
                const response = await axiosInstance.get(`${process.env.REACT_APP_API_BASE_URL}/channel/all`, { withCredentials: true });
                const resp = response?.data ?? [];
                let count = 0;
                if (Array.isArray(resp)) {
                    count = resp.length;
                } else if (Array.isArray(resp?.data)) {
                    count = resp.data.length;
                } else if (typeof resp === "object" && resp !== null) {
                    if (typeof resp.totalCount === "number") count = resp.totalCount;
                    else if (typeof resp.count === "number") count = resp.count;
                    else if (Array.isArray(resp.channels)) count = resp.channels.length;
                }
                setChannelCount(Number.isFinite(count) ? count : 0);
            } catch (err) {
                setError(err.message);
                setChannelCount(0);
            } finally {
                setLoading(false);
            }
        };

        fetchChannelCount();
    }, []);

    return { channelCount, loading, error };
};

export default useFetchChannelCount;
