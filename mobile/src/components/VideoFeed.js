import React, { useRef, useState, useCallback, memo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Share,
  Image,
  StatusBar,
  GestureResponderEvent,
} from 'react-native';
import { Video } from 'expo-av';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { formatCount } from '../utils/constants';
import { likeVideo, saveVideo } from '../store/videoSlice';
import api from '../services/api';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

// Extracted Component: ProfileInfo
const ProfileInfo = memo(({ creator, colors, isFollowing, onFollow }) => (
  <View style={styles.creatorRow}>
    {creator?.avatar ? (
      <Image source={{ uri: creator.avatar }} style={styles.avatar} />
    ) : (
      <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
        <Text style={styles.avatarText}>
          {creator?.displayName?.charAt(0).toUpperCase() || '?'}
        </Text>
      </View>
    )}
    <View style={styles.creatorMeta}>
      <Text style={[styles.creatorName, { color: '#fff' }]}>
        {creator?.displayName || 'Creator'}
      </Text>
      <Text style={[styles.creatorBio, { color: 'rgba(255,255,255,0.8)' }]}>
        AI Automation Expert
      </Text>
    </View>
    {!isFollowing && (
      <TouchableOpacity 
        style={[styles.followBtn, { borderColor: 'rgba(255,255,255,0.4)' }]} 
        onPress={onFollow}
        accessibilityLabel="Follow creator"
      >
        <Text style={[styles.followText, { color: '#fff' }]}>Follow</Text>
      </TouchableOpacity>
    )}
  </View>
));

// Extracted Component: VideoDescription
const VideoDescription = memo(({ title, description, colors }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.descriptionContainer}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {description ? (
        <View>
          <Text 
            style={[styles.description, { color: colors.text }]} 
            numberOfLines={expanded ? undefined : 2}
          >
            {description}
          </Text>
          <TouchableOpacity onPress={() => setExpanded(!expanded)}>
            <Text style={[styles.seeMore, { color: colors.text }]}>
              {expanded ? ' less' : ' more'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
});

// Extracted Component: HashtagList
const HashtagList = memo(({ category, colors }) => {
  const tags = ['#AI', '#Automation', '#Growth'];
  if (category?.title) tags.push(`#${category.title}`);

  return (
    <Text style={[styles.hashtags, { color: colors.text }]}>
      {tags.join(' ')}
    </Text>
  );
});

// Extracted Component: ActionButtons
const ActionButtons = memo(({ item, saved, commentCount, onLike, onSave, onShare, onComment, colors, isDark }) => {
  const likeCount = item.likeCount || item.likes?.length || 0;

  return (
    <View style={styles.actions}>
      {/* Like */}
      <TouchableOpacity 
        style={styles.actionBtn} 
        onPress={onLike} 
        activeOpacity={0.7}
        accessibilityLabel="Like video"
      >
        <Ionicons 
          name={item.isLiked ? 'heart' : 'heart-outline'} 
          size={30} 
          color={item.isLiked ? '#EF4444' : '#fff'} 
        />
        <Text style={[styles.actionText, { color: '#fff' }]}>
          {formatCount(likeCount)}
        </Text>
      </TouchableOpacity>

      {/* Comment */}
      <TouchableOpacity 
        style={styles.actionBtn} 
        activeOpacity={0.7}
        accessibilityLabel="View comments"
        onPress={onComment}
      >
        <Ionicons name="chatbubble-outline" size={30} color="#fff" />
        <Text style={[styles.actionText, { color: '#fff' }]}>
          {formatCount(commentCount)}
        </Text>
      </TouchableOpacity>

      {/* Save */}
      <TouchableOpacity 
        style={styles.actionBtn} 
        onPress={onSave} 
        activeOpacity={0.7}
        accessibilityLabel="Save video"
      >
        <Ionicons 
          name={saved ? 'bookmark' : 'bookmark-outline'} 
          size={30} 
          color={saved ? colors.primary : '#fff'} 
        />
      </TouchableOpacity>

      {/* Share */}
      <TouchableOpacity 
        style={styles.actionBtn} 
        onPress={onShare} 
        activeOpacity={0.7}
        accessibilityLabel="Share video"
      >
        <Ionicons name="share-outline" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
});

const VideoItem = memo(({ item, isActive, onFollow }) => {
  const { colors, isDark } = useTheme();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const videoRef = useRef(null);
  const [status, setStatus] = useState({});
  const [saved, setSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [doubleTapTimer, setDoubleTapTimer] = useState(null);
  const [commentCount, setCommentCount] = useState(0);

  React.useEffect(() => {
    setStatus(prev => ({ ...prev, shouldPlay: isActive }));
    if (isActive) {
      api.post('/users/watch-history', { videoId: item._id, progress: 0 }).catch(() => {});
    }
  }, [isActive, item._id]);

  useEffect(() => {
    api.get(`/videos/${item._id}/comments`).then(({ data }) => {
      if (data.pagination?.total !== undefined) {
        setCommentCount(data.pagination.total);
      }
    }).catch(() => {});
  }, [item._id]);

  const handleLike = () => dispatch(likeVideo(item._id));
  
  const handleSave = async () => {
    const result = await dispatch(saveVideo(item._id));
    if (saveVideo.fulfilled.match(result)) setSaved(result.payload.saved);
  };

  const handleShare = async () => {
    try {
      const { data } = await api.get(`/videos/${item._id}/share`);
      await Share.share({ message: `${data.data.title}\n${data.data.shareUrl}`, title: data.data.title });
    } catch {
      await Share.share({ message: item.title });
    }
  };

  const handleComment = () => {
    navigation.navigate('Comments', { videoId: item._id });
  };

  const togglePlay = async () => {
    if (videoRef.current) {
      if (status.isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
    }
  };

  const handleTap = (event: GestureResponderEvent) => {
    if (doubleTapTimer) {
      // Double tap detected
      clearTimeout(doubleTapTimer);
      setDoubleTapTimer(null);
      handleLike();
    } else {
      // Single tap
      setDoubleTapTimer(setTimeout(() => {
        togglePlay();
        setDoubleTapTimer(null);
      }, 300));
    }
  };

  const handleLongPress = async () => {
    if (videoRef.current) {
      await videoRef.current.pauseAsync();
    }
  };

  const handleLongPressOut = async () => {
    if (videoRef.current && isActive) {
      await videoRef.current.playAsync();
    }
  };

  const progressPercent = status.durationMillis 
    ? (status.positionMillis / status.durationMillis) * 100 
    : 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <TouchableOpacity 
        activeOpacity={1} 
        onPress={handleTap}
        onLongPress={handleLongPress}
        onPressOut={handleLongPressOut}
        delayLongPress={500}
        style={styles.videoWrapper}
      >
        <Video
          ref={videoRef}
          source={{ uri: item.videoUrl }}
          style={styles.video}
          resizeMode="cover"
          isLooping
          shouldPlay={isActive}
          useNativeControls={false}
          onPlaybackStatusUpdate={setStatus}
        />
        {!status.isPlaying && (
          <View style={styles.playOverlay}>
            <Ionicons name="play-circle" size={70} color="rgba(255,255,255,0.9)" />
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progressPercent}%`, backgroundColor: '#fff' }]} />
      </View>

      <View style={styles.overlay}>
        <View style={styles.bottomInfo}>
          <ProfileInfo 
            creator={item.creator} 
            colors={colors} 
            isFollowing={isFollowing}
            onFollow={() => onFollow?.(item.creator?._id)}
          />
          <VideoDescription 
            title={item.title} 
            description={item.description} 
            colors={colors} 
          />
          <HashtagList category={item.category} colors={colors} />
        </View>

        <ActionButtons 
          item={item} 
          saved={saved}
          commentCount={commentCount}
          onLike={handleLike}
          onSave={handleSave}
          onShare={handleShare}
          onComment={handleComment}
          colors={colors}
          isDark={isDark}
        />
      </View>
    </View>
  );
});

export default function VideoFeed({ videos, onEndReached, onFollow }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index || 0);
    }
  }, []);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 80 }).current;

  return (
    <FlatList
      data={videos}
      keyExtractor={(item) => item._id}
      renderItem={({ item, index }) => (
        <VideoItem item={item} isActive={index === activeIndex} onFollow={onFollow} />
      )}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      snapToInterval={SCREEN_HEIGHT}
      snapToAlignment="start"
      decelerationRate="fast"
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      getItemLayout={(_, index) => ({ length: SCREEN_HEIGHT, offset: SCREEN_HEIGHT * index, index })}
    />
  );
}

const styles = StyleSheet.create({
  container: { height: SCREEN_HEIGHT, width: SCREEN_WIDTH, backgroundColor: '#000' },
  videoWrapper: { flex: 1 },
  video: { ...StyleSheet.absoluteFillObject },
  
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },

  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  progressBar: {
    height: '100%',
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    flexDirection: 'row',
    paddingBottom: 30,
  },

  bottomInfo: { flex: 1, padding: 16, paddingRight: 8, justifyContent: 'flex-end' },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  avatar: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '900', textAlign: 'center', lineHeight: 38 },
  creatorMeta: { flex: 1 },
  creatorName: { fontWeight: '700', fontSize: 14, marginBottom: 2, color: '#fff' },
  creatorBio: { fontSize: 11, fontWeight: '500' },
  
  followBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 16,
  },
  followText: { fontSize: 12, fontWeight: '700' },

  descriptionContainer: { marginBottom: 6 },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
    lineHeight: 18,
    color: '#fff',
  },
  description: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  seeMore: {
    fontSize: 13,
    fontWeight: '700',
  },
  
  hashtags: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },

  actions: {
    paddingBottom: 16,
    paddingRight: 12,
    alignItems: 'center',
    gap: 20,
    justifyContent: 'flex-end',
  },
  actionBtn: { alignItems: 'center', gap: 4 },
  actionText: { fontSize: 11, fontWeight: '600' },
});
