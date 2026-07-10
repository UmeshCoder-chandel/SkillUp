import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export const Button = ({
  title,
  onPress,
  loading,
  variant = 'primary',
  style,
  icon,
  disabled,
  textStyle,
}) => {
  const { colors } = useTheme();

  const buttonStyles = [
    styles.button,
    // Set base background first
    variant === 'primary' && { backgroundColor: colors.primary },
    variant === 'outline' && { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary },
    variant === 'ghost' && { backgroundColor: 'transparent', paddingVertical: 8 },
    disabled && { opacity: 0.55 },
    style,
  ];

  // Determine text color explicitly
  let textColor;
  if (variant === 'primary') {
    textColor = '#000000'; // Primary button: black text
  } else if (variant === 'outline') {
    textColor = colors.primary; // Outline button: primary color text
  } else if (variant === 'ghost') {
    textColor = colors.textSecondary; // Ghost button: secondary text
  } else {
    textColor = colors.text; // Fallback
  }

  const textStyles = [
    styles.text,
    { color: textColor },
    variant === 'ghost' && { fontWeight: '600' },
    textStyle,
  ];

  const handlePress = () => {
    console.log('[Button] Pressed!', { title, disabled, loading, onPress: !!onPress });
    if (onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={handlePress}
      disabled={loading || disabled}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#000' : colors.primary} />
      ) : (
        <View style={styles.buttonContent}>
          {icon}
          <Text style={textStyles}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export const IconInput = ({ icon, style, secureTextEntry, ...props }) => {
  const { colors } = useTheme();
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);

  return (
    <View style={[styles.iconInputWrap, { backgroundColor: colors.card, borderColor: colors.border }, style]}>
      <Ionicons name={icon} size={20} color={colors.textSecondary} style={styles.inputIcon} />
      <TextInput
        style={[styles.iconInput, { color: colors.text }]}
        placeholderTextColor={colors.textSecondary}
        secureTextEntry={secureTextEntry && !isPasswordVisible}
        numberOfLines={1}
        {...props}
      />
      {secureTextEntry && (
        <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
          <Ionicons
            name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export const Input = ({ label, ...props }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.inputContainer}>
      {label && <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>}
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
        placeholderTextColor={colors.textSecondary}
        numberOfLines={1}
        {...props}
      />
    </View>
  );
};

export const ScreenHeader = ({ title, subtitle }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.screenHeader}>
      <Text style={[styles.screenTitle, { color: colors.text }]}>{title}</Text>
      {subtitle ? <Text style={[styles.screenSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text> : null}
    </View>
  );
};

export const LoadingScreen = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.loading, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading SkillLearn...</Text>
    </View>
  );
};

export const EmptyState = ({ icon, title, subtitle }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.empty}>
      <Ionicons name={icon} size={56} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>{title}</Text>
      {subtitle ? <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>{subtitle}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    marginVertical: 6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: { color: '#000000', fontSize: 17, fontWeight: '700' },
  inputContainer: { marginBottom: 14 },
  label: { fontSize: 14, marginBottom: 6 },
  input: {
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  iconInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
    paddingHorizontal: 16,
  },
  inputIcon: { marginRight: 12 },
  iconInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
  },
  screenHeader: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  screenTitle: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  screenSubtitle: { fontSize: 15, marginTop: 4 },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { marginTop: 12 },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
});
