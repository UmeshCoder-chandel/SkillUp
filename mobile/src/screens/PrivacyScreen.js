import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';

export default function PrivacyScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>1. Information We Collect</Text>
        <Text style={styles.paragraph}>
          We collect information you provide directly, including your name, email address, and any other information you choose to share.
        </Text>

        <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
        <Text style={styles.paragraph}>
          We use your information to:
          {'\n'}• Provide and improve our services
          {'\n'}• Communicate with you about your account
          {'\n'}• Personalize your experience
          {'\n'}• Send you important updates about the service
        </Text>

        <Text style={styles.sectionTitle}>3. Information Sharing</Text>
        <Text style={styles.paragraph}>
          We do not share your personal information with third parties except:
          {'\n'}• With your consent
          {'\n'}• To comply with legal obligations
          {'\n'}• To protect our rights and safety
        </Text>

        <Text style={styles.sectionTitle}>4. Data Security</Text>
        <Text style={styles.paragraph}>
          We implement reasonable security measures to protect your information. However, no method of transmission over the internet is 100% secure.
        </Text>

        <Text style={styles.sectionTitle}>5. Your Rights</Text>
        <Text style={styles.paragraph}>
          You have the right to:
          {'\n'}• Access and update your personal information
          {'\n'}• Delete your account
          {'\n'}• Opt out of certain communications
        </Text>

        <Text style={styles.sectionTitle}>6. Cookies</Text>
        <Text style={styles.paragraph}>
          We use cookies and similar technologies to enhance your experience and analyze usage of our service.
        </Text>

        <Text style={styles.sectionTitle}>7. Children's Privacy</Text>
        <Text style={styles.paragraph}>
          SkillLearn is not intended for children under 13. We do not knowingly collect information from children under 13.
        </Text>

        <Text style={styles.sectionTitle}>8. Changes to Privacy Policy</Text>
        <Text style={styles.paragraph}>
          We may update this privacy policy from time to time. We will notify you of significant changes through the app or via email.
        </Text>

        <Text style={styles.sectionTitle}>9. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have questions about this privacy policy, please contact us at support@skilllearn.com.
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
