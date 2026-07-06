import axios from 'axios';
import Constants from 'expo-constants';
import { storage } from '../utils/storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || Constants.expoConfig?.extra?.apiUrl || 'https://skillup-dwny.onrender.com/api';
const HEALTH_CHECK_URL = API_URL.replace('/api', '/health');

console.log('[API] API URL:', API_URL);
console.log('[API] Health check URL:', HEALTH_CHECK_URL);

// Health check function with retry
export const checkServerHealth = async (maxRetries = 5, delay = 2000) => {
  console.log('[API] Checking server health...');
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axios.get(HEALTH_CHECK_URL, { timeout: 10000 });
      console.log('[API] Server health check passed:', response.data);
      return true;
    } catch (error) {
      console.warn(`[API] Health check attempt ${i + 1} failed:`, error.message);
      if (i < maxRetries - 1) {
        console.log(`[API] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error('[API] All health check attempts failed');
  return false;
};

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds timeout to handle Render cold starts
});

// Request interceptor with logging
api.interceptors.request.use(async (config) => {
  console.log('[API] === API REQUEST ===');
  console.log('[API] Method:', config.method?.toUpperCase());
  console.log('[API] URL:', config.baseURL + config.url);
  console.log('[API] Data:', config.data);

  const token = await storage.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  
  // Let axios set Content-Type automatically for FormData
  if (config.data && !(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }
  
  return config;
}, (error) => {
  console.error('[API] === REQUEST ERROR ===');
  console.error('[API] Error:', error);
  return Promise.reject(error);
});

// Response interceptor with logging
api.interceptors.response.use(
  (response) => {
    console.log('[API] === API RESPONSE ===');
    console.log('[API] Status:', response.status);
    console.log('[API] Data:', response.data);
    return response;
  },
  async (error) => {
    console.error('[API] === API RESPONSE ERROR ===');
    console.error('[API] Message:', error.message);
    console.error('[API] Response:', error.response?.data);
    console.error('[API] Status:', error.response?.status);

    const original = error.config;
    
    // Handle 401 - refresh token
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = await storage.getRefreshToken();
      if (refreshToken) {
        try {
          console.log('[API] Attempting to refresh token');
          const { data } = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
          await storage.setAccessToken(data.data.accessToken);
          await storage.setRefreshToken(data.data.refreshToken);
          original.headers.Authorization = `Bearer ${data.data.accessToken}`;
          console.log('[API] Token refreshed successfully');
          return api(original);
        } catch (refreshError) {
          console.error('[API] Token refresh failed:', refreshError);
          await storage.clearTokens();
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
