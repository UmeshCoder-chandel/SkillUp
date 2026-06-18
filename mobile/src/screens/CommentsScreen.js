import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function CommentsScreen({ route, navigation }) {
  const { videoId } = route.params;
  const { colors } = useTheme();
  const { user } = useSelector(s => s.auth);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);

  const fetchComments = async () => {
    try {
      const { data } = await api.get(`/videos/${videoId}/comments`);
      setComments(data.data);
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  const postComment = async () => {
    if (!text.trim()) return;
    setPosting(true);
    try {
      const { data } = await api.post(`/videos/${videoId}/comments`, { text: text.trim() });
      setComments(prev => [data.data, ...prev]);
      setText('');
    } catch {
      //
    } finally {
      setPosting(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [videoId]);

  const renderComment = ({ item }) => (
    <View style={[styles.commentItem, { borderBottomColor: colors.border }]}>
      {item.user?.avatar ? (
        <Image source={{ uri: item.user.avatar }} style={styles.commentAvatar} />
      ) : (
        <View style={[styles.commentAvatar, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.commentAvatarText, { color: '#fff' }]}>
            {item.user?.name?.[0]?.toUpperCase() || '?'}
          </Text>
        </View>
      )}
      <View style={styles.commentContent}>
        <Text style={[styles.commentUser, { color: colors.text }]}>
          {item.user?.name || 'User'}
        </Text>
        <Text style={[styles.commentText, { color: colors.text }]}>
          {item.text}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          Comments
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={comments}
          keyExtractor={(item) => item._id}
          renderItem={renderComment}
          contentContainerStyle={styles.commentsList}
        />
      )}

      <View style={[styles.inputContainer, { borderTopColor: colors.border }]}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
          placeholder="Add a comment..."
          placeholderTextColor={colors.textSecondary}
          value={text}
          onChangeText={setText}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendBtn, { backgroundColor: colors.primary }]}
          onPress={postComment}
          disabled={posting}
        >
          {posting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: { fontSize: 18, fontWeight: '700' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  commentsList: { paddingBottom: 80 },
  commentItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 0.5,
    gap: 12,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAvatarText: { fontSize: 14, fontWeight: '700' },
  commentContent: { flex: 1 },
  commentUser: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  commentText: { fontSize: 14 },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    alignItems: 'flex-end',
    gap: 10,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
