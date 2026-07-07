import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchFeed = createAsyncThunk('videos/fetchFeed', async ({ page = 1, category } = {}) => {
  const params = { page, limit: 10 };
  if (category) params.category = category;
  const { data } = await api.get('/videos/feed', { params });
  return { videos: data.data, pagination: data.pagination, page };
});

export const likeVideo = createAsyncThunk('videos/like', async (videoId, { getState, rejectWithValue }) => {
  // Optimistic update is handled in the reducer pending case
  const { data } = await api.post(`/videos/${videoId}/like`);
  return { videoId, ...data };
});

export const saveVideo = createAsyncThunk('videos/save', async (videoId) => {
  const { data } = await api.post(`/users/save/${videoId}`);
  return { videoId, saved: data.saved };
});

const videoSlice = createSlice({
  name: 'videos',
  initialState: {
    feed: [],
    pagination: null,
    loading: false,
    loadingMore: false,
  },
  reducers: {
    updateVideoInFeed: (state, action) => {
      const idx = state.feed.findIndex((v) => v._id === action.payload._id);
      if (idx !== -1) state.feed[idx] = { ...state.feed[idx], ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeed.pending, (state, action) => {
        if (action.meta.arg?.page > 1) state.loadingMore = true;
        else state.loading = true;
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        if (action.payload.page === 1) {
          state.feed = action.payload.videos;
        } else {
          state.feed = [...state.feed, ...action.payload.videos];
        }
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchFeed.rejected, (state) => {
        state.loading = false;
        state.loadingMore = false;
      })
      // Optimistic update for like
      .addCase(likeVideo.pending, (state, action) => {
        const video = state.feed.find((v) => v._id === action.meta.arg);
        if (video) {
          video.isLiked = !video.isLiked;
          video.likeCount = video.isLiked 
            ? (video.likeCount || 0) + 1 
            : (video.likeCount || 1) - 1;
        }
      })
      .addCase(likeVideo.fulfilled, (state, action) => {
        const video = state.feed.find((v) => v._id === action.payload.videoId);
        if (video) {
          video.isLiked = action.payload.liked;
          video.likeCount = action.payload.likeCount;
        }
      })
      .addCase(likeVideo.rejected, (state, action) => {
        // Revert optimistic update on failure
        const video = state.feed.find((v) => v._id === action.meta.arg);
        if (video) {
          video.isLiked = !video.isLiked;
          video.likeCount = video.isLiked 
            ? (video.likeCount || 0) + 1 
            : (video.likeCount || 1) - 1;
        }
      });
  },
});

export const { updateVideoInFeed } = videoSlice.actions;
export default videoSlice.reducer;
