import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './UI';
import { COLORS } from '../utils/constants';
import { googleLogin, clearError, setAuthError } from '../store/authSlice';
import {
  getFirebaseIdTokenFromGoogleResponse,
  isGoogleAuthConfigured,
  useGoogleAuthRequest,
} from '../services/googleAuth';

export default function GoogleSignInButton({ loading }) {
  const dispatch = useDispatch();
  const [request, response, promptAsync] = useGoogleAuthRequest();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const configured = isGoogleAuthConfigured();

  useEffect(() => {
    if (!response) return;

    (async () => {
      setGoogleLoading(true);
      dispatch(clearError());
      try {
        const idToken = await getFirebaseIdTokenFromGoogleResponse(response);
        await dispatch(googleLogin(idToken)).unwrap();
      } catch (err) {
        dispatch(setAuthError(typeof err === 'string' ? err : err.message || 'Google sign-in failed'));
      } finally {
        setGoogleLoading(false);
        setSessionActive(false);
      }
    })();
  }, [dispatch, response]);

  const handlePress = async () => {
    if (!configured) {
      dispatch(setAuthError('Add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to mobile/.env from Firebase Console'));
      return;
    }

    if (sessionActive || googleLoading || loading) return;

    dispatch(clearError());
    setSessionActive(true);
    try {
      await promptAsync();
    } catch (err) {
      console.warn('Google auth prompt error:', err);
      setSessionActive(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>
      <Button
        title="Continue with Google"
        onPress={handlePress}
        loading={loading || googleLoading}
        disabled={!request && configured}
        variant="outline"
        style={styles.button}
        icon={<Ionicons name="logo-google" size={18} color={COLORS.primary} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 8 },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    color: COLORS.textSecondary,
    marginHorizontal: 12,
    fontSize: 14,
  },
  button: {
    flexDirection: 'row',
    gap: 8,
  },
});
