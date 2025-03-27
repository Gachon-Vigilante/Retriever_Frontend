import { useState, useEffect } from "react";
import axios from "axios";

const useFetchChannels = () => {
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchChannels = async () => {
            try {
                const response = await axios.get("http://localhost:8080/channels/all");
                const formattedData = response.data.map((channel) => ({
                    id: channel.id,
                    name: channel.title,
                    updatedAt: channel.updatedAt, // Time when chats were last updated
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

    return { channels, loading, error };
};

export default useFetchChannels;
