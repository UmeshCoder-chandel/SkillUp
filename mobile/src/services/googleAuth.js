import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

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

export const isGoogleAuthConfigured = () => {
  const webClientId = getEnvVar(
    'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID'
  );

  const androidClientId = getEnvVar(
    'EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID'
  );

  const iosClientId = getEnvVar(
    'EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID'
  );

  console.log('[GoogleAuth] Platform:', Platform.OS);

  if (Platform.OS === 'android') {
    return !!(webClientId && androidClientId);
  }

  if (Platform.OS === 'ios') {
    return !!(webClientId && iosClientId);
  }

  return !!webClientId;
};

export function useGoogleAuthRequest() {
  try {
    console.log('[GoogleAuth] Initializing Google Auth...');

    const webClientId = getEnvVar(
      'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID'
    );

    const androidClientId = getEnvVar(
      'EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID'
    );

    const iosClientId = getEnvVar(
      'EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID'
    );

    const redirectUri = AuthSession.makeRedirectUri({
      useProxy: true,
    });

    console.log(
      '[GoogleAuth] Redirect URI:',
      redirectUri
    );

    const config = {
      scopes: ['profile', 'email'],
      webClientId,
      androidClientId,
      iosClientId,
      redirectUri,
    };

    console.log(
      '[GoogleAuth] Config:',
      JSON.stringify(config, null, 2)
    );

    const [request, response, promptAsync] =
      Google.useIdTokenAuthRequest(config);

    console.log(
      '[GoogleAuth] Request created:',
      !!request
    );

    return [request, response, promptAsync];
  } catch (error) {
    console.error(
      '[GoogleAuth] Initialization Error:',
      error
    );

    return [null, null, async () => null];
  }
}

export async function getGoogleIdTokenFromResponse(
  response
) {
  console.log(
    '[GoogleAuth] Processing Response:',
    JSON.stringify(response, null, 2)
  );

  if (!response) {
    return null;
  }

  if (response.type === 'dismiss') {
    console.log(
      '[GoogleAuth] User dismissed login'
    );
    return null;
  }

  if (response.type === 'cancel') {
    console.log(
      '[GoogleAuth] User cancelled login'
    );
    return null;
  }

  if (response.type === 'error') {
    console.error(
      '[GoogleAuth] Google Error:',
      response.error
    );

    throw new Error(
      response.error?.message ||
        'Google Sign-In Failed'
    );
  }

  if (response.type !== 'success') {
    throw new Error(
      `Unexpected response type: ${response.type}`
    );
  }

  const idToken =
    response.authentication?.idToken;

  console.log(
    '[GoogleAuth] ID Token:',
    idToken ? 'FOUND' : 'NOT FOUND'
  );

  if (!idToken) {
    throw new Error(
      'No ID Token received from Google'
    );
  }

  return idToken;
}