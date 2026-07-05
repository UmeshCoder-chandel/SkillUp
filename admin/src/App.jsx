import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from './store/authSlice';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import CreatorsPage from './pages/CreatorsPage';
import CreatorRequestsPage from './pages/CreatorRequestsPage';
import CategoriesPage from './pages/CategoriesPage';
import VideosPage from './pages/VideosPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ReportsPage from './pages/ReportsPage';
import { Box, CircularProgress, Typography } from '@mui/material';

function PrivateRoute({ children }) {
  const { isAuthenticated, initializing } = useSelector((s) => s.auth);
  
  if (initializing) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: '#6C63FF' }} />
        <Typography variant="body1" sx={{ mt: 2 }}>Loading...</Typography>
      </Box>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default function App() {
  const dispatch = useDispatch();
  const { initializing } = useSelector((s) => s.auth);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={
          <PrivateRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/creators" element={<CreatorsPage />} />
                <Route path="/creator-requests" element={<CreatorRequestsPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/videos" element={<VideosPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/reports" element={<ReportsPage />} />
              </Routes>
            </Layout>
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
