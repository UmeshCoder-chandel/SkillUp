let SecureStore;
try {
  SecureStore = require('expo-secure-store');
  console.log('[Storage] expo-secure-store loaded successfully');
} catch (e) {
  console.warn('[Storage] expo-secure-store not available, using fallback storage');
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
      console.log('[Storage] Getting access token...');
      if (SecureStore) {
        const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
        console.log('[Storage] Access token found:', !!token);
        return token;
      }
      console.log('[Storage] Using fallback storage for access token');
      return fallbackStorage[ACCESS_TOKEN_KEY];
    } catch (e) {
      console.error('[Storage] Failed to get access token', e);
      return null;
    }
  },
  setAccessToken: async (token) => {
    try {
      console.log('[Storage] Setting access token...');
      if (SecureStore) {
        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
        console.log('[Storage] Access token set in SecureStore');
      } else {
        fallbackStorage[ACCESS_TOKEN_KEY] = token;
        console.log('[Storage] Access token set in fallback storage');
      }
    } catch (e) {
      console.error('[Storage] Failed to set access token', e);
    }
  },
  getRefreshToken: async () => {
    try {
      console.log('[Storage] Getting refresh token...');
      if (SecureStore) {
        const token = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
        console.log('[Storage] Refresh token found:', !!token);
        return token;
      }
      console.log('[Storage] Using fallback storage for refresh token');
      return fallbackStorage[REFRESH_TOKEN_KEY];
    } catch (e) {
      console.error('[Storage] Failed to get refresh token', e);
      return null;
    }
  },
  setRefreshToken: async (token) => {
    try {
      console.log('[Storage] Setting refresh token...');
      if (SecureStore) {
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
        console.log('[Storage] Refresh token set in SecureStore');
      } else {
        fallbackStorage[REFRESH_TOKEN_KEY] = token;
        console.log('[Storage] Refresh token set in fallback storage');
      }
    } catch (e) {
      console.error('[Storage] Failed to set refresh token', e);
    }
  },
  clearTokens: async () => {
    try {
      console.log('[Storage] Clearing tokens...');
      if (SecureStore) {
        await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        console.log('[Storage] Tokens cleared from SecureStore');
      } else {
        fallbackStorage[ACCESS_TOKEN_KEY] = null;
        fallbackStorage[REFRESH_TOKEN_KEY] = null;
        console.log('[Storage] Tokens cleared from fallback storage');
      }
    } catch (e) {
      console.error('[Storage] Failed to clear tokens', e);
    }
  },
};
