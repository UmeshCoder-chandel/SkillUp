import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './UI';
import { COLORS } from '../utils/constants';
import { googleLogin, clearError, setAuthError } from '../store/authSlice';
import { useGoogleAuthRequest, getGoogleIdTokenFromResponse, isGoogleAuthConfigured } from '../services/googleAuth';

export default function GoogleSignInButton({ loading }) {
  const dispatch = useDispatch();
  const configured = isGoogleAuthConfigured();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [request, response, promptAsync] = useGoogleAuthRequest();

  useEffect(() => {
    const handleResponse = async () => {
      if (!response) return;

      console.log('[GoogleSignInButton] Received response from Google auth');
      setGoogleLoading(true);

      try {
        const idToken = await getGoogleIdTokenFromResponse(response);
        
        if (!idToken) {
          console.log('[GoogleSignInButton] No ID token returned');
          return;
        }
        
        console.log('[GoogleSignInButton] Got idToken, sending to backend...');
        const loginResult = await dispatch(googleLogin(idToken)).unwrap();
        console.log('[GoogleSignInButton] Login successful!', loginResult);
      } catch (error) {
        console.error('[GoogleSignInButton] Error during Google login:', error);
        const errorMessage = typeof error === 'string' 
          ? error 
          : error.message || 'Google sign-in failed';
        
        dispatch(setAuthError(errorMessage));
      } finally {
        console.log('[GoogleSignInButton] Flow complete, resetting states');
        setGoogleLoading(false);
      }
    };

    handleResponse();
  }, [response, dispatch]);

  const handlePress = async () => {
    console.log('[GoogleSignInButton] handlePress called');
    console.log('[GoogleSignInButton] State:', { configured, googleLoading, loading, request: !!request, requestUrl: request?.url });
    
    if (!configured) {
      console.warn('[GoogleSignInButton] Google auth not configured');
      dispatch(setAuthError('Google authentication is not configured. Please use email/password login.'));
      return;
    }

    if (googleLoading || loading) {
      console.log('[GoogleSignInButton] Already loading, ignoring press');
      return;
    }

    if (!request) {
      console.warn('[GoogleSignInButton] No Google auth request available');
      dispatch(setAuthError('Google authentication is not ready yet. Please try again.'));
      return;
    }

    console.log('[GoogleSignInButton] Starting Google auth...');
    dispatch(clearError());
    setGoogleLoading(true);
    
    try {
      console.log('[GoogleSignInButton] Calling promptAsync with useProxy:', __DEV__);
      const result = await promptAsync({ useProxy: __DEV__ });
      console.log('[GoogleSignInButton] promptAsync result:', result);
    } catch (error) {
      console.error('[GoogleSignInButton] Error starting Google auth flow:', error);
      setGoogleLoading(false);
    }
  };

  // Don't render the button at all if Google auth isn't configured
  if (!configured) {
    console.log('[GoogleSignInButton] Google auth not configured, hiding button');
    return null;
  }

  console.log('[GoogleSignInButton] Rendering Google sign-in button');
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
        disabled={!request}
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
