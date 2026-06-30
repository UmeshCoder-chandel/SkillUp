import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { ScreenHeader } from '../components/UI';
import { COLORS } from '../utils/constants';

export default function AboutDetailScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <ScreenHeader title="About App" subtitle="SkillLearn mobile app" />
        <View style={styles.card}>
          <Text style={styles.label}>Version</Text>
          <Text style={styles.value}>{Constants.expoConfig?.version || '1.0.0'}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Built with</Text>
          <Text style={styles.value}>React Native / Expo</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Support</Text>
          <Text style={styles.value}>support@skilllearn.com</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20 },
  card: { backgroundColor: COLORS.card, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16 },
  label: { color: COLORS.textSecondary, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  value: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
});
