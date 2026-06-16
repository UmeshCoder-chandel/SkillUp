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
import { forgotPassword, clearError, clearSuccess } from '../store/authSlice';
import { Button, IconInput } from '../components/UI';
import { COLORS } from '../utils/constants';

export default function ForgotPasswordScreen({ navigation }) {
  const dispatch = useDispatch();
  const { error, successMessage, resetEmail } = useSelector((s) => s.auth);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    dispatch(clearError());
    dispatch(clearSuccess());
    const result = await dispatch(forgotPassword({ email }));
    setLoading(false);
    if (forgotPassword.fulfilled.match(result)) {
      navigation.navigate('ResetPassword', { email });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.icon}>🔑</Text>
          <Text style={styles.title}>Forgot password?</Text>
          <Text style={styles.subtitle}>
            Enter your email and we&apos;ll send you a 6-digit reset code.
          </Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}

          <IconInput
            icon="mail-outline"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Button title="Send reset code" onPress={handleSubmit} loading={loading} style={styles.primaryBtn} />

          {resetEmail ? (
            <TouchableOpacity onPress={() => navigation.navigate('ResetPassword', { email: resetEmail })}>
              <Text style={styles.link}>Already have a code? Reset password</Text>
            </TouchableOpacity>
          ) : null}
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
  icon: { fontSize: 36, marginBottom: 20 },
  title: { fontSize: 32, fontWeight: '800', color: COLORS.text },
  subtitle: { color: COLORS.textSecondary, fontSize: 16, marginTop: 8, marginBottom: 32, lineHeight: 24 },
  error: { color: COLORS.error, marginBottom: 12, textAlign: 'center' },
  success: { color: COLORS.success, marginBottom: 12, textAlign: 'center', lineHeight: 22 },
  primaryBtn: { marginTop: 8 },
  link: { color: COLORS.primary, textAlign: 'center', marginTop: 20, fontWeight: '600' },
});
