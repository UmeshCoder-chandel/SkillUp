import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './UI';
import { COLORS } from '../utils/constants';
import { googleLogin, clearError, setAuthError } from '../store/authSlice';
import {
  getGoogleIdTokenFromResponse,
  isGoogleAuthConfigured,
  useGoogleAuthRequest,
} from '../services/googleAuth';

export default function GoogleSignInButton({ loading }) {
  const dispatch = useDispatch();
  const configured = isGoogleAuthConfigured();
  const [request, response, promptAsync] = configured ? useGoogleAuthRequest() : [null, null, () => Promise.resolve()];
  const [googleLoading, setGoogleLoading] = useState(false);

  // Handle auth response when it changes
  useEffect(() => {
    const handleAuthResponse = async () => {
      if (!response) return;

      console.log('[GoogleSignInButton] Auth response received:', JSON.stringify(response, null, 2));

      try {
        if (response?.type === 'dismiss' || response?.type === 'cancel') {
          console.log('[GoogleSignInButton] User cancelled/dismissed login');
          return;
        }
        
        if (response?.type === 'success') {
          console.log('[GoogleSignInButton] Google auth successful!');
          const idToken = await getGoogleIdTokenFromResponse(response);
          console.log('[GoogleSignInButton] Got idToken, sending to backend...');
          const loginResult = await dispatch(googleLogin(idToken)).unwrap();
          console.log('[GoogleSignInButton] Login successful!', loginResult);
        } else if (response?.type === 'error') {
          console.error('[GoogleSignInButton] Google auth error:', response.error);
          dispatch(setAuthError(response.error?.message || 'Google sign-in failed'));
        }
      } catch (error) {
        console.error('[GoogleSignInButton] Error handling auth response:', error);
        const errorMessage = typeof error === 'string' 
          ? error 
          : error.message || 'Google sign-in failed';
        dispatch(setAuthError(errorMessage));
      } finally {
        setGoogleLoading(false);
      }
    };

    handleAuthResponse();
  }, [response, dispatch]);

  const handlePress = async () => {
    console.log('[GoogleSignInButton] handlePress called');
    
    if (!configured) {
      console.warn('[GoogleSignInButton] Google auth not configured');
      dispatch(setAuthError('Google authentication is not configured. Please use email/password login.'));
      return;
    }

    if (!promptAsync) {
      console.error('[GoogleSignInButton] promptAsync function not available');
      dispatch(setAuthError('Google authentication is not available.'));
      return;
    }

    if (googleLoading || loading) {
      console.log('[GoogleSignInButton] Already loading, ignoring press');
      return;
    }

    console.log('[GoogleSignInButton] Starting Google auth prompt...');
    dispatch(clearError());
    setGoogleLoading(true);
    
    try {
      console.log('[GoogleSignInButton] Calling promptAsync...');
      await promptAsync({
        useProxy: true,
      });
    } catch (error) {
      console.error('[GoogleSignInButton] Error during Google login prompt:', error);
      const errorMessage = typeof error === 'string' 
        ? error 
        : error.message || 'Google sign-in failed';
      
      if (!errorMessage.includes('cancelled') && !errorMessage.includes('dismissed')) {
        dispatch(setAuthError(errorMessage));
      }
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
