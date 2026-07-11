import React, { useEffect, useState } from 'react';
import { 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow, 
  Typography,
  Chip,
  Button,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { Check, Close } from '@mui/icons-material';
import api from '../services/api';

export default function CreatorsPage() {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchCreators = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/creators');
      setCreators(data.data);
    } catch (error) {
      console.error('Failed to fetch creators:', error);
      setSnackbar({ open: true, message: 'Failed to fetch creators', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreators();
  }, []);

  const handleApprove = async (id) => {
    try {
      setActionLoading(id);
      await api.put(`/admin/creators/${id}/approve`);
      setSnackbar({ open: true, message: 'Creator approved successfully', severity: 'success' });
      fetchCreators();
    } catch (error) {
      console.error('Failed to approve creator:', error);
      setSnackbar({ open: true, message: 'Failed to approve creator', severity: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    try {
      setActionLoading(id);
      await api.put(`/admin/creators/${id}/reject`);
      setSnackbar({ open: true, message: 'Creator rejected successfully', severity: 'success' });
      fetchCreators();
    } catch (error) {
      console.error('Failed to reject creator:', error);
      setSnackbar({ open: true, message: 'Failed to reject creator', severity: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusChip = (status) => {
    switch(status) {
      case 'Approved':
        return <Chip label="Approved" color="success" size="small" />;
      case 'Rejected':
        return <Chip label="Rejected" color="error" size="small" />;
      case 'Pending':
      default:
        return <Chip label="Pending" color="warning" size="small" />;
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5" fontWeight={700} mb={2}>Creator Management</Typography>
      {loading ? (
        <CircularProgress sx={{ display: 'block', mx: 'auto' }} />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Display Name</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Videos</TableCell>
              <TableCell>Followers</TableCell>
              <TableCell>Active Status</TableCell>
              <TableCell>Approval Status</TableCell>
              <TableCell>Actions</TableCell>
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
                <TableCell>{getStatusChip(c.approvalStatus)}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="success"
                    startIcon={actionLoading === c._id ? <CircularProgress size={16} /> : <Check />}
                    disabled={c.approvalStatus === 'Approved' || actionLoading === c._id}
                    onClick={() => handleApprove(c._id)}
                    sx={{ mr: 1 }}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={actionLoading === c._id ? <CircularProgress size={16} /> : <Close />}
                    disabled={c.approvalStatus === 'Rejected' || actionLoading === c._id}
                    onClick={() => handleReject(c._id)}
                  >
                    Reject
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
