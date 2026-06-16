import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '../store/categorySlice';
import { COLORS } from '../utils/constants';
import { Ionicons } from '@expo/vector-icons';

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
  const { list, loading } = useSelector((s) => s.categories);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Skill Categories</Text>
      <FlatList
        data={list}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('CategoryVideos', { category: item })}
          >
            <Ionicons name={categoryIcons[item.title] || 'book-outline'} size={32} color={COLORS.primary} />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.count}>{item.videoCount || 0} videos</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { fontSize: 24, fontWeight: '700', color: COLORS.text, padding: 16, paddingTop: 50 },
  list: { padding: 8 },
  card: {
    flex: 1,
    backgroundColor: COLORS.surface,
    margin: 8,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'center',
  },
  title: { color: COLORS.text, fontWeight: '600', marginTop: 10, textAlign: 'center' },
  count: { color: COLORS.textSecondary, fontSize: 12, marginTop: 4 },
});
