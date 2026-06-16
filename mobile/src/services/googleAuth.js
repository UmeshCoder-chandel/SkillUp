import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { signInWithCredential } from 'firebase/auth';
import { auth, GoogleAuthProvider, isFirebaseConfigured } from './firebase';

WebBrowser.maybeCompleteAuthSession();

export const isGoogleAuthConfigured = () =>
  isFirebaseConfigured() && !!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

export function useGoogleAuthRequest() {
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  return Google.useIdTokenAuthRequest({
    webClientId,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || webClientId,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || webClientId,
  });
}

export async function getFirebaseIdTokenFromGoogleResponse(response) {
  if (!auth) {
    throw new Error('Firebase is not configured');
  }

  if (response?.type !== 'success') {
    throw new Error('Google sign-in was cancelled');
  }

  const idToken = response.authentication?.idToken || response.params?.id_token;
  const accessToken = response.authentication?.accessToken || response.params?.access_token;

  if (!idToken) {
    throw new Error('Google sign-in did not return an ID token');
  }

  const credential = GoogleAuthProvider.credential(idToken, accessToken);
  const result = await signInWithCredential(auth, credential);
  return result.user.getIdToken();
}
