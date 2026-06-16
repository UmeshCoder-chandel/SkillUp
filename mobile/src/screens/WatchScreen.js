import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import VideoFeed from '../components/VideoFeed';
import { COLORS } from '../utils/constants';

export default function WatchScreen({ route, navigation }) {
  const { videos = [] } = route.params || {};

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.backBtn} edges={['top']}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backTouch}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
      </SafeAreaView>
      <VideoFeed videos={videos} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  backBtn: { position: 'absolute', top: 0, left: 0, zIndex: 10 },
  backTouch: { padding: 16 },
});
