import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

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

let isConfigured = false;

export const configureGoogleSignIn = () => {
  if (isConfigured) {
    console.log('[GoogleAuth] Already configured');
    return;
  }

  try {
    console.log('[GoogleAuth] Configuring Google Sign In...');
    
    const webClientId = getEnvVar('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID');
    const androidClientId = getEnvVar('EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID');
    const iosClientId = getEnvVar('EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID');

    const config = {
      webClientId: webClientId,
      iosClientId: Platform.OS === 'ios' ? iosClientId : undefined,
      androidClientId: Platform.OS === 'android' ? androidClientId : undefined,
      offlineAccess: false,
      scopes: ['profile', 'email'],
    };

    console.log('[GoogleAuth] Config:', JSON.stringify({ ...config, webClientId: '***' }, null, 2));
    GoogleSignin.configure(config);
    isConfigured = true;
    console.log('[GoogleAuth] Google Sign In configured successfully');
  } catch (error) {
    console.error('[GoogleAuth] Error configuring Google Sign In:', error);
  }
};

export const isGoogleAuthConfigured = () => {
  configureGoogleSignIn();
  return true;
};

export const signInWithGoogle = async () => {
  try {
    console.log('[GoogleAuth] Starting Google Sign In...');
    
    await configureGoogleSignIn();
    
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const userInfo = await GoogleSignin.signIn();
    
    console.log('[GoogleAuth] User info received:', { ...userInfo, user: { ...userInfo.user, idToken: '***' } });
    
    if (!userInfo.idToken) {
      throw new Error('No ID token received from Google');
    }
    
    return userInfo.idToken;
  } catch (error) {
    console.error('[GoogleAuth] Google Sign In error:', error);
    
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      console.log('[GoogleAuth] User cancelled sign in');
      return null;
    } else if (error.code === statusCodes.IN_PROGRESS) {
      console.log('[GoogleAuth] Sign in already in progress');
      return null;
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      console.error('[GoogleAuth] Play services not available');
      throw new Error('Google Play Services not available');
    } else {
      console.error('[GoogleAuth] Sign in failed:', error.message);
      throw new Error(error.message || 'Google sign in failed');
    }
  }
};

export const signOutFromGoogle = async () => {
  try {
    await GoogleSignin.signOut();
    console.log('[GoogleAuth] Signed out from Google');
  } catch (error) {
    console.error('[GoogleAuth] Error signing out from Google:', error);
  }
};

// Keep these functions for backwards compatibility
export const useGoogleAuthRequest = () => {
  configureGoogleSignIn();
  return [null, null, signInWithGoogle];
};

export const getGoogleIdTokenFromResponse = async (idToken) => idToken;
