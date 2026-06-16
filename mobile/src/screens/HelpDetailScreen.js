import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../components/UI';
import { COLORS } from '../utils/constants';

export default function HelpDetailScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="Help & Support" subtitle="Get answers to common questions" />
        <View style={styles.card}>
          <Text style={styles.title}>Frequently Asked Questions</Text>
          <Text style={styles.text}>If you need help, please email support@skilllearn.com or visit the help section in the app.</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.title}>Contact Support</Text>
          <Text style={styles.text}>We’re here to help with login, course access, and app problems.</Text>
          <Text style={styles.text}>Support email: support@skilllearn.com</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20 },
  card: { backgroundColor: COLORS.card, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16 },
  title: { color: COLORS.text, fontSize: 18, fontWeight: '800', marginBottom: 10 },
  text: { color: COLORS.textSecondary, fontSize: 15, lineHeight: 22 },
});
