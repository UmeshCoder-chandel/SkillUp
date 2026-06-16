import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import api from '../services/api';
import { COLORS } from '../utils/constants';
import { Button, Input } from '../components/UI';

export default function PlaylistScreen() {
  const [playlists, setPlaylists] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');

  const loadPlaylists = async () => {
    try {
      const { data } = await api.get('/playlists');
      setPlaylists(data.data);
    } catch {
      setPlaylists([]);
    }
  };

  useEffect(() => { loadPlaylists(); }, []);

  const createPlaylist = async () => {
    if (!name.trim()) return;
    await api.post('/playlists', { name });
    setName('');
    setShowCreate(false);
    loadPlaylists();
  };

  const deletePlaylist = async (id) => {
    await api.delete(`/playlists/${id}`);
    loadPlaylists();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Playlists</Text>
      <Button title="+ New Playlist" onPress={() => setShowCreate(!showCreate)} />
      {showCreate && (
        <View style={styles.createForm}>
          <Input value={name} onChangeText={setName} placeholder="Playlist name" />
          <Button title="Create" onPress={createPlaylist} />
        </View>
      )}
      <FlatList
        data={playlists}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.count}>{item.videos?.length || 0} videos</Text>
            </View>
            <TouchableOpacity onPress={() => deletePlaylist(item._id)}>
              <Text style={styles.delete}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No playlists yet</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16, paddingTop: 50 },
  header: { fontSize: 24, fontWeight: '700', color: COLORS.text, marginBottom: 16 },
  createForm: { marginBottom: 16 },
  card: { flexDirection: 'row', backgroundColor: COLORS.surface, padding: 16, borderRadius: 12, marginBottom: 10, alignItems: 'center' },
  name: { color: COLORS.text, fontWeight: '600', fontSize: 16 },
  count: { color: COLORS.textSecondary, marginTop: 4 },
  delete: { color: COLORS.error },
  empty: { color: COLORS.textSecondary, textAlign: 'center', marginTop: 40 },
});
