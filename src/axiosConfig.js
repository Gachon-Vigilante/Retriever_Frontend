import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    withCredentials: true,
});

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                console.log("🔄 Attempting token reissue...");
                const response = await axiosInstance.post('/auth/reissue', {}, { withCredentials: true });
                console.log("✅ Token reissued successfully");

                return axiosInstance(originalRequest);
            } catch (reissueError) {
                console.error("❌ Token reissue failed:", reissueError.response || reissueError);
                window.location.href = '/';
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;