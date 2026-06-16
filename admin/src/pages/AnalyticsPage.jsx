import React, { useEffect, useState } from 'react';
import { Paper, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/admin/analytics').then(({ data: res }) => setData(res.data));
  }, []);

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} mb={3}>Analytics</Typography>
      <Typography variant="h6" mb={2}>Videos by Category</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data?.videosByCategory || []}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="title" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#6C63FF" name="Videos" />
          <Bar dataKey="views" fill="#FF6584" name="Views" />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
}
