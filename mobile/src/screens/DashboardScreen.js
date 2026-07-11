import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function DashboardScreen() {
  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();

  const loadData = useCallback(async () => {
    try {
      const { data: res } = await api.get('/users/dashboard');
      setData(res.data);
    } catch {
      // Ignore errors
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const VideoCard = ({ video }) => (
    <TouchableOpacity style={styles.videoCard}>
      <Image source={{ uri: video.thumbnail }} style={[styles.thumb, { backgroundColor: colors.surface }]} />
      <Text style={[styles.videoTitle, { color: colors.text }]} numberOfLines={2}>{video.title}</Text>
      <Text style={[styles.videoCat, { color: colors.textSecondary }]}>{video.category?.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <Text style={[styles.header, { color: colors.text }]}>Learning Dashboard</Text>

        <Text style={[styles.section, { color: colors.primary }]}>Continue Learning</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {(data?.continueLearning || []).map((v) => <VideoCard key={v._id} video={v} />)}
          {!data?.continueLearning?.length && <Text style={[styles.empty, { color: colors.textSecondary }]}>Start watching videos!</Text>}
        </ScrollView>

        <Text style={[styles.section, { color: colors.primary }]}>Recently Watched</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {(data?.recentlyWatched || []).slice(0, 5).map((h) => (
            h.video && <VideoCard key={h.video._id} video={h.video} />
          ))}
        </ScrollView>

        <Text style={[styles.section, { color: colors.primary }]}>Recommended For You</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {(data?.recommended || []).map((v) => <VideoCard key={v._id} video={v} />)}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingTop: 16 },
  header: { fontSize: 24, fontWeight: '700', padding: 16 },
  section: { fontWeight: '700', paddingHorizontal: 16, marginTop: 16, marginBottom: 8 },
  horizontalScroll: { paddingLeft: 16 },
  videoCard: { width: 160, marginRight: 16, marginBottom: 16 },
  thumb: { width: 160, height: 100, borderRadius: 10 },
  videoTitle: { fontSize: 13, marginTop: 6, fontWeight: '600' },
  videoCat: { fontSize: 11 },
  empty: { padding: 16 },
});
