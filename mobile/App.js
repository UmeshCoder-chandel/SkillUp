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
import { API_URL } from './src/utils/constants';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function AppContent() {
  const dispatch = useDispatch();
  const { isDark, isLoading: themeLoading, colors } = useTheme();
  const { initializing: authInitializing } = useSelector((s) => s.auth);
  const [splashHidden, setSplashHidden] = useState(false);

  // Hide splash after 2 seconds, no conditions
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        await SplashScreen.hideAsync();
        setSplashHidden(true);
      } catch (e) {
        console.warn('Error hiding splash screen:', e);
        setSplashHidden(true);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Load user data
  useEffect(() => {
    console.log('AppContent: loading user data');
    dispatch(loadUser());
  }, [dispatch]);

  const isReady = splashHidden && !themeLoading && !authInitializing;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {isReady ? (
        <AppNavigator />
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.text, marginTop: 16 }}>
            Loading SkillLearn...
          </Text>
        </View>
      )}
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
