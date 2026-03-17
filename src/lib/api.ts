import axios, { type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/auth";

const BASE_URL = "https://iefa-project-api.onrender.com/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// --- Token refresh queue ---
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableConfig;
    const isUnauthorized = error.response?.status === 401;
    const requestUrl: string = originalRequest?.url ?? "";
    const isAuthEndpoint = /\/auth\/(login|register|refresh|logout)/.test(
      requestUrl,
    );

    if (isUnauthorized && !isAuthEndpoint && !originalRequest._retry) {
      // Queue additional requests while a refresh is in-flight
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            throw err;
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = sessionStorage.getItem("refreshToken");

      if (!refreshToken) {
        useAuthStore.getState().logout();
        isRefreshing = false;
        processQueue(error, null);
        throw error;
      }

      try {
        const { data } = await axios.post(
          `${BASE_URL}/auth/refresh`,
          { refreshToken },
          { headers: { "Content-Type": "application/json" } },
        );

        const accessToken: string = data.accessToken ?? data.token;
        const newRefreshToken: string | undefined = data.refreshToken;

        sessionStorage.setItem("authToken", accessToken);
        if (newRefreshToken)
          sessionStorage.setItem("refreshToken", newRefreshToken);

        useAuthStore.getState().setToken(accessToken);
        if (newRefreshToken)
          useAuthStore.getState().setRefreshToken(newRefreshToken);

        processQueue(null, accessToken);

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        throw refreshError;
      } finally {
        isRefreshing = false;
      }
    }

    throw error;
  },
);

export default api;
