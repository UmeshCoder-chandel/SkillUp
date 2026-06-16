import React, { useEffect, useState } from 'react';
import { Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography, IconButton, Button, TextField, Box, InputLabel, Select, MenuItem, FormControl } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../services/api';

export default function VideosPage() {
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [creators, setCreators] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [creatorId, setCreatorId] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  const load = () => {
    api.get('/admin/videos').then(({ data }) => setVideos(data.data));
    api.get('/admin/categories').then(({ data }) => setCategories(data.data));
    api.get('/admin/creators').then(({ data }) => setCreators(data.data));
  };
  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Delete video?')) {
      await api.delete(`/admin/videos/${id}`);
      load();
    }
  };

  const handleCreate = async () => {
    if (!title || !categoryId || !creatorId || !videoFile) {
      alert('Please fill in all fields and select a video');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', categoryId);
    formData.append('creator', creatorId);
    formData.append('video', videoFile);
    
    // Add thumbnail only if present
    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile);
    }

    await api.post('/admin/videos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    setTitle('');
    setDescription('');
    setCategoryId('');
    setCreatorId('');
    setThumbnailFile(null);
    setVideoFile(null);
    load();
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5" fontWeight={700} mb={2}>Video Management</Typography>
      
      {/* Upload Form */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: 1, borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight={600}>Add New Video</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} size="small" sx={{ minWidth: 200 }} />
          <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} size="small" sx={{ minWidth: 200 }} />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Category</InputLabel>
            <Select value={categoryId} label="Category" onChange={(e) => setCategoryId(e.target.value)}>
              {categories.map(cat => (
                <MenuItem key={cat._id} value={cat._id}>{cat.title}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Creator</InputLabel>
            <Select value={creatorId} label="Creator" onChange={(e) => setCreatorId(e.target.value)}>
              {creators.map(cr => (
                <MenuItem key={cr._id} value={cr._id}>{cr.displayName}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button variant="outlined" component="label">
            Upload Thumbnail
            <input type="file" accept="image/*" hidden onChange={(e) => setThumbnailFile(e.target.files[0])} />
          </Button>
          <Button variant="outlined" component="label">
            Upload Video
            <input type="file" accept="video/*" hidden onChange={(e) => setVideoFile(e.target.files[0])} />
          </Button>
          <Button variant="contained" onClick={handleCreate} sx={{ bgcolor: '#6C63FF' }}>Add Video</Button>
        </Box>
        {(thumbnailFile || videoFile) && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Selected: {thumbnailFile?.name || 'No thumbnail'} • {videoFile?.name || 'No video'}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Videos Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Creator</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Views</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {videos.map((v) => (
            <TableRow key={v._id}>
              <TableCell>{v.title}</TableCell>
              <TableCell>{v.creator?.displayName}</TableCell>
              <TableCell>{v.category?.title}</TableCell>
              <TableCell>{v.views}</TableCell>
              <TableCell>
                <IconButton color="error" onClick={() => handleDelete(v._id)}><DeleteIcon /></IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
