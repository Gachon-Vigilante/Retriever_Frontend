import { useState, useEffect } from "react";
import axios from "axios";

const useFetchNewArgotData = (limit = 5) => {
    const [argotData, setArgotData] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchArgots = async () => {
            try {
                const response = await axios.get("http://localhost:8080/argots/all");
                const sortedData = response.data
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, limit);

                const formatted = sortedData.map((item) => ({
                    name: item.argot,
                    detail: new Date(item.updatedAt).toLocaleDateString(),
                    createdAt: item.createdAt
                }));

                setArgotData(formatted);
            } catch (err) {
                console.error("Error fetching argot data:", err);
                setError(err);
            }
        };

        fetchArgots();
    }, [limit]);

    return { argotData, error };
};

export default useFetchNewArgotData;
