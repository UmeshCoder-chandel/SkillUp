import axios from 'axios';
import { API_URL } from '../utils/constants';
import { storage } from '../utils/storage';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds - longer timeout for Render cold starts
});

// Request interceptor with logging
api.interceptors.request.use(async (config) => {
  console.log("=== API REQUEST ===");
  console.log("API URL:", API_URL);
  console.log("Request Method:", config.method?.toUpperCase());
  console.log("Request URL:", config.baseURL + config.url);
  console.log("Request Data:", config.data);

  const token = await storage.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  
  // Let axios set Content-Type automatically for FormData
  if (config.data && !(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }
  
  return config;
}, (error) => {
  console.log("=== REQUEST ERROR ===");
  console.log("Error:", error);
  return Promise.reject(error);
});

// Response interceptor with logging
api.interceptors.response.use(
  (response) => {
    console.log("=== API RESPONSE ===");
    console.log("Status:", response.status);
    console.log("Response Data:", response.data);
    return response;
  },
  async (error) => {
    console.log("=== API RESPONSE ERROR ===");
    console.log("Error:", error);
    console.log("Error Message:", error.message);
    console.log("Error Response:", error.response?.data);
    console.log("Error Status:", error.response?.status);
    console.log("Error Request:", error.request);

    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = await storage.getRefreshToken();
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
          await storage.setAccessToken(data.data.accessToken);
          await storage.setRefreshToken(data.data.refreshToken);
          original.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return api(original);
        } catch {
          await storage.clearTokens();
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
