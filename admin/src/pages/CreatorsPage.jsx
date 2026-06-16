import React, { useEffect, useState } from 'react';
import { Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import api from '../services/api';

export default function CreatorsPage() {
  const [creators, setCreators] = useState([]);

  useEffect(() => {
    api.get('/admin/creators').then(({ data }) => setCreators(data.data));
  }, []);

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5" fontWeight={700} mb={2}>Creator Management</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Display Name</TableCell>
            <TableCell>User</TableCell>
            <TableCell>Videos</TableCell>
            <TableCell>Followers</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {creators.map((c) => (
            <TableRow key={c._id}>
              <TableCell>{c.displayName}</TableCell>
              <TableCell>{c.userId?.email}</TableCell>
              <TableCell>{c.totalVideos}</TableCell>
              <TableCell>{c.followers?.length || 0}</TableCell>
              <TableCell>{c.isActive ? 'Active' : 'Inactive'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
