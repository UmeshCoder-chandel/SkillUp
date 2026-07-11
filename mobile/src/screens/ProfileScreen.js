import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { logoutUser, loadUser } from '../store/authSlice';
import api from '../services/api';
import { Button } from '../components/UI';
import { BADGES } from '../utils/constants';
import { useTheme } from '../context/ThemeContext';

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { user } = useSelector((s) => s.auth);
  const [profile, setProfile] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [creator, setCreator] = useState(null);
  const [requestingCreator, setRequestingCreator] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfileData = useCallback(async () => {
    try {
      const [profileRes, creatorsRes] = await Promise.all([
        api.get('/users/profile'),
        api.get('/creators'),
      ]);
      const profileData = profileRes.data.data;
      setProfile(profileData);
      
      const list = (creatorsRes.data.data || []).slice(0, 5).map((c, i) => ({
        rank: i + 1,
        name: c.displayName,
        xp: c.totalVideos * 10 || 0,
        avatar: c.avatar,
        isMe: false,
      }));
      
      // Add current user to leaderboard
      list.push({
        rank: list.length + 1,
        name: user?.name || 'You',
        xp: profileData?.user?.xp || 0,
        avatar: user?.avatar,
        isMe: true,
      });
      
      setLeaderboard(list.sort((a, b) => b.xp - a.xp).map((item, i) => ({ ...item, rank: i + 1 })));
      
      const found = (creatorsRes.data.data || []).find(c => c.userId?._id?.toString() === user?._id?.toString());
      setCreator(found || null);
    } catch {
      // Ignore errors
    }
  }, [user]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      dispatch(loadUser()),
      loadProfileData(),
    ]);
    setRefreshing(false);
  }, [dispatch, loadProfileData]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  const savedCount = profile?.user?.savedVideos?.length || 0;
  const topicsCount = profile?.playlists?.length || 0;
  const isCreator = creator || user?.role === 'creator';
  const hasPendingRequest = profile?.user?.creatorRequest?.status === 'pending';
  const dayStreak = profile?.user?.dayStreak || 0;
  const xp = profile?.user?.xp || 0;
  const userBadges = profile?.user?.badges || [];

  const becomeCreator = async () => {
    setRequestingCreator(true);
    try {
      await api.post('/users/request-creator');
      // Refresh profile
      const { data } = await api.get('/users/profile');
      setProfile(data.data);
    } catch (error) {
      console.error('Failed to request creator:', error);
    } finally {
      setRequestingCreator(false);
    }
  };

  const menuItems = [
    { icon: 'bookmark-outline', label: 'Saved', screen: 'Saved' }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.appBar}>
          <View />
          <TouchableOpacity
            style={styles.settingsIcon}
            onPress={() => {
              const parentNav = navigation.getParent ? navigation.getParent() : null;
              if (parentNav && typeof parentNav.navigate === 'function') {
                parentNav.navigate('Settings');
              } else {
                navigation.navigate('Settings');
              }
            }}
          >
            <Ionicons name="settings-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.header}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={[styles.avatar, { borderColor: colors.primary }]} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.card, borderColor: colors.primary }]}>
              <Text style={[styles.avatarText, { color: colors.text }]}>{user?.name?.[0]?.toUpperCase()}</Text>
            </View>
          )}
          <Text style={[styles.name, { color: colors.text }]}>{user?.name}</Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email}</Text>
        </View>

        {isCreator ? (
          <Button
            title="Upload Video"
            onPress={() => navigation.navigate('UploadVideo')}
            icon={<Ionicons name="cloud-upload-outline" size={18} color="#fff" />}
            style={styles.uploadButton}
          />
        ) : hasPendingRequest ? (
          <View style={[styles.pendingRequestContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="time-outline" size={20} color={colors.primary} />
            <Text style={[styles.pendingRequestText, { color: colors.primary }]}>Creator request pending approval</Text>
          </View>
        ) : (
          <Button
            title="Become a Creator"
            onPress={becomeCreator}
            loading={requestingCreator}
            variant="outline"
            icon={<Ionicons name="create-outline" size={18} color={colors.primary} />}
            style={styles.becomeButton}
          />
        )}

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="flame" size={22} color={colors.streak} />
            <Text style={[styles.statNum, { color: colors.text }]}>{dayStreak}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Day Streak</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="flash" size={22} color={colors.xp} />
            <Text style={[styles.statNum, { color: colors.text }]}>{xp}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>XP</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="ribbon-outline" size={22} color={colors.success} />
            <Text style={[styles.statNum, { color: colors.text }]}>{topicsCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Topics</Text>
          </View>
        </View>

        <View style={[styles.menuSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, { borderBottomColor: colors.border }]}
              onPress={() => {
                const parentNav = navigation.getParent ? navigation.getParent() : null;
                if (parentNav && typeof parentNav.navigate === 'function') {
                  parentNav.navigate(item.screen);
                } else {
                  navigation.navigate(item.screen);
                }
              }}
            >
              <View style={[styles.menuIcon, { backgroundColor: colors.surface }]}>
                <Ionicons name={item.icon} size={20} color={colors.text} />
              </View>
              <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Badges</Text>
        <View style={styles.badgesGrid}>
          {BADGES.map((badge) => {
            const earned = userBadges.includes(badge.id);
            return (
              <View key={badge.id} style={[styles.badge, { backgroundColor: colors.card, borderColor: colors.border, opacity: earned ? 1 : 0.5 }]}>
                <View style={[styles.badgeIcon, { backgroundColor: colors.surface }]}>
                  <Ionicons name={badge.icon} size={24} color={earned ? colors.primary : colors.textSecondary} />
                </View>
                <Text style={[styles.badgeLabel, { color: earned ? colors.text : colors.textSecondary }]}>{badge.label}</Text>
              </View>
            );
          })}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Leaderboard</Text>
        {leaderboard.map((entry) => (
          <View key={`${entry.rank}-${entry.name}`} style={[styles.leaderRow, { backgroundColor: colors.card, borderColor: colors.border }, entry.isMe && { borderColor: colors.primary }]}>
            <Text style={[styles.leaderRank, { color: colors.textSecondary }]}>#{entry.rank}</Text>
            {entry.avatar ? (
              <Image source={{ uri: entry.avatar }} style={styles.leaderAvatar} />
            ) : (
              <View style={[styles.leaderAvatarPlaceholder, { backgroundColor: colors.surface }]}>
                <Text style={[styles.leaderAvatarText, { color: colors.text }]}>{entry.name[0]}</Text>
              </View>
            )}
            <Text style={[styles.leaderName, { color: colors.text }]} numberOfLines={1}>{entry.name}</Text>
            <View style={styles.leaderXp}>
              <Ionicons name="flash" size={14} color={colors.xp} />
              <Text style={[styles.leaderXpText, { color: colors.text }]}>{entry.xp}</Text>
            </View>
          </View>
        ))}

        <Button
          title="Log out"
          onPress={() => dispatch(logoutUser())}
          variant="outline"
          icon={<Ionicons name="log-out-outline" size={18} color={colors.primary} />}
          style={styles.logout}
        />
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
  header: { alignItems: 'center', paddingTop: 16, paddingBottom: 24 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  avatarText: { fontSize: 36, fontWeight: '800' },
  name: { fontSize: 24, fontWeight: '800', marginTop: 14 },
  email: { fontSize: 14, marginTop: 4 },
  pendingRequestContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    gap: 10,
  },
  pendingRequestText: {
    fontSize: 14,
    fontWeight: '700',
  },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  statNum: { fontSize: 22, fontWeight: '800', marginTop: 6 },
  statLabel: { fontSize: 11, marginTop: 2, textAlign: 'center' },
  menuSection: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 28,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '600' },
  sectionTitle: { fontSize: 22, fontWeight: '800', marginBottom: 14 },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 28,
  },
  badge: {
    width: '31%',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  badgeLabel: { fontSize: 11, textAlign: 'center', fontWeight: '600' },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    gap: 12,
  },
  leaderRank: { fontWeight: '700', width: 28 },
  leaderAvatar: { width: 36, height: 36, borderRadius: 18 },
  leaderAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaderAvatarText: { fontWeight: '700' },
  leaderName: { flex: 1, fontWeight: '600', fontSize: 15 },
  leaderXp: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  leaderXpText: { fontWeight: '700' },
  appBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  logout: { marginTop: 24 },
  uploadButton: { marginBottom: 24 },
  becomeButton: { marginBottom: 24 },
});
