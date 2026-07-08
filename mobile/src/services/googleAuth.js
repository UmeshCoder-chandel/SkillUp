import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

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

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: Platform.select({
      ios: iosClientId,
      android: androidClientId,
      web: webClientId,
      default: webClientId,
    }),
    androidClientId,
    iosClientId,
    webClientId,
    scopes: ['profile', 'email'],
  });

  console.log('[GoogleAuth] Google auth request initialized:', { hasRequest: !!request });

  return [request, response, promptAsync];
};

export const getGoogleIdTokenFromResponse = async (response) => {
  console.log('[GoogleAuth] === Processing Google response ===');
  console.log('[GoogleAuth] Response type:', response?.type);
  
  if (response?.type === 'success') {
    const { id_token } = response.params;
    console.log('[GoogleAuth] ID token received successfully');
    return id_token;
  }

  if (response?.type === 'cancel') {
    console.log('[GoogleAuth] User cancelled Google sign-in');
    return null;
  }

  console.error('[GoogleAuth] Google sign-in failed:', response);
  throw new Error('Google sign-in failed');
};

export const isGoogleAuthConfigured = () => {
  const webClientId = getEnvVar('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID');
  return !!webClientId;
};
