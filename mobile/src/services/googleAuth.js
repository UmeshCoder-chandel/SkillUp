import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as AuthSession from 'expo-auth-session';

console.log('[GoogleAuth] Redirect URI (default):', AuthSession.makeRedirectUri({ useProxy: __DEV__ }));
console.log('[GoogleAuth] Redirect URI (no proxy):', AuthSession.makeRedirectUri({ useProxy: false }));

// This is required to handle the redirect back to the app
WebBrowser.maybeCompleteAuthSession();

const getEnvVar = (name) => {
  const value =
    process.env[name] ||
    Constants.expoConfig?.extra?.[name];

  console.log(
    `[GoogleAuth] ${name}:`,
    value ? `SET (${value.length} chars)` : 'NOT SET'
  );

  return value;
};

// Custom hook that returns the auth request, response, and prompt function
export const useGoogleAuthRequest = () => {
  const webClientId = getEnvVar('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID');
  const androidClientId = getEnvVar('EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID');
  const iosClientId = getEnvVar('EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID');
  
  console.log('[GoogleAuth] Platform:', Platform.OS);
  console.log('[GoogleAuth] Web Client ID:', webClientId ? 'SET' : 'NOT SET');
  console.log('[GoogleAuth] Android Client ID:', androidClientId ? 'SET' : 'NOT SET');
  console.log('[GoogleAuth] iOS Client ID:', iosClientId ? 'SET' : 'NOT SET');
  console.log('[GoogleAuth] __DEV__:', __DEV__);

  // For Expo Go development, use webClientId as per Expo docs
  const config = {
    webClientId,
    androidClientId,
    iosClientId,
    scopes: ['profile', 'email'],
    useProxy: __DEV__, // Explicitly enable proxy for Expo Go!
  };

  console.log('[GoogleAuth] Config:', config);

  const [request, response, promptAsync] = Google.useAuthRequest(config);

  console.log('[GoogleAuth] Google auth request initialized:', {
    hasRequest: !!request,
    requestUrl: request?.url,
  });

  return [request, response, promptAsync];
};

export const getGoogleIdTokenFromResponse = async (response) => {
  console.log('[GoogleAuth] === Processing Google response ===');
  console.log('[GoogleAuth] Response type:', response?.type);
  console.log('[GoogleAuth] Full response:', response);
  
  if (response?.type === 'success') {
    const { id_token } = response.params;
    console.log('[GoogleAuth] ID token received successfully');
    return id_token;
  }

  if (response?.type === 'cancel' || response?.type === 'dismiss') {
    console.log('[GoogleAuth] User cancelled/dismissed Google sign-in');
    return null;
  }

  console.error('[GoogleAuth] Google sign-in failed:', response);
  return null; // Don't throw an error, just return null
};

export const isGoogleAuthConfigured = () => {
  const webClientId = getEnvVar('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID');
  return !!webClientId;
};
