import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, GoogleAuthProvider } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
};

let app;
let auth;

const isConfigured = () =>
  !!(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId);

try {
  if (isConfigured()) {
    app = initializeApp(firebaseConfig);
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    });
  }
} catch (e) {
  console.warn('Firebase init failed:', e.message);
}

export { auth, GoogleAuthProvider, isConfigured as isFirebaseConfigured };
