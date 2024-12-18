import { useState, useEffect } from "react";
import axios from "axios";

const useFetchNewSlangData = (limit = 4) => {
    const [slangData, setSlangData] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNewSlang = async () => {
            try {
                const response = await axios.get("http://localhost:8080/slangs/all");
                const sortedData = response.data
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, limit);
                const formattedData = sortedData.map((slang) => ({
                    name: slang.slang,
                    detail: `${new Date(slang.updatedAt).toLocaleDateString()}`,
                    createdAt: slang.createdAt,
                }));
                setSlangData(formattedData);
            } catch (err) {
                console.error("Error fetching slang data:", err);
                setError(err);
            }
        };

        fetchNewSlang();
    }, [limit]);

    return { slangData, error };
};

export default useFetchNewSlangData;
