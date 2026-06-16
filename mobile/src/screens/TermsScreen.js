import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';

export default function TermsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By accessing and using SkillLearn, you agree to be bound by these Terms of Service. If you do not agree, please do not use our service.
        </Text>

        <Text style={styles.sectionTitle}>2. User Accounts</Text>
        <Text style={styles.paragraph}>
          You must provide accurate information when creating an account. You are responsible for maintaining the security of your account and for all activities under your account.
        </Text>

        <Text style={styles.sectionTitle}>3. Content</Text>
        <Text style={styles.paragraph}>
          All content on SkillLearn is for educational purposes. Users may not upload or share unauthorized content. We reserve the right to remove any content that violates our policies.
        </Text>

        <Text style={styles.sectionTitle}>4. Prohibited Activities</Text>
        <Text style={styles.paragraph}>
          You may not:
          {'\n'}• Use the service for any illegal purpose
          {'\n'}• Interfere with or disrupt the service
          {'\n'}• Attempt to access any unauthorized part of the service
          {'\n'}• Share your account credentials with others
        </Text>

        <Text style={styles.sectionTitle}>5. Termination</Text>
        <Text style={styles.paragraph}>
          We may suspend or terminate your account at any time for violating these terms. You may also terminate your account at any time through your profile settings.
        </Text>

        <Text style={styles.sectionTitle}>6. Disclaimer</Text>
        <Text style={styles.paragraph}>
          SkillLearn is provided "as is" without warranties of any kind. We do not guarantee that the service will be uninterrupted or error-free.
        </Text>

        <Text style={styles.sectionTitle}>7. Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          We shall not be liable for any indirect, incidental, special, or consequential damages arising out of your use of the service.
        </Text>

        <Text style={styles.sectionTitle}>8. Changes to Terms</Text>
        <Text style={styles.paragraph}>
          We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the new terms.
        </Text>

        <Text style={styles.lastUpdated}>Last Updated: June 14, 2026</Text>
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { color: COLORS.text, fontSize: 22, fontWeight: '800' },
  scroll: { paddingHorizontal: 20, paddingTop: 24 },
  sectionTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800', marginTop: 24, marginBottom: 12 },
  paragraph: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 22 },
  lastUpdated: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 32,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
