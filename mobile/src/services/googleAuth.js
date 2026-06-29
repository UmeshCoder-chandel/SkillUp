import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

WebBrowser.maybeCompleteAuthSession();

const getEnvVar = (name) => {
  return process.env[name] || Constants.expoConfig?.extra?.[name];
};

export const isGoogleAuthConfigured = () => {
  const webClientId = getEnvVar('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID');
  const androidClientId = getEnvVar('EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID');
  const iosClientId = getEnvVar('EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID');

  if (Platform.OS === 'android') {
    return !!(webClientId && androidClientId);
  } else if (Platform.OS === 'ios') {
    return !!(webClientId && iosClientId);
  }
  return !!webClientId;
};

export function useGoogleAuthRequest() {
  try {
    const webClientId = getEnvVar('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID');
    const androidClientId = getEnvVar('EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID');
    const iosClientId = getEnvVar('EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID');

    const config = {
      scopes: ['email', 'profile'],
    };

    if (webClientId) config.webClientId = webClientId;
    if (androidClientId) config.androidClientId = androidClientId;
    if (iosClientId) config.iosClientId = iosClientId;

    if (!webClientId) {
      console.warn('[GoogleAuth] webClientId is missing, Google auth will not be available');
      return [null, null, () => Promise.resolve()];
    }

    return Google.useIdTokenAuthRequest(config);
  } catch (error) {
    console.error('[GoogleAuth] Failed to initialize Google auth request:', error);
    return [null, null, () => Promise.resolve()];
  }
}

export async function getFirebaseIdTokenFromGoogleResponse(response) {
  try {
    // We don't use Firebase anymore - just return Google ID token directly!
    if (response?.type !== 'success') {
      if (response?.type === 'error') {
        console.error('[GoogleAuth] Error details:', response.error);
      }
      throw new Error('Google sign-in was cancelled or failed');
    }

    const idToken = response.authentication?.idToken;
    
    if (!idToken) {
      throw new Error('Google sign-in did not return an ID token');
    }

    return idToken;
  } catch (error) {
    console.error('[GoogleAuth] Error in getFirebaseIdTokenFromGoogleResponse:', error);
    throw error;
  }
}
