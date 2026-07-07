import React, { useState } from 'react';
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
import { loginUser, clearError } from '../store/authSlice';
import { Button, IconInput } from '../components/UI';
import GoogleSignInButton from '../components/GoogleSignInButton';
import { COLORS } from '../utils/constants';

export default function LoginScreen({ navigation }) {
  const dispatch = useDispatch();
  const { error, needsVerification, unverifiedEmail } = useSelector((s) => s.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleLogin = async () => {
    setLocalError('');
    dispatch(clearError());

    if (!email.trim() || !password) {
      setLocalError('Please enter your email and password.');
      return;
    }

    setSubmitting(true);
    const result = await dispatch(loginUser({ email, password }));
    setSubmitting(false);

    if (loginUser.rejected.match(result) && result.payload?.needsVerification) {
      navigation.navigate('OTP', { email: result.payload.email });
    }
  };

  const displayError = localError || error;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.rocket}>🚀</Text>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Log in to keep your streak alive</Text>

          {displayError ? <Text style={styles.error}>{displayError}</Text> : null}

          {needsVerification ? (
            <TouchableOpacity
              style={styles.verifyBanner}
              onPress={() => navigation.navigate('OTP', { email: unverifiedEmail || email })}
            >
              <Text style={styles.verifyBannerText}>Verify your email with OTP →</Text>
            </TouchableOpacity>
          ) : null}

          <IconInput
            icon="mail-outline"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <IconInput
            icon="lock-closed-outline"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.forgotWrap}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotLink}>Forgot password?</Text>
          </TouchableOpacity>

          <Button title="Log In" onPress={handleLogin} loading={submitting} style={styles.primaryBtn} />
          <GoogleSignInButton loading={submitting} />

          <TouchableOpacity style={styles.footer} onPress={() => navigation.navigate('Register')}>
            <Text style={styles.footerText}>
              New here? <Text style={styles.footerLink}>Create account</Text>
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
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 40, paddingBottom: 32 },
  rocket: { fontSize: 36, marginBottom: 20 },
  title: { fontSize: 32, fontWeight: '800', color: COLORS.text, letterSpacing: -0.5 },
  subtitle: { color: COLORS.textSecondary, fontSize: 16, marginTop: 8, marginBottom: 32 },
  error: { color: COLORS.error, marginBottom: 12, textAlign: 'center', lineHeight: 22 },
  verifyBanner: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  verifyBannerText: { color: COLORS.primary, fontWeight: '700', textAlign: 'center' },
  primaryBtn: { marginTop: 8 },
  forgotWrap: { alignSelf: 'flex-end', marginBottom: 8, marginTop: -4 },
  forgotLink: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
  footer: { alignItems: 'center', marginTop: 28 },
  footerText: { color: COLORS.textSecondary, fontSize: 15 },
  footerLink: { color: COLORS.primary, fontWeight: '700' },
  otpLink: { color: COLORS.textSecondary, textAlign: 'center', marginTop: 16, fontSize: 14 },
  apiHint: { color: COLORS.border, textAlign: 'center', marginTop: 20, fontSize: 11 },
});
