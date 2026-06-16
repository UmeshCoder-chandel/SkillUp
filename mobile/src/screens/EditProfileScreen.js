import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActionSheetIOS,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';
import { Button, IconInput } from '../components/UI';
import { useTheme } from '../context/ThemeContext';
import { loadUser } from '../store/authSlice';

export default function EditProfileScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    setName(user?.name || '');
    setBio(user?.bio || '');
    setAvatar(user?.avatar || '');
  }, [user]);

  const showImagePickerOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) pickAvatar('camera');
          else if (buttonIndex === 2) pickAvatar('library');
        }
      );
    } else {
      Alert.alert(
        'Change Profile Picture',
        'Choose an option',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Take Photo', onPress: () => pickAvatar('camera') },
          { text: 'Choose from Library', onPress: () => pickAvatar('library') },
        ]
      );
    }
  };

  const pickAvatar = async (source) => {
    let permissionResult;
    if (source === 'camera') {
      permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    } else {
      permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    }

    if (permissionResult.status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'To update your profile picture, we need access to your photos or camera. Please grant permission in your device settings.',
        [{ text: 'OK' }]
      );
      return;
    }

    let result;
    if (source === 'camera') {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
    }

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setUploadProgress(0);
      const formData = new FormData();
      formData.append('name', name);
      formData.append('bio', bio);

      if (avatar && avatar !== user?.avatar) {
        const uriParts = avatar.split('.');
        const fileType = uriParts[uriParts.length - 1];
        const uri = Platform.OS === 'ios' ? avatar.replace('file://', '') : avatar;
        formData.append('avatar', {
          uri,
          name: `avatar.${fileType}`,
          type: `image/${fileType}`,
        });
      }

      await api.put('/users/profile', formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total > 0) {
            setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
          }
        },
      });

      dispatch(loadUser());
      Alert.alert('Success', 'Profile updated successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Update failed:', error);
      Alert.alert('Error', error?.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Profile</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={showImagePickerOptions} style={styles.avatarContainer}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={[styles.avatar, { borderColor: colors.primary }]} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: colors.card, borderColor: colors.primary }]}>
                  <Ionicons name="camera" size={40} color={colors.textSecondary} />
                </View>
              )}
              <View style={[styles.avatarOverlay, { backgroundColor: colors.primary, borderColor: colors.background }]}>
                <Ionicons name="camera" size={20} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <IconInput
              icon="person-outline"
              label="Full Name"
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
            />
            <IconInput
              icon="document-text-outline"
              label="Bio"
              placeholder="Tell us about yourself"
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              style={{ height: 100, textAlignVertical: 'top' }}
            />
          </View>

          <Button
            title={loading ? `Saving ${uploadProgress}%` : 'Save Changes'}
            onPress={handleSave}
            loading={loading}
            style={styles.saveButton}
          />

          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 24,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '800' },
  avatarSection: { alignItems: 'center', marginBottom: 28 },
  avatarContainer: { position: 'relative' },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  form: { gap: 16 },
  saveButton: { marginTop: 32 },
});
