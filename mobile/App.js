import React, { useEffect, useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Text } from 'react-native';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import store from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { loadUser } from './src/store/authSlice';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { API_URL, lightColors } from './src/utils/constants';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function AppContent() {
  const dispatch = useDispatch();
  const { isDark, isLoading: themeLoading, colors } = useTheme();
  const { initializing: authInitializing } = useSelector((s) => s.auth);
  const [appIsReady, setAppIsReady] = useState(false);

  // Load user data and prepare app
  useEffect(() => {
    async function prepareApp() {
      try {
        console.log('AppContent: loading user data');
        dispatch(loadUser());
      } catch (e) {
        console.warn('Error preparing app:', e);
      }
    }
    prepareApp();
  }, [dispatch]);

  // Hide splash screen when everything is ready
  useEffect(() => {
    async function hideSplashIfReady() {
      if (!themeLoading && !authInitializing) {
        try {
          await SplashScreen.hideAsync();
        } catch (e) {
          console.warn('Error hiding splash screen:', e);
        } finally {
          setAppIsReady(true);
        }
      }
    }
    hideSplashIfReady();
  }, [themeLoading, authInitializing]);

  // Use light colors as fallback while loading to prevent black screen
  const currentColors = appIsReady ? colors : lightColors;

  if (!appIsReady) {
    return (
      <View style={{ flex: 1, backgroundColor: currentColors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={currentColors.primary} />
        <Text style={{ color: currentColors.text, marginTop: 16 }}>
          Loading SkillLearn...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppNavigator />
    </View>
  );
}

export default function App() {
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
