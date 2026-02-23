import axios from 'axios';

// Base URL - matches backend
const BASE_URL = 'http://localhost:8080/api';

// Create Axios Instance
const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Separate client to avoid interceptor loops while refreshing token
const refreshClient = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

const getStoredToken = () => localStorage.getItem('token') || localStorage.getItem('accessToken');

let isRefreshing = false;
let refreshPromise = null;

const startRefreshToken = async () => {
    if (isRefreshing && refreshPromise) {
        return refreshPromise;
    }

    isRefreshing = true;
    refreshPromise = refreshClient
        .post('/auth/refresh')
        .then((response) => {
            const newToken = response?.data?.accessToken || response?.data?.token;
            if (!newToken) {
                throw new Error('No access token returned from refresh endpoint');
            }
            localStorage.setItem('token', newToken);
            localStorage.setItem('accessToken', newToken);
            return newToken;
        })
        .finally(() => {
            isRefreshing = false;
            refreshPromise = null;
        });

    return refreshPromise;
};

const clearAuthAndRedirect = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
};

// REQUEST INTERCEPTOR - Attach JWT Token
api.interceptors.request.use(
    (config) => {
        const token = getStoredToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// RESPONSE INTERCEPTOR - Handle 401 Unauthorized
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;
        const requestUrl = originalRequest?.url || '';

        if (status === 401 && originalRequest && !originalRequest._retry) {
            const isAuthEndpoint = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/refresh');

            if (isAuthEndpoint) {
                clearAuthAndRedirect();
                return Promise.reject(error);
            }

            try {
                originalRequest._retry = true;
                const newToken = await startRefreshToken();
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                clearAuthAndRedirect();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
