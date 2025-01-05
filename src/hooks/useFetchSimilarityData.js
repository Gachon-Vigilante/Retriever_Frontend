import { useState, useEffect } from "react";
import axios from "axios";

const useFetchData = (url, dependencies = []) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(url);
                setData(response.data);
            } catch (err) {
                setError(`Error fetching data: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        if (url) {
            fetchData();
        }
    }, dependencies); // Re-fetch data when dependencies change

    return { data, loading, error };
};

export default useFetchData;
