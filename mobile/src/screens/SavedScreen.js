import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';
import CourseCard from '../components/CourseCard';
import { ScreenHeader, EmptyState } from '../components/UI';
import { COLORS } from '../utils/constants';

export default function SavedScreen({ navigation }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSaved = useCallback(async () => {
    try {
      const { data } = await api.get('/users/saved');
      setVideos(data.data || []);
    } catch {
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSaved();
    }, [loadSaved])
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="Saved" subtitle="Your bookmarked lessons" />

      {videos.length === 0 && !loading ? (
        <EmptyState
          icon="bookmark-outline"
          title="No saved courses yet"
          subtitle="Tap the bookmark on any course to save it"
        />
      ) : (
        <FlatList
          data={videos}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadSaved} tintColor={COLORS.primary} />
          }
          renderItem={({ item }) => (
            <CourseCard
              video={item}
              onPress={() => navigation.navigate('Watch', { videos, videoId: item._id })}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { paddingHorizontal: 20, paddingBottom: 24 },
});
