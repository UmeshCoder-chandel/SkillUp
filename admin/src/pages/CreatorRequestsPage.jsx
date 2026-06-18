import React, { useEffect, useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Button,
  Avatar,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import api from '../services/api';

export default function CreatorRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [rejectDialog, setRejectDialog] = useState({ open: false, userId: null, notes: '' });

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const { data } = await api.get('/admin/creator-requests');
      setRequests(data.data);
    } catch (error) {
      console.error('Failed to load requests:', error);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await api.put(`/admin/creator-requests/${userId}/approve`);
      loadRequests();
    } catch (error) {
      console.error('Failed to approve:', error);
    }
  };

  const handleReject = async () => {
    try {
      await api.put(`/admin/creator-requests/${rejectDialog.userId}/reject`, {
        notes: rejectDialog.notes,
      });
      setRejectDialog({ open: false, userId: null, notes: '' });
      loadRequests();
    } catch (error) {
      console.error('Failed to reject:', error);
    }
  };

  return (
    <>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h5" fontWeight={700} mb={2}>
          Creator Requests
        </Typography>
        {requests.length === 0 ? (
          <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
            No pending creator requests
          </Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Requested At</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req._id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar src={req.avatar} alt={req.name}>
                        {req.name?.[0]?.toUpperCase()}
                      </Avatar>
                      <Typography fontWeight={600}>{req.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{req.email}</TableCell>
                  <TableCell>
                    {new Date(req.creatorRequest.requestedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {req.creatorRequest.notes || '-'}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handleApprove(req._id)}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<CancelIcon />}
                        onClick={() => setRejectDialog({ open: true, userId: req._id, notes: '' })}
                      >
                        Reject
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Dialog open={rejectDialog.open} onClose={() => setRejectDialog({ open: false, userId: null, notes: '' })}>
        <DialogTitle>Reject Creator Request</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Are you sure you want to reject this creator request? You can add notes for the user.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Rejection Notes"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={rejectDialog.notes}
            onChange={(e) => setRejectDialog({ ...rejectDialog, notes: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialog({ open: false, userId: null, notes: '' })}>
            Cancel
          </Button>
          <Button onClick={handleReject} color="error" variant="contained">
            Reject Request
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
