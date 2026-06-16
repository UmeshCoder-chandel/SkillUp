import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, ScreenHeader } from '../components/UI';
import { loadSettings, saveSettings, defaultSettings } from '../utils/settingsStorage';
import { useTheme } from '../context/ThemeContext';
import Constants from 'expo-constants';

const options = [
  { label: 'Account / Profile Settings', screen: 'EditProfile', icon: 'person-circle-outline' },
  { label: 'Privacy Policy', screen: 'Privacy', icon: 'shield-checkmark-outline' },
  { label: 'Terms & Conditions', screen: 'Terms', icon: 'document-text-outline' },
  { label: 'Help & Support', screen: 'Help', icon: 'help-circle-outline' },
  { label: 'About App', screen: 'About', icon: 'information-circle-outline' },
];

export default function SettingsScreen({ navigation }) {
  const { isDark, colors, toggleTheme } = useTheme();
  const [settings, setSettings] = useState(defaultSettings);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    loadSettings().then((saved) => {
      if (active) {
        setSettings(saved);
        setLoaded(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (loaded) saveSettings(settings);
  }, [settings, loaded]);

  const updateLanguage = (language) => {
    setSettings((current) => ({ ...current, language }));
  };

  const confirmLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => navigation.navigate('Login') },
    ]);
  };

  const handleOptionPress = (item) => {
    if (item.screen === 'EditProfile') {
      const parentNav = navigation.getParent ? navigation.getParent() : null;
      if (parentNav && typeof parentNav.navigate === 'function') {
        parentNav.navigate(item.screen);
      } else {
        navigation.navigate(item.screen);
      }
      return;
    }
    if (item.screen === 'Help') {
      navigation.navigate('HelpDetail');
      return;
    }
    if (item.screen === 'About') {
      navigation.navigate('AboutDetail');
      return;
    }
    navigation.navigate(item.screen);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.inner}>
        <ScreenHeader title="Settings" subtitle="Manage your app preferences" />

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>Dark Mode</Text>
              <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>Keep the app easier on your eyes</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={isDark ? colors.surface : colors.card}
            />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications</Text>
          <View style={styles.row}> 
            <View style={styles.rowText}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>Notifications</Text>
              <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>Receive app updates and reminders</Text>
            </View>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={() => setSettings(prev => ({ ...prev, notificationsEnabled: !prev.notificationsEnabled }))}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.notificationsEnabled ? colors.surface : colors.card}
            />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Language</Text>
          <View style={styles.languageGrid}>
            {['English', 'Spanish', 'French'].map((language) => (
              <TouchableOpacity
                key={language}
                style={[
                  styles.languagePill,
                  { borderColor: colors.border, backgroundColor: colors.surface },
                  settings.language === language && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
                onPress={() => updateLanguage(language)}
              >
                <Text
                  style={[
                    styles.languageText,
                    { color: colors.textSecondary, fontWeight: '600' },
                    settings.language === language && { color: colors.background },
                  ]}
                >
                  {language}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Support</Text>
          {options.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.optionRow, { borderTopColor: colors.border }]}
              onPress={() => handleOptionPress(item)}
            >
              <View style={[styles.optionIcon, { backgroundColor: colors.surface }]}>
                <Ionicons name={item.icon} size={22} color={colors.primary} />
              </View>
              <Text style={[styles.optionLabel, { color: colors.text }]}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Button
            title="Logout"
            variant="outline"
            onPress={confirmLogout}
            style={styles.logoutButton}
            textStyle={{ color: colors.primary }}
          />
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>
            Version {Constants.expoConfig?.version || '1.0.0'}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  section: { marginBottom: 24, borderRadius: 20, padding: 18, borderWidth: 1 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowText: { flex: 1, paddingRight: 10 },
  rowTitle: { fontSize: 16, fontWeight: '700' },
  rowSubtitle: { marginTop: 4, fontSize: 13 },
  languageGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  languagePill: { flex: 1, paddingVertical: 12, borderRadius: 16, borderWidth: 1, alignItems: 'center', marginRight: 8 },
  optionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderTopWidth: 1 },
  optionIcon: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  optionLabel: { flex: 1, fontSize: 15, fontWeight: '600' },
  logoutButton: { marginTop: 8, borderRadius: 20, paddingVertical: 14 },
  versionText: { textAlign: 'center', marginTop: 14, fontSize: 13 },
});
