import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '../store/categorySlice';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const categoryIcons = {
  'Web Development': 'globe-outline',
  React: 'logo-react',
  'Node.js': 'server-outline',
  JavaScript: 'logo-javascript',
  MongoDB: 'leaf-outline',
  Java: 'cafe-outline',
  Python: 'logo-python',
  'Data Science': 'analytics-outline',
  AI: 'hardware-chip-outline',
  DevOps: 'cloud-outline',
  'Mobile Development': 'phone-portrait-outline',
};

export default function CategoriesScreen({ navigation }) {
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const { list, loading } = useSelector((s) => s.categories);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchCategories());
    setRefreshing(false);
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Text style={[styles.header, { color: colors.text }]}>Skill Categories</Text>
      <FlatList
        data={list}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.surface }]}
            onPress={() => navigation.navigate('CategoryVideos', { category: item })}
          >
            <Ionicons name={categoryIcons[item.title] || 'book-outline'} size={32} color={colors.primary} />
            <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.count, { color: colors.textSecondary }]}>{item.videoCount || 0} videos</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { fontSize: 24, fontWeight: '700', padding: 16, paddingTop: 16 },
  list: { padding: 8 },
  card: {
    flex: 1,
    margin: 8,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'center',
  },
  title: { fontWeight: '600', marginTop: 10, textAlign: 'center' },
  count: { fontSize: 12, marginTop: 4 },
});
