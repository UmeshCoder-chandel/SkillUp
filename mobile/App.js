import React, { useEffect, useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Text } from 'react-native';
import { Provider, useDispatch } from 'react-redux';
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
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    console.log('AppContent: starting prepare()');
    async function prepare() {
      try {
        console.log('AppContent: API_URL:', API_URL);
        dispatch(loadUser());
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('AppContent: prepare() complete');
      } catch (e) {
        console.warn('AppContent: prepare() error:', e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, [dispatch]);

  const onLayoutRootView = useCallback(async () => {
    console.log(`AppContent: onLayoutRootView called, appIsReady=${appIsReady}, themeLoading=${themeLoading}`);
    if (appIsReady && !themeLoading) {
      try {
        console.log('AppContent: hiding splash screen');
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn('AppContent: error hiding splash:', e);
      }
    }
  }, [appIsReady, themeLoading]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }} onLayout={onLayoutRootView}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {appIsReady && !themeLoading ? (
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
