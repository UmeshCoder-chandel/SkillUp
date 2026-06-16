import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import api from '../services/api';
import { COLORS } from '../utils/constants';

export default function DashboardScreen() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/users/dashboard').then(({ data: res }) => setData(res.data)).catch(() => {});
  }, []);

  const VideoCard = ({ video }) => (
    <TouchableOpacity style={styles.videoCard}>
      <Image source={{ uri: video.thumbnail }} style={styles.thumb} />
      <Text style={styles.videoTitle} numberOfLines={2}>{video.title}</Text>
      <Text style={styles.videoCat}>{video.category?.title}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Learning Dashboard</Text>

      <Text style={styles.section}>Continue Learning</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {(data?.continueLearning || []).map((v) => <VideoCard key={v._id} video={v} />)}
        {!data?.continueLearning?.length && <Text style={styles.empty}>Start watching videos!</Text>}
      </ScrollView>

      <Text style={styles.section}>Recently Watched</Text>
      {(data?.recentlyWatched || []).slice(0, 5).map((h) => (
        h.video && <VideoCard key={h.video._id} video={h.video} />
      ))}

      <Text style={styles.section}>Recommended For You</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {(data?.recommended || []).map((v) => <VideoCard key={v._id} video={v} />)}
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingTop: 50 },
  header: { fontSize: 24, fontWeight: '700', color: COLORS.text, padding: 16 },
  section: { color: COLORS.primary, fontWeight: '700', paddingHorizontal: 16, marginTop: 16, marginBottom: 8 },
  videoCard: { width: 160, marginLeft: 16, marginBottom: 16 },
  thumb: { width: 160, height: 100, borderRadius: 10, backgroundColor: COLORS.surface },
  videoTitle: { color: COLORS.text, fontSize: 13, marginTop: 6, fontWeight: '600' },
  videoCat: { color: COLORS.textSecondary, fontSize: 11 },
  empty: { color: COLORS.textSecondary, padding: 16 },
});
