let SecureStore;
try {
  SecureStore = require('expo-secure-store');
} catch (e) {
  console.warn('expo-secure-store not available, using fallback storage');
}

const ACCESS_TOKEN_KEY = 'skilllearn_access_token';
const REFRESH_TOKEN_KEY = 'skilllearn_refresh_token';

// Fallback in-memory storage if SecureStore fails
let fallbackStorage = {
  [ACCESS_TOKEN_KEY]: null,
  [REFRESH_TOKEN_KEY]: null,
};

export const storage = {
  getAccessToken: async () => {
    try {
      if (SecureStore) {
        return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      }
      return fallbackStorage[ACCESS_TOKEN_KEY];
    } catch (e) {
      console.error('Failed to get access token', e);
      return null;
    }
  },
  setAccessToken: async (token) => {
    try {
      if (SecureStore) {
        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
      } else {
        fallbackStorage[ACCESS_TOKEN_KEY] = token;
      }
    } catch (e) {
      console.error('Failed to set access token', e);
    }
  },
  getRefreshToken: async () => {
    try {
      if (SecureStore) {
        return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      }
      return fallbackStorage[REFRESH_TOKEN_KEY];
    } catch (e) {
      console.error('Failed to get refresh token', e);
      return null;
    }
  },
  setRefreshToken: async (token) => {
    try {
      if (SecureStore) {
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
      } else {
        fallbackStorage[REFRESH_TOKEN_KEY] = token;
      }
    } catch (e) {
      console.error('Failed to set refresh token', e);
    }
  },
  clearTokens: async () => {
    try {
      if (SecureStore) {
        await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      } else {
        fallbackStorage[ACCESS_TOKEN_KEY] = null;
        fallbackStorage[REFRESH_TOKEN_KEY] = null;
      }
    } catch (e) {
      console.error('Failed to clear tokens', e);
    }
  },
};
