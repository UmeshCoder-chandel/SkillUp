import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

export const isGoogleAuthConfigured = () => {
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  return !!webClientId;
};

export function useGoogleAuthRequest() {
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

  return Google.useIdTokenAuthRequest({
    webClientId,
    androidClientId,
    iosClientId,
    scopes: ['email', 'profile'],
  });
}

export async function getFirebaseIdTokenFromGoogleResponse(response) {
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
}
