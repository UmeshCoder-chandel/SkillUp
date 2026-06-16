import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import api from '../services/api';
import { COLORS } from '../utils/constants';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const load = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.data);
      setUnreadCount(data.unreadCount);
    } catch {
      setNotifications([]);
    }
  };

  useEffect(() => { load(); }, []);

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    load();
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.markRead}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={[styles.item, !item.isRead && styles.unread]}>
            <Text style={styles.message}>{item.message}</Text>
            <Text style={styles.type}>{item.type.replace('_', ' ')}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No notifications</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingTop: 50 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  header: { fontSize: 24, fontWeight: '700', color: COLORS.text },
  markRead: { color: COLORS.primary },
  item: { padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  unread: { backgroundColor: COLORS.surface },
  message: { color: COLORS.text, fontSize: 15 },
  type: { color: COLORS.textSecondary, fontSize: 12, marginTop: 4, textTransform: 'capitalize' },
  empty: { color: COLORS.textSecondary, textAlign: 'center', marginTop: 40 },
});
