import React, { useEffect, useState, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import api from '../services/api';
import VideoFeed from '../components/VideoFeed';
import { useTheme } from '../context/ThemeContext';

export default function CategoryVideosScreen({ route }) {
  const { category } = route.params;
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();

  const loadVideos = useCallback(async () => {
    try {
      const { data } = await api.get(`/videos/category/${category._id}`);
      setVideos(data.data);
    } finally {
      setLoading(false);
    }
  }, [category._id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadVideos();
    setRefreshing(false);
  }, [loadVideos]);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <VideoFeed videos={videos} refreshing={refreshing} onRefresh={onRefresh} colors={colors} />;
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
