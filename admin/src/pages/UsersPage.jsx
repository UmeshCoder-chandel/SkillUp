import React, { useEffect, useState } from 'react';
import { Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../services/api';

export default function UsersPage() {
  const [users, setUsers] = useState([]);

  const load = () => api.get('/admin/users').then(({ data }) => setUsers(data.data));
  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Delete user?')) {
      await api.delete(`/admin/users/${id}`);
      load();
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5" fontWeight={700} mb={2}>User Management</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Verified</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u._id}>
              <TableCell>{u.name}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.role}</TableCell>
              <TableCell>{u.isVerified ? 'Yes' : 'No'}</TableCell>
              <TableCell>
                <IconButton color="error" onClick={() => handleDelete(u._id)}><DeleteIcon /></IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
