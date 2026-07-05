import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const adminLogin = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/admin/login', { email, password });
    localStorage.setItem('adminToken', data.data.accessToken);
    return data.data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const fetchCurrentUser = createAsyncThunk('auth/fetchCurrentUser', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/admin/me');
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch user');
  }
});

export const fetchDashboard = createAsyncThunk('admin/dashboard', async () => {
  const { data } = await api.get('/admin/dashboard');
  return data.data;
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, isAuthenticated: false, loading: true, initializing: true, error: null, stats: null },
  reducers: {
    logout: (state) => {
      localStorage.removeItem('adminToken');
      state.user = null;
      state.isAuthenticated = false;
      state.stats = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(adminLogin.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.initializing = false;
      })
      .addCase(adminLogin.rejected, (state, action) => { state.loading = false; state.error = action.payload; state.initializing = false; })
      .addCase(fetchCurrentUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.initializing = false;
      })
      .addCase(fetchCurrentUser.rejected, (state) => { 
        state.loading = false; 
        state.user = null; 
        state.isAuthenticated = false; 
        state.initializing = false; 
        localStorage.removeItem('adminToken');
      })
      .addCase(fetchDashboard.pending, (state) => { state.loading = true; })
      .addCase(fetchDashboard.fulfilled, (state, action) => { state.stats = action.payload; state.loading = false; })
      .addCase(fetchDashboard.rejected, (state) => { state.loading = false; });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
