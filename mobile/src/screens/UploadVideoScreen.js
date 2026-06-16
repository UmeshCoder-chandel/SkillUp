import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Video } from 'expo-av';
import api from '../services/api';
import { Button, IconInput, ScreenHeader } from '../components/UI';
import { formatCount } from '../utils/constants';
import { useTheme as useAppTheme } from '../context/ThemeContext';

export default function UploadVideoScreen({ navigation }) {
  const { colors, isDark } = useAppTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [videoUri, setVideoUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data.data || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const pickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'We need access to your media library to upload videos'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setVideoUri(result.assets[0].uri);
    }
  };

  const handleUpload = async () => {
    if (!title || !category || !videoUri) {
      Alert.alert('Missing Information', 'Please fill all fields and select a video');
      return;
    }

    try {
      setLoading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);

      // Better file handling
      const uri = videoUri;
      let fileType = 'mp4';
      let type = 'video/mp4';
      
      // Try to get extension from uri
      const uriMatch = uri.match(/\.([a-zA-Z0-9]+)(\?|$)/);
      if (uriMatch) {
        fileType = uriMatch[1].toLowerCase();
        type = `video/${fileType}`;
      }

      formData.append('video', {
        uri,
        name: `video_${Date.now()}.${fileType}`,
        type,
      });

      await api.post('/creators/videos', formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total > 0) {
            setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
          }
        },
      });

      Alert.alert('Success', 'Video uploaded successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Upload failed:', error);
      Alert.alert('Error', error?.response?.data?.message || 'Failed to upload video');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Upload Video
            </Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.mediaSection}>
            <TouchableOpacity onPress={pickVideo} style={styles.mediaBox}>
              {videoUri ? (
                <Video
                  source={{ uri: videoUri }}
                  style={styles.mediaImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.mediaPlaceholder}>
                  <Ionicons name="videocam-outline" size={40} color={colors.textSecondary} />
                  <Text style={[styles.mediaText, { color: colors.textSecondary }]}>
                    Select Video
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <IconInput
              icon="create-outline"
              label="Title"
              placeholder="Enter video title"
              value={title}
              onChangeText={setTitle}
            />
            <IconInput
              icon="document-text-outline"
              label="Description"
              placeholder="Enter video description"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              style={{ height: 100, textAlignVertical: 'top' }}
            />

            <Text style={[styles.categoryLabel, { color: colors.text }]}>
              Category
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryOptions}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat._id}
                  style={[
                    styles.categoryOption, { backgroundColor: colors.card, borderColor: colors.border },
                    category === cat._id && { backgroundColor: colors.primary + '20', borderColor: colors.primary },
                  ]}
                  onPress={() => setCategory(cat._id)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      { color: category === cat._id ? colors.primary : colors.text }
                    ]}
                  >
                    {cat.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <Button
            title={loading ? `Uploading ${uploadProgress}%` : 'Upload Video'}
            onPress={handleUpload}
            loading={loading}
            disabled={loading || !videoUri || !title || !category}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, paddingBottom: 16 },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '800' },
  mediaSection: { marginBottom: 28 },
  mediaBox: { aspectRatio: 16/9, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  mediaImage: { width: '100%', height: '100%' },
  mediaPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  mediaText: { fontSize: 16 },
  form: { gap: 16 },
  categoryLabel: { fontSize: 15, fontWeight: '600' },
  categoryOptions: { flexDirection: 'row', gap: 8, marginVertical: 4 },
  categoryOption: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
});
