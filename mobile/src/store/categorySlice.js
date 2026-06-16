import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchCategories = createAsyncThunk('categories/fetch', async () => {
  const { data } = await api.get('/categories');
  return data.data;
});

const categorySlice = createSlice({
  name: 'categories',
  initialState: { list: [], loading: false },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => { state.loading = true; })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchCategories.rejected, (state) => { state.loading = false; });
  },
});

export default categorySlice.reducer;
