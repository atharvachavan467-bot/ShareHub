import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";
import { ApiErrorResponse } from "@/types";

// In dev with Vite proxy, '/api/v1' ensures same-origin cookie transmission without port blocking
const BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Crucial for HttpOnly cookies
});

// Request Interceptor: Attach Bearer token from localStorage if present
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Standardize data and handle errors globally
api.interceptors.response.use(
  (response) => {
    // Normalization for variations where backend inverted (statusCode, data, message)
    if (response.data && typeof response.data === "object") {
      const raw = response.data;
      if (typeof raw.data === "string" && typeof raw.message === "object" && raw.message !== null) {
        response.data = {
          ...raw,
          normalizedData: raw.message,
          normalizedMessage: raw.data,
        };
      }
    }
    return response;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    const status = error.response?.status;
    const errorData = error.response?.data;
    const message = errorData?.message || error.message || "An unexpected error occurred";

    const requestUrl = error.config?.url || "";
    const isAuthHydration = requestUrl.includes("/get_user");
    const isLoginOrRegister = requestUrl.includes("/login") || requestUrl.includes("/register");

    if (status === 401) {
      // Don't redirect or show error toasts for initial unauthenticated session check
      if (!isAuthHydration && !isLoginOrRegister) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        toast.error("Session expired. Please sign in again.");
        window.location.href = "/login";
      }
    } else if (status === 409) {
      toast.error(`Conflict: ${message || "Resource is already reserved or username/email already exists."}`);
    } else if (status && status >= 400 && !isAuthHydration) {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

/**
 * Universal extractor to reliably extract the data payload from backend responses
 */
export function extractData<T>(response: any): T {
  if (!response) return null as unknown as T;
  const res = response.data !== undefined ? response.data : response;
  
  if (res.normalizedData !== undefined) {
    return res.normalizedData as T;
  }
  
  // If data exists and is an object or array
  if (res.data !== undefined && typeof res.data !== "string") {
    return res.data as T;
  }
  
  // If message has the actual object or array
  if (res.message && typeof res.message === "object") {
    return res.message as T;
  }

  return (res.data !== undefined ? res.data : res) as T;
}

export default api;
