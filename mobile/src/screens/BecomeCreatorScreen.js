import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useSelector, useDispatch } from 'react-redux';
import api from '../services/api';
import { Button } from '../components/UI';
import { loadUser } from '../store/authSlice';

export default function BecomeCreatorScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleBecomeCreator = async () => {
    try {
      setLoading(true);
      await api.post('/creators/become', {
        displayName: user.name,
      });
      await dispatch(loadUser());
      Alert.alert('Success', 'You are now a creator!');
      navigation.goBack();
    } catch (error) {
      console.error('Error becoming creator:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to become a creator'
      );
    } finally {
      setLoading(false);
    }
  };

  const isCreator = user?.role === 'creator' || user?.role === 'admin';

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Become a Creator</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="create-outline" size={64} color={colors.primary} />
          </View>

          <Text style={[styles.heading, { color: colors.text }]}>Unlock Creator Features</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Share your knowledge, grow your audience, and access exclusive creator tools on our platform.
          </Text>

          <View style={styles.features}>
            <View style={styles.feature}>
              <Ionicons
                name="videocam-outline" size={24} color={colors.primary} />
              <View style={styles.featureText}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>Upload Videos</Text>
                <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>
                  Publish high quality content
                </Text>
              </View>
            </View>
            <View style={styles.feature}>
              <Ionicons
                name="people-outline" size={24} color={colors.primary} />
              <View style={styles.featureText}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>Build Audience</Text>
                <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>
                  Connect with followers
                </Text>
              </View>
            </View>
            <View style={styles.feature}>
              <Ionicons
                name="stats-chart-outline" size={24} color={colors.primary} />
              <View style={styles.featureText}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>Analytics</Text>
                <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>
                  Track your growth
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Button
            title={isCreator ? "You're already a creator" : "Become a Creator"}
            onPress={handleBecomeCreator}
            loading={loading}
            disabled={isCreator || loading}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, paddingBottom: 24 },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '800' },
  content: { flex: 1, alignItems: 'center' },
  iconContainer: { padding: 20, borderRadius: 16, marginBottom: 20 },
  heading: { fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
  description: { fontSize: 16, textAlign: 'center', marginBottom: 32 },
  features: { width: '100%', gap: 16 },
  feature: { flexDirection: 'row', gap: 16, padding: 20, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 16 },
  featureText: { flex: 1, gap: 4 },
  featureTitle: { fontSize: 16, fontWeight: '700' },
  featureDesc: { fontSize: 14 },
  footer: { marginTop: 'auto', paddingTop: 24 },
});
