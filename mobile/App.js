import React, { useEffect, useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Text } from 'react-native';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible while we fetch resources
try {
  SplashScreen.preventAutoHideAsync();
  console.log('[App] Splash screen prevented from auto-hiding');
} catch (e) {
  console.warn('[App] Error preventing auto hide splash screen', e);
}

// Imports
import store from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { loadUser } from './src/store/authSlice';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { lightColors } from './src/utils/constants';

function AppContent() {
  const dispatch = useDispatch();
  const [appIsReady, setAppIsReady] = useState(false);
  const [error, setError] = useState(null);

  const { isDark, isLoading: themeLoading, colors } = useTheme();
  const authState = useSelector((s) => s.auth);
  const authInitializing = authState?.initializing;

  // Load user data and prepare app
  useEffect(() => {
    async function prepareApp() {
      console.log('[App] === Preparing App ===');
      try {
        console.log('[App] Loading user data');
        await dispatch(loadUser());
        console.log('[App] User data load completed');
      } catch (e) {
        console.error('[App] Error preparing app:', e);
        setError(e.message);
      }
    }
    prepareApp();
  }, [dispatch]);

  // Hide splash screen when everything is ready
  const hideSplash = useCallback(async () => {
    if (appIsReady) return;
    
    if (!themeLoading && !authInitializing) {
      console.log('[App] === Hiding splash screen ===');
      try {
        // Add a small delay to ensure smooth transition
        await new Promise(resolve => setTimeout(resolve, 300));
        await SplashScreen.hideAsync();
        console.log('[App] Splash screen hidden successfully');
      } catch (e) {
        console.warn('[App] Error hiding splash screen:', e);
      } finally {
        setAppIsReady(true);
      }
    }
  }, [themeLoading, authInitializing, appIsReady]);

  // Call hideSplash when dependencies change
  useEffect(() => {
    hideSplash();
  }, [hideSplash]);

  // Force hide splash screen after a timeout (max 20 seconds) as fallback
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (!appIsReady) {
        console.warn('[App] Splash screen timeout - forcing hide');
        try {
          await SplashScreen.hideAsync();
        } catch (e) {
          console.warn('[App] Error hiding splash screen on timeout:', e);
        } finally {
          setAppIsReady(true);
        }
      }
    }, 20000);
    return () => clearTimeout(timeoutId);
  }, [appIsReady]);

  // Show error screen if critical error
  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: lightColors.background, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: lightColors.error, fontSize: 18, textAlign: 'center', marginBottom: 20 }}>
          {error}
        </Text>
        <Text style={{ color: lightColors.text, fontSize: 14, textAlign: 'center' }}>
          Please restart the app
        </Text>
      </View>
    );
  }

  if (!appIsReady) {
    console.log('[App] Rendering loading state');
    return (
      <View style={{ flex: 1, backgroundColor: lightColors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={lightColors.primary} />
        <Text style={{ color: lightColors.text, marginTop: 16 }}>
          Loading SkillLearn...
        </Text>
      </View>
    );
  }

  console.log('[App] === Rendering full app ===');
  console.log('[App] Auth state:', { isAuthenticated: authState.isAuthenticated, initializing: authState.initializing });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppNavigator />
    </View>
  );
}

export default function App() {
  console.log('[App] === App Component Starting ===');

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Provider store={store}>
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

