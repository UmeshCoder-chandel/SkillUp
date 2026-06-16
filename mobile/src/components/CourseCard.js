import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, formatCount, formatDuration } from '../utils/constants';

export default function CourseCard({ video, onPress, compact }) {
  const creator = video.creator?.displayName || 'Creator';
  const duration = formatDuration(video.duration);
  const views = formatCount(video.views);
  const rating = video.rating || (4 + (video.views % 10) / 10).toFixed(1);

  if (compact) {
    return (
      <TouchableOpacity style={styles.compactCard} onPress={onPress} activeOpacity={0.85}>
        <Image source={{ uri: video.thumbnail }} style={styles.compactThumb} />
        <View style={styles.compactBody}>
          <Text style={styles.compactTitle} numberOfLines={2}>{video.title}</Text>
          <Text style={styles.compactMeta}>{creator} • {duration}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <Image source={{ uri: video.thumbnail }} style={styles.thumb} />
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{video.title}</Text>
        <Text style={styles.creator}>{creator}</Text>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={13} color={COLORS.textSecondary} />
            <Text style={styles.metaText}>{duration}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="star" size={13} color={COLORS.primary} />
            <Text style={styles.metaText}>{rating}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={13} color={COLORS.textSecondary} />
            <Text style={styles.metaText}>{views}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  thumb: {
    width: 100,
    height: 72,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
  },
  body: { flex: 1, marginLeft: 14, justifyContent: 'center' },
  title: { color: COLORS.text, fontSize: 16, fontWeight: '700', lineHeight: 22 },
  creator: { color: COLORS.textSecondary, fontSize: 13, marginTop: 4 },
  metaRow: { flexDirection: 'row', marginTop: 8, gap: 14 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: COLORS.textSecondary, fontSize: 12 },
  compactCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  compactThumb: {
    width: 88,
    height: 60,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
  },
  compactBody: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  compactTitle: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  compactMeta: { color: COLORS.textSecondary, fontSize: 13, marginTop: 4 },
});
