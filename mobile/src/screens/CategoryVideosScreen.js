import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import api from '../services/api';
import VideoFeed from '../components/VideoFeed';
import { COLORS } from '../utils/constants';

export default function CategoryVideosScreen({ route }) {
  const { category } = route.params;
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/videos/category/${category._id}`)
      .then(({ data }) => setVideos(data.data))
      .finally(() => setLoading(false));
  }, [category._id]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return <VideoFeed videos={videos} />;
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
});
