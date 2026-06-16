import React, { useState } from 'react';
import {
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../store/authSlice';
import { Button, IconInput } from '../components/UI';
import GoogleSignInButton from '../components/GoogleSignInButton';
import { COLORS } from '../utils/constants';

export default function RegisterScreen({ navigation }) {
  const dispatch = useDispatch();
  const { error, successMessage } = useSelector((s) => s.auth);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleRegister = async () => {
    setLocalError('');
    dispatch(clearError());

    if (!name.trim()) {
      setLocalError('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setLocalError('Please enter your email.');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const result = await dispatch(registerUser({ name, email, password }));
    setLoading(false);
    if (registerUser.fulfilled.match(result)) {
      navigation.navigate('OTP', { email: result.payload.email });
    }
  };

  const displayError = localError || error;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.rocket}>🚀</Text>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Start learning skills that pay</Text>

          {displayError ? <Text style={styles.error}>{displayError}</Text> : null}
          {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}

          <IconInput icon="person-outline" placeholder="Full name" value={name} onChangeText={setName} />
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
            placeholder="Password (min 6 chars)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Button title="Create account" onPress={handleRegister} loading={loading} style={styles.primaryBtn} />
          <GoogleSignInButton loading={loading} />

          <TouchableOpacity style={styles.footer} onPress={() => navigation.goBack()}>
            <Text style={styles.footerText}>
              Have an account? <Text style={styles.footerLink}>Log in</Text>
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
  error: { color: COLORS.error, marginBottom: 12, lineHeight: 22 },
  success: { color: COLORS.success, marginBottom: 12, lineHeight: 22 },
  primaryBtn: { marginTop: 8 },
  footer: { alignItems: 'center', marginTop: 28 },
  footerText: { color: COLORS.textSecondary, fontSize: 15 },
  footerLink: { color: COLORS.primary, fontWeight: '700' },
});
