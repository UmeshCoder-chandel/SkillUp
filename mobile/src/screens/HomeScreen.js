import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeed } from '../store/videoSlice';
import { fetchCategories } from '../store/categorySlice';
import CourseCard from '../components/CourseCard';
import { getCategoryIcon } from '../utils/constants';
import { useTheme } from '../context/ThemeContext';

export default function HomeScreen({ navigation }) {
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const { user } = useSelector((s) => s.auth);
  const { feed, loading, loadingMore, pagination } = useSelector((s) => s.videos);
  const { list: categories } = useSelector((s) => s.categories);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchFeed({ page: 1 }));
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      dispatch(fetchCategories()),
      dispatch(fetchFeed({ page: 1, category: selectedCategory })),
    ]);
    setRefreshing(false);
  }, [dispatch, selectedCategory]);

  const loadCategory = (categoryId) => {
    setSelectedCategory(categoryId);
    dispatch(fetchFeed({ page: 1, category: categoryId || undefined }));
  };

  const loadMore = useCallback(() => {
    if (!loadingMore && pagination && pagination.page < pagination.pages) {
      dispatch(fetchFeed({ page: pagination.page + 1, category: selectedCategory || undefined }));
    }
  }, [dispatch, loadingMore, pagination, selectedCategory]);

  const openVideo = (video) => {
    navigation.navigate('Watch', { videos: feed, videoId: video._id });
  };

  const firstName = user?.name?.split(' ')[0] || 'Learner';
  const trending = feed[0];
  const forYou = feed.slice(trending ? 1 : 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 120) loadMore();
        }}
        scrollEventThrottle={400}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.text }]}>Hi, {firstName}</Text>
            <Text style={[styles.tagline, { color: colors.textSecondary }]}>Keep building skills today.</Text>
          </View>
          <View style={styles.pills}>
            <View style={[styles.pill, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="flame" size={16} color={colors.streak} />
              <Text style={[styles.pillText, { color: colors.text }]}>{user?.dayStreak || 0}</Text>
            </View>
            <View style={[styles.pill, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="flash" size={16} color={colors.xp} />
              <Text style={[styles.pillText, { color: colors.text }]}>{user?.xp || 0} XP</Text>
            </View>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <TouchableOpacity
            style={[styles.chip, { backgroundColor: colors.card, borderColor: colors.border }, !selectedCategory && { backgroundColor: colors.primary, borderColor: colors.primary }]}
            onPress={() => loadCategory(null)}
          >
            <Text style={[styles.chipText, { color: colors.textSecondary }, !selectedCategory && { color: '#000000' }]}>All</Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat._id}
              style={[styles.chip, { backgroundColor: colors.card, borderColor: colors.border }, selectedCategory === cat._id && { backgroundColor: colors.primary, borderColor: colors.primary }]}
              onPress={() => loadCategory(cat._id)}
            >
              <Ionicons
                name={getCategoryIcon(cat.title)}
                size={16}
                color={selectedCategory === cat._id ? '#000' : colors.textSecondary}
                style={styles.chipIcon}
              />
              <Text style={[styles.chipText, { color: colors.textSecondary }, selectedCategory === cat._id && { color: '#000000' }]}>
                {cat.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading && feed.length === 0 ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            {trending && !selectedCategory && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>🔥 Trending now</Text>
                <TouchableOpacity style={[styles.featured, { backgroundColor: colors.card }]} onPress={() => openVideo(trending)} activeOpacity={0.9}>
                  <Image source={{ uri: trending.thumbnail }} style={styles.featuredImage} />
                  <View style={styles.featuredOverlay}>
                    <Text style={[styles.featuredTag, { color: colors.primary }]}>{trending.category?.title || 'Featured'}</Text>
                    <Text style={styles.featuredTitle} numberOfLines={2}>{trending.title}</Text>
                    <Text style={styles.featuredMeta}>{trending.creator?.displayName || 'Creator'}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>For you</Text>
              {forYou.map((video) => (
                <CourseCard key={video._id} video={video} onPress={() => openVideo(video)} />
              ))}
              {!forYou.length && !trending && (
                <Text style={[styles.empty, { color: colors.textSecondary }]}>No videos yet. Check back soon!</Text>
              )}
            </View>
          </>
        )}

        {loadingMore && <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  greeting: { fontSize: 26, fontWeight: '800' },
  tagline: { fontSize: 14, marginTop: 4 },
  pills: { flexDirection: 'row', gap: 8 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillText: { fontSize: 13, fontWeight: '600' },
  chips: { paddingHorizontal: 20, paddingBottom: 8, gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    marginRight: 8,
  },
  chipIcon: { marginRight: 6 },
  chipText: { fontWeight: '600', fontSize: 14 },
  chipTextActive: { fontWeight: '700' },
  section: { paddingHorizontal: 20, marginTop: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '800', marginBottom: 14 },
  featured: {
    borderRadius: 18,
    overflow: 'hidden',
    height: 180,
  },
  featuredImage: { width: '100%', height: '100%' },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  featuredTag: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  featuredTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  featuredMeta: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 },
  empty: { textAlign: 'center', paddingVertical: 24 },
});
