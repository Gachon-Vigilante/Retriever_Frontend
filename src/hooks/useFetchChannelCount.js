import { useState, useEffect } from "react";
import axios from "axios";

const useFetchChannelCount = () => {
    const [channelCount, setChannelCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchChannelCount = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/channels/all`);
                setChannelCount(response.data.length); // Set the total count of channels
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchChannelCount();
    }, []);

    return { channelCount, loading, error };
};

export default useFetchChannelCount;
