import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatCount, formatDuration } from '../utils/constants';
import { useTheme } from '../context/ThemeContext';

export default function CourseCard({ video, onPress, compact }) {
  const { colors } = useTheme();
  const creator = video.creator?.displayName || 'Creator';
  const duration = formatDuration(video.duration);
  const views = formatCount(video.views);
  const rating = video.rating || (4 + (video.views % 10) / 10).toFixed(1);

  if (compact) {
    return (
      <TouchableOpacity style={[styles.compactCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={onPress} activeOpacity={0.85}>
        <Image source={{ uri: video.thumbnail }} style={[styles.compactThumb, { backgroundColor: colors.surface }]} />
        <View style={styles.compactBody}>
          <Text style={[styles.compactTitle, { color: colors.text }]} numberOfLines={2}>{video.title}</Text>
          <Text style={[styles.compactMeta, { color: colors.textSecondary }]}>{creator} • {duration}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={onPress} activeOpacity={0.85}>
      <Image source={{ uri: video.thumbnail }} style={[styles.thumb, { backgroundColor: colors.surface }]} />
      <View style={styles.body}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>{video.title}</Text>
        <Text style={[styles.creator, { color: colors.textSecondary }]}>{creator}</Text>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={13} color={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>{duration}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="star" size={13} color={colors.primary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>{rating}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={13} color={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>{views}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  thumb: {
    width: 100,
    height: 72,
    borderRadius: 12,
  },
  body: { flex: 1, marginLeft: 14, justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '700', lineHeight: 22 },
  creator: { fontSize: 13, marginTop: 4 },
  metaRow: { flexDirection: 'row', marginTop: 8, gap: 14 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12 },
  compactCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  compactThumb: {
    width: 88,
    height: 60,
    borderRadius: 10,
  },
  compactBody: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  compactTitle: { fontSize: 15, fontWeight: '700' },
  compactMeta: { fontSize: 13, marginTop: 4 },
});
