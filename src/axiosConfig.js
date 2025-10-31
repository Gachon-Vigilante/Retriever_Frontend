import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    withCredentials: true,
});

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (originalRequest?.skipAuthRefresh || originalRequest?.url?.includes('/auth/reissue')) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const response = await axios.post(
                    `${process.env.REACT_APP_API_BASE_URL}/auth/reissue`,
                    {},
                    { withCredentials: true }
                );

                const { accessToken, refreshToken } = response.data || {};

                if (accessToken) {
                    localStorage.setItem('accessToken', accessToken);
                    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

                    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

                    originalRequest.headers = originalRequest.headers || {};
                    originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
                }

                return axiosInstance(originalRequest);
            } catch (reissueError) {
                console.error("❌ Token reissue failed:", reissueError.response || reissueError);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('name');
                localStorage.removeItem('role');
                window.location.href = '/';
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;