import React, { useEffect, useState } from 'react';
import { Paper, Typography, Box } from '@mui/material';
import api from '../services/api';

export default function ReportsPage() {
  const [report, setReport] = useState(null);

  useEffect(() => {
    api.get('/admin/reports').then(({ data }) => setReport(data.data));
  }, []);

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} mb={2}>Platform Reports</Typography>
      {report && (
        <Box>
          <Typography>Generated: {new Date(report.generatedAt).toLocaleString()}</Typography>
          <Typography mt={2}>Active Users: {report.metrics?.activeUsers}</Typography>
          <Typography>Published Videos: {report.metrics?.publishedVideos}</Typography>
          <Typography>Active Creators: {report.metrics?.activeCreators}</Typography>
        </Box>
      )}
    </Paper>
  );
}
