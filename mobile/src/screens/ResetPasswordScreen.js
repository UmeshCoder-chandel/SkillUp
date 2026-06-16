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
import { resetPassword, clearError, clearSuccess } from '../store/authSlice';
import { Button, IconInput } from '../components/UI';
import { COLORS } from '../utils/constants';

export default function ResetPasswordScreen({ navigation, route }) {
  const dispatch = useDispatch();
  const { error, successMessage } = useSelector((s) => s.auth);
  const [email, setEmail] = useState(route.params?.email || '');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    dispatch(clearError());
    dispatch(clearSuccess());
    const result = await dispatch(resetPassword({ email, otp, password }));
    setLoading(false);
    if (resetPassword.fulfilled.match(result)) {
      navigation.navigate('Login');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.icon}>🔒</Text>
          <Text style={styles.title}>Reset password</Text>
          <Text style={styles.subtitle}>Enter the 6-digit code from your email and choose a new password.</Text>

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
          <IconInput
            icon="key-outline"
            placeholder="Reset code"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
          />
          <IconInput
            icon="lock-closed-outline"
            placeholder="New password (min 6 chars)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Button title="Reset password" onPress={handleSubmit} loading={loading} style={styles.primaryBtn} />

          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.link}>Resend reset code</Text>
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
  icon: { fontSize: 36, marginBottom: 20 },
  title: { fontSize: 32, fontWeight: '800', color: COLORS.text },
  subtitle: { color: COLORS.textSecondary, fontSize: 16, marginTop: 8, marginBottom: 32, lineHeight: 24 },
  error: { color: COLORS.error, marginBottom: 12, textAlign: 'center' },
  success: { color: COLORS.success, marginBottom: 12, textAlign: 'center', lineHeight: 22 },
  primaryBtn: { marginTop: 8 },
  link: { color: COLORS.primary, textAlign: 'center', marginTop: 20, fontWeight: '600' },
});
