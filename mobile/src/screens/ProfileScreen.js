import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { logoutUser } from '../store/authSlice';
import api from '../services/api';
import { Button } from '../components/UI';
import { COLORS, BADGES } from '../utils/constants';

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { user } = useSelector((s) => s.auth);
  const [profile, setProfile] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [creator, setCreator] = useState(null);

  useEffect(() => {
    api.get('/users/profile').then(({ data }) => setProfile(data.data)).catch(() => {});
    api.get('/creators').then(({ data }) => {
      const list = (data.data || []).slice(0, 5).map((c, i) => ({
        rank: i + 1,
        name: c.displayName,
        xp: c.totalVideos * 10 || 0,
        avatar: c.avatar,
        isMe: false,
      }));
      list.push({
        rank: list.length + 1,
        name: user?.name || 'You',
        xp: 0,
        avatar: user?.avatar,
        isMe: true,
      });
      setLeaderboard(list.sort((a, b) => b.xp - a.xp).map((item, i) => ({ ...item, rank: i + 1 })));
    }).catch(() => {});

    // Check if user is a creator
    api.get('/creators')
      .then(({ data }) => {
        const found = (data.data || []).find(c => c.userId?._id?.toString() === user?._id?.toString());
        setCreator(found || null);
      })
      .catch(() => {});
  }, [user?.name, user?.avatar, user?._id]);

  const savedCount = profile?.user?.savedVideos?.length || 0;
  const topicsCount = profile?.playlists?.length || 0;

  const becomeCreator = async () => {
    try {
      await api.post('/creators/become', {
        displayName: user?.name,
        bio: 'Creator on SkillLearn',
      });
      // Refresh creator info
      const { data } = await api.get('/creators');
      const found = (data.data || []).find(c => c.userId?._id?.toString() === user?._id?.toString());
      setCreator(found || null);
    } catch (error) {
      console.error('Failed to become creator:', error);
    }
  };

  const menuItems = [
    { icon: 'bookmark-outline', label: 'Saved', screen: 'Saved' }
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
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
            <Ionicons name="settings-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.header}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase()}</Text>
            </View>
          )}
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        {creator ? (
          <Button
            title="Upload Video"
            onPress={() => navigation.navigate('UploadVideo')}
            icon={<Ionicons name="cloud-upload-outline" size={18} color="#fff" />}
            style={styles.uploadButton}
          />
        ) : (
          <Button
            title="Become a Creator"
            onPress={becomeCreator}
            variant="outline"
            icon={<Ionicons name="create-outline" size={18} color={COLORS.primary} />}
            style={styles.becomeButton}
          />
        )}

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="flame" size={22} color={COLORS.streak} />
            <Text style={styles.statNum}>0</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="flash" size={22} color={COLORS.xp} />
            <Text style={styles.statNum}>{savedCount * 10}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="ribbon-outline" size={22} color={COLORS.success} />
            <Text style={styles.statNum}>{topicsCount}</Text>
            <Text style={styles.statLabel}>Topics</Text>
          </View>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => {
                const parentNav = navigation.getParent ? navigation.getParent() : null;
                if (parentNav && typeof parentNav.navigate === 'function') {
                  parentNav.navigate(item.screen);
                } else {
                  navigation.navigate(item.screen);
                }
              }}
            >
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon} size={20} color={COLORS.text} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Badges</Text>
        <View style={styles.badgesGrid}>
          {BADGES.map((badge) => (
            <View key={badge.id} style={styles.badge}>
              <View style={styles.badgeIcon}>
                <Ionicons name={badge.icon} size={24} color={COLORS.textSecondary} />
              </View>
              <Text style={styles.badgeLabel}>{badge.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Leaderboard</Text>
        {leaderboard.map((entry) => (
          <View key={`${entry.rank}-${entry.name}`} style={[styles.leaderRow, entry.isMe && styles.leaderMe]}>
            <Text style={styles.leaderRank}>#{entry.rank}</Text>
            {entry.avatar ? (
              <Image source={{ uri: entry.avatar }} style={styles.leaderAvatar} />
            ) : (
              <View style={styles.leaderAvatarPlaceholder}>
                <Text style={styles.leaderAvatarText}>{entry.name[0]}</Text>
              </View>
            )}
            <Text style={styles.leaderName} numberOfLines={1}>{entry.name}</Text>
            <View style={styles.leaderXp}>
              <Ionicons name="flash" size={14} color={COLORS.xp} />
              <Text style={styles.leaderXpText}>{entry.xp}</Text>
            </View>
          </View>
        ))}

        <Button
          title="Log out"
          onPress={() => dispatch(logoutUser())}
          variant="outline"
          icon={<Ionicons name="log-out-outline" size={18} color={COLORS.primary} />}
          style={styles.logout}
        />
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingHorizontal: 20 },
  header: { alignItems: 'center', paddingTop: 16, paddingBottom: 24 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  avatarText: { color: COLORS.text, fontSize: 36, fontWeight: '800' },
  name: { color: COLORS.text, fontSize: 24, fontWeight: '800', marginTop: 14 },
  email: { color: COLORS.textSecondary, fontSize: 14, marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statNum: { color: COLORS.text, fontSize: 22, fontWeight: '800', marginTop: 6 },
  statLabel: { color: COLORS.textSecondary, fontSize: 11, marginTop: 2, textAlign: 'center' },
  menuSection: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 28,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuLabel: { flex: 1, color: COLORS.text, fontSize: 15, fontWeight: '600' },
  sectionTitle: { color: COLORS.text, fontSize: 22, fontWeight: '800', marginBottom: 14 },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 28,
  },
  badge: {
    width: '31%',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  badgeLabel: { color: COLORS.textSecondary, fontSize: 11, textAlign: 'center', fontWeight: '600' },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  settingsIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  appBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  leaderMe: { borderColor: COLORS.primary },
  leaderRank: { color: COLORS.textSecondary, fontWeight: '700', width: 28 },
  leaderAvatar: { width: 36, height: 36, borderRadius: 18 },
  leaderAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaderAvatarText: { color: COLORS.text, fontWeight: '700' },
  leaderName: { flex: 1, color: COLORS.text, fontWeight: '600', fontSize: 15 },
  leaderXp: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  leaderXpText: { color: COLORS.text, fontWeight: '700' },
  settingsIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
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
