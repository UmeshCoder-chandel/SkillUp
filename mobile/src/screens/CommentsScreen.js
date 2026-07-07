import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function CommentsScreen({ route, navigation }) {
  const { videoId, onCommentCountUpdate } = route.params;
  const { colors } = useTheme();
  const { user } = useSelector(s => s.auth);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchComments = useCallback(async (pageNum = 1, shouldReset = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);
      
      const { data } = await api.get(`/videos/${videoId}/comments`, { 
        params: { page: pageNum, limit: 20 } 
      });
      
      if (shouldReset) {
        setComments(data.data);
      } else {
        setComments(prev => [...prev, ...data.data]);
      }
      
      setHasMore(pageNum < data.pagination.pages);
      setPage(pageNum);
      
      // Update comment count if callback provided
      if (onCommentCountUpdate) {
        onCommentCountUpdate(data.pagination.total);
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [videoId, onCommentCountUpdate]);

  const postComment = async () => {
    if (!text.trim()) return;
    setPosting(true);
    try {
      const { data } = await api.post(`/videos/${videoId}/comments`, { text: text.trim() });
      setComments(prev => [data.data, ...prev]);
      setText('');
      
      // Update comment count
      if (onCommentCountUpdate) {
        onCommentCountUpdate(data.commentCount);
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setPosting(false);
    }
  };

  const deleteComment = async (commentId) => {
    try {
      const { data } = await api.delete(`/videos/${videoId}/comments/${commentId}`);
      setComments(prev => prev.filter(c => c._id !== commentId));
      
      // Update comment count
      if (onCommentCountUpdate) {
        onCommentCountUpdate(data.commentCount);
      }
    } catch (err) {
      console.error('Failed to delete comment:', err);
      Alert.alert('Error', 'Failed to delete comment');
    }
  };

  const updateComment = async () => {
    if (!editText.trim() || !editingComment) return;
    setSavingEdit(true);
    try {
      const { data } = await api.put(
        `/videos/${videoId}/comments/${editingComment._id}`,
        { text: editText.trim() }
      );
      setComments(prev => 
        prev.map(c => c._id === editingComment._id ? data.data : c)
      );
      setEditingComment(null);
      setEditText('');
    } catch (err) {
      console.error('Failed to update comment:', err);
      Alert.alert('Error', 'Failed to update comment');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchComments(page + 1);
    }
  };

  const confirmDelete = (comment) => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteComment(comment._id) },
      ]
    );
  };

  useEffect(() => {
    fetchComments(1, true);
  }, [fetchComments]);

  const renderComment = ({ item }) => {
    const isOwnComment = user?._id === item.user?._id;
    const isEditing = editingComment?._id === item._id;
    
    return (
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
          
          {isEditing ? (
            <View style={styles.editContainer}>
              <TextInput
                style={[styles.editInput, { backgroundColor: colors.card, color: colors.text }]}
                value={editText}
                onChangeText={setEditText}
                multiline
                autoFocus
              />
              <View style={styles.editActions}>
                <TouchableOpacity onPress={() => { setEditingComment(null); setEditText(''); }}>
                  <Text style={{ color: colors.textSecondary }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.saveEditBtn, { backgroundColor: colors.primary }]}
                  onPress={updateComment}
                  disabled={savingEdit}
                >
                  {savingEdit ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={{ color: '#fff' }}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <Text style={[styles.commentText, { color: colors.text }]}>
              {item.text}
            </Text>
          )}
        </View>
        
        {isOwnComment && !isEditing && (
          <View style={styles.commentActions}>
            <TouchableOpacity onPress={() => { setEditingComment(item); setEditText(item.text); }}>
              <Ionicons name="create-outline" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => confirmDelete(item)}>
              <Ionicons name="trash-outline" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const ListFooterComponent = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

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
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={ListFooterComponent}
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
    alignItems: 'flex-start',
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
  commentActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editContainer: {
    width: '100%',
  },
  editInput: {
    borderRadius: 12,
    padding: 8,
    marginTop: 4,
    fontSize: 14,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginTop: 8,
  },
  saveEditBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
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
  footerLoader: {
    paddingVertical: 16,
  },
});
