import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { fetchDashboard } from '../store/authSlice';

const StatCard = ({ title, value, color }) => (
  <Paper sx={{ p: 3, borderLeft: `4px solid ${color}` }}>
    <Typography color="textSecondary" variant="body2">{title}</Typography>
    <Typography variant="h4" fontWeight={700}>{value?.toLocaleString() || 0}</Typography>
  </Paper>
);

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { stats } = useSelector((s) => s.auth);

  useEffect(() => { dispatch(fetchDashboard()); }, [dispatch]);

  const s = stats?.stats || {};

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>Dashboard</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Total Users" value={s.totalUsers} color="#6C63FF" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Creators" value={s.totalCreators} color="#FF6584" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Videos" value={s.totalVideos} color="#4CAF50" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Total Views" value={s.totalViews} color="#FF9800" /></Grid>
      </Grid>
    </Box>
  );
}
