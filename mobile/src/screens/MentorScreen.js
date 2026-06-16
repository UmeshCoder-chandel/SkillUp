import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';

const SUGGESTIONS = [
  'What should I learn first to become a Web Developer?',
  'Give me a 30-day React roadmap',
  'How do I prepare for a frontend interview?',
];

export default function MentorScreen() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const sendMessage = (text) => {
    const prompt = text || message.trim();
    if (!prompt) return;

    setMessages((prev) => [
      ...prev,
      { role: 'user', text: prompt },
      {
        role: 'assistant',
        text: 'AI Mentor is coming soon! For now, explore courses on the Home tab and save lessons to build your learning path.',
      },
    ]);
    setMessage('');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="sparkles" size={22} color={COLORS.primary} />
        </View>
        <View>
          <Text style={styles.headerTitle}>AI Mentor</Text>
          <Text style={styles.headerSub}>Powered by SkillLearn AI</Text>
        </View>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {messages.length === 0 ? (
            <View style={styles.empty}>
              <View style={styles.heroIcon}>
                <Ionicons name="sparkles" size={40} color={COLORS.primary} />
              </View>
              <Text style={styles.heroTitle}>Ask anything about your career</Text>
              <Text style={styles.heroSub}>Roadmaps, project ideas, interview tips & more</Text>

              {SUGGESTIONS.map((s) => (
                <TouchableOpacity key={s} style={styles.suggestion} onPress={() => sendMessage(s)}>
                  <Text style={styles.suggestionText}>{s}</Text>
                  <Ionicons name="arrow-forward" size={16} color={COLORS.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            messages.map((msg, i) => (
              <View
                key={`${msg.role}-${i}`}
                style={[styles.bubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}
              >
                <Text style={msg.role === 'user' ? styles.userBubbleText : styles.bubbleText}>{msg.text}</Text>
              </View>
            ))
          )}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Ask your AI mentor..."
            placeholderTextColor={COLORS.textSecondary}
            value={message}
            onChangeText={setMessage}
            onSubmitEditing={() => sendMessage()}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={() => sendMessage()}>
            <Ionicons name="send" size={18} color="#000" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerTitle: { color: COLORS.text, fontSize: 20, fontWeight: '800' },
  headerSub: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },
  body: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 16 },
  empty: { flex: 1, alignItems: 'center', paddingTop: 40 },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  heroTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  heroSub: {
    color: COLORS.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
    lineHeight: 22,
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  suggestionText: { flex: 1, color: COLORS.text, fontSize: 15, lineHeight: 22 },
  bubble: {
    maxWidth: '88%',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bubbleText: { color: COLORS.text, fontSize: 15, lineHeight: 22 },
  userBubbleText: { color: '#000000', fontSize: 15, lineHeight: 22 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    color: COLORS.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
