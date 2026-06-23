import React, { useState, useEffect, useRef } from 'react';
import {
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { verifyOTP, resendOTP, clearError, clearSuccess } from '../store/authSlice';
import { Button, IconInput } from '../components/UI';
import { COLORS } from '../utils/constants';

export default function OTPScreen({ route, navigation }) {
  const dispatch = useDispatch();
  const { error, pendingEmail, successMessage, isAuthenticated } = useSelector((s) => s.auth);
  const [email, setEmail] = useState(route.params?.email || pendingEmail || '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [localError, setLocalError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const cooldownTimerRef = useRef(null);

  // Navigate when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    }
  }, [isAuthenticated, navigation]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      cooldownTimerRef.current = setTimeout(() => {
        setCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
      }
    };
  }, [cooldown]);

  const handleVerify = async () => {
    setLocalError('');
    dispatch(clearError());

    if (!email.trim()) {
      setLocalError('Please enter your email.');
      return;
    }
    if (otp.trim().length !== 6) {
      setLocalError('Please enter the 6-digit OTP.');
      return;
    }

    setLoading(true);
    await dispatch(verifyOTP({ email, otp }));
    setLoading(false);
  };

  const handleResend = async () => {
    if (!email.trim()) {
      setLocalError('Enter your email first.');
      return;
    }
    if (cooldown > 0) {
      return;
    }
    setResending(true);
    dispatch(clearError());
    dispatch(clearSuccess());
    await dispatch(resendOTP({ email }));
    setResending(false);
    setCooldown(60); // 60 second cooldown
  };

  const displayError = localError || error;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.rocket}>✉️</Text>
          <Text style={styles.title}>Verify Email</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to your email. Check spam if you don&apos;t see it.
          </Text>

          {displayError ? <Text style={styles.error}>{displayError}</Text> : null}
          {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}

          <IconInput
            icon="mail-outline"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <IconInput
            icon="key-outline"
            placeholder="OTP code"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
          />

          <Button title="Verify OTP" onPress={handleVerify} loading={loading} style={{ marginTop: 8 }} />

          <TouchableOpacity onPress={handleResend} disabled={resending || cooldown > 0}>
            <Text style={[styles.resend, (resending || cooldown > 0) && styles.resendDisabled]}>
              {resending ? 'Sending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32 },
  back: { color: COLORS.primary, fontSize: 16, fontWeight: '600', marginBottom: 24 },
  rocket: { fontSize: 36, marginBottom: 20 },
  title: { fontSize: 32, fontWeight: '800', color: COLORS.text },
  subtitle: { color: COLORS.textSecondary, fontSize: 16, marginTop: 8, marginBottom: 32, lineHeight: 24 },
  error: { color: COLORS.error, marginBottom: 12, lineHeight: 22 },
  success: { color: COLORS.success, marginBottom: 12, lineHeight: 22 },
  resend: { color: COLORS.primary, textAlign: 'center', marginTop: 20, fontWeight: '600', fontSize: 15 },
  resendDisabled: { color: COLORS.textSecondary, opacity: 0.5 },
});
