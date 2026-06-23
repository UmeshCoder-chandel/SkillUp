import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Text } from 'react-native';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';

// Imports wrapped in try-catch to prevent crashes
let store, AppNavigator, loadUser, ThemeProvider, useTheme, lightColors;
try {
  store = require('./src/store').default;
  AppNavigator = require('./src/navigation/AppNavigator').default;
  loadUser = require('./src/store/authSlice').loadUser;
  const themeContext = require('./src/context/ThemeContext');
  ThemeProvider = themeContext.ThemeProvider;
  useTheme = themeContext.useTheme;
  const constants = require('./src/utils/constants');
  lightColors = constants.lightColors;
} catch (e) {
  console.error('CRITICAL ERROR: Failed to load core modules', e);
}

// Keep the splash screen visible while we fetch resources
try {
  SplashScreen.preventAutoHideAsync();
} catch (e) {
  console.warn('Error preventing auto hide splash screen', e);
}

function AppContent() {
  const dispatch = useDispatch();
  const [appIsReady, setAppIsReady] = useState(false);
  const [error, setError] = useState(null);

  // Fallback values if hooks aren't available
  let isDark = false;
  let themeLoading = true;
  let colors = lightColors;
  let authInitializing = true;

  try {
    const theme = useTheme();
    isDark = theme?.isDark || false;
    themeLoading = theme?.isLoading !== undefined ? theme.isLoading : true;
    colors = theme?.colors || lightColors;
    const authState = useSelector((s) => s.auth);
    authInitializing = authState?.initializing !== undefined ? authState.initializing : true;
  } catch (e) {
    console.error('Error using hooks in AppContent', e);
    themeLoading = false;
    authInitializing = false;
  }

  // Load user data and prepare app
  useEffect(() => {
    async function prepareApp() {
      console.log('=== AppContent: Preparing App ===');
      try {
        console.log('AppContent: Loading user data');
        if (dispatch && loadUser) {
          dispatch(loadUser());
        } else {
          console.warn('AppContent: dispatch or loadUser not available');
        }
        console.log('AppContent: User data load initiated');
      } catch (e) {
        console.error('Error preparing app:', e);
        setError(e.message);
        // Still proceed to render
        setAppIsReady(true);
      }
    }
    prepareApp();
  }, [dispatch]);

  // Force hide splash screen after a timeout (max 15 seconds)
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      console.warn('Splash screen timeout - forcing hide');
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn('Error hiding splash screen on timeout:', e);
      } finally {
        setAppIsReady(true);
      }
    }, 15000);
    return () => clearTimeout(timeoutId);
  }, []);

  // Hide splash screen when everything is ready
  useEffect(() => {
    async function hideSplashIfReady() {
      console.log('=== hideSplashIfReady called ===');
      console.log('themeLoading:', themeLoading, 'authInitializing:', authInitializing);
      if (!themeLoading && !authInitializing) {
        try {
          console.log('Hiding splash screen');
          await SplashScreen.hideAsync();
        } catch (e) {
          console.warn('Error hiding splash screen:', e);
        } finally {
          console.log('Setting appIsReady to true');
          setAppIsReady(true);
        }
      }
    }
    hideSplashIfReady();
  }, [themeLoading, authInitializing]);

  // Use light colors as fallback while loading to prevent black screen
  const currentColors = appIsReady ? colors : lightColors;

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
    console.log('AppContent: Rendering loading screen');
    return (
      <View style={{ flex: 1, backgroundColor: currentColors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={currentColors.primary} />
        <Text style={{ color: currentColors.text, marginTop: 16 }}>
          Loading SkillLearn...
        </Text>
      </View>
    );
  }

  console.log('AppContent: Rendering full app');

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {AppNavigator ? <AppNavigator /> : null}
    </View>
  );
}

export default function App() {
  console.log('=== App Component Starting ===');
  
  // Fallback rendering if critical modules failed to load
  if (!store || !ThemeProvider) {
    return (
      <View style={{ flex: 1, backgroundColor: lightColors.background, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: lightColors.text, fontSize: 18, textAlign: 'center' }}>
          Loading app...
        </Text>
      </View>
    );
  }

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
