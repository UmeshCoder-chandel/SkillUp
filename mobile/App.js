import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider, useDispatch } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import store from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { loadUser } from './src/store/authSlice';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { API_URL } from './src/utils/constants';

function AppContent() {
  const dispatch = useDispatch();
  const { isDark } = useTheme();

  useEffect(() => {
    console.log('API_URL:', API_URL);
    dispatch(loadUser());
  }, [dispatch]);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppNavigator />
    </>
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
