let AsyncStorage;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (e) {
  console.warn('@react-native-async-storage/async-storage not available, using fallback');
}

const SETTINGS_KEY = 'skilllearn_app_settings';

export const defaultSettings = {
  darkMode: false,
  notificationsEnabled: true,
  language: 'English',
};

// Fallback in-memory storage
let fallbackSettings = { ...defaultSettings };

export const loadSettings = async () => {
  try {
    if (AsyncStorage) {
      const raw = await AsyncStorage.getItem(SETTINGS_KEY);
      if (!raw) return defaultSettings;
      const parsed = JSON.parse(raw);
      return { ...defaultSettings, ...parsed };
    }
    return fallbackSettings;
  } catch (error) {
    console.error('Failed to load settings', error);
    return defaultSettings;
  }
};

export const saveSettings = async (settings) => {
  try {
    if (AsyncStorage) {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } else {
      fallbackSettings = { ...defaultSettings, ...settings };
    }
  } catch (error) {
    console.error('Failed to save settings', error);
  }
};

export const clearSettings = async () => {
  try {
    if (AsyncStorage) {
      await AsyncStorage.removeItem(SETTINGS_KEY);
    } else {
      fallbackSettings = { ...defaultSettings };
    }
  } catch (error) {
    console.error('Failed to clear settings', error);
  }
};
