import React, { useEffect, useState } from 'react';
import { Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography, Button, TextField, Box } from '@mui/material';
import api from '../services/api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [iconFile, setIconFile] = useState(null);

  const load = () => api.get('/admin/categories').then(({ data }) => setCategories(data.data));
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!title) {
      alert('Please enter a title');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    if (iconFile) {
      formData.append('icon', iconFile);
    }

    await api.post('/admin/categories', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    setTitle('');
    setDescription('');
    setIconFile(null);
    load();
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5" fontWeight={700} mb={2}>Category Management</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} size="small" />
        <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} size="small" />
        <Button variant="outlined" component="label">
          Upload Icon
          <input type="file" accept="image/*" hidden onChange={(e) => setIconFile(e.target.files[0])} />
        </Button>
        <Button variant="contained" onClick={handleCreate} sx={{ bgcolor: '#6C63FF' }}>Add</Button>
        {iconFile && (
          <Typography variant="body2" color="text.secondary">Selected: {iconFile.name}</Typography>
        )}
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Videos</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {categories.map((c) => (
            <TableRow key={c._id}>
              <TableCell>{c.title}</TableCell>
              <TableCell>{c.description}</TableCell>
              <TableCell>{c.videoCount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
