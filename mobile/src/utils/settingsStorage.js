import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = 'skilllearn_app_settings';

export const defaultSettings = {
  darkMode: false,
  notificationsEnabled: true,
  language: 'English',
};

export const loadSettings = async () => {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw);
    return { ...defaultSettings, ...parsed };
  } catch (error) {
    console.error('Failed to load settings', error);
    return defaultSettings;
  }
};

export const saveSettings = async (settings) => {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings', error);
  }
};

export const clearSettings = async () => {
  try {
    await AsyncStorage.removeItem(SETTINGS_KEY);
  } catch (error) {
    console.error('Failed to clear settings', error);
  }
};
