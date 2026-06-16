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

export const fetchDashboard = createAsyncThunk('admin/dashboard', async () => {
  const { data } = await api.get('/admin/dashboard');
  return data.data;
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, isAuthenticated: !!localStorage.getItem('adminToken'), loading: false, error: null, stats: null },
  reducers: {
    logout: (state) => {
      localStorage.removeItem('adminToken');
      state.user = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(adminLogin.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(adminLogin.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchDashboard.fulfilled, (state, action) => { state.stats = action.payload; });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
