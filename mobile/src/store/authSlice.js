import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';
import { storage } from '../utils/storage';

const getAuthError = (err, fallback) => {
  console.log('DEBUG ERROR:', JSON.stringify(err, null, 2));
  console.log('DEBUG ERROR NAME:', err.name);
  console.log('DEBUG ERROR MESSAGE:', err.message);
  console.log('DEBUG ERROR RESPONSE:', err.response);
  console.log('DEBUG ERROR REQUEST:', err.request);
  if (!err.response) {
    return `Cannot reach server. Error: ${err.message}. Check that backend is running and EXPO_PUBLIC_API_URL is correct.`;
  }
  return err.response?.data?.message || fallback;
};

const normalizeEmail = (email) => email.trim().toLowerCase();

export const loginUser = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', {
      email: normalizeEmail(email),
      password,
    });
    await storage.setAccessToken(data.data.accessToken);
    await storage.setRefreshToken(data.data.refreshToken);
    return data.data.user;
  } catch (err) {
    const message = getAuthError(err, 'Login failed');
    const needsVerification = err.response?.status === 403;
    return rejectWithValue({ message, needsVerification, email: normalizeEmail(email) });
  }
});

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', {
      ...userData,
      email: normalizeEmail(userData.email),
      name: userData.name.trim(),
    });
    return data.data;
  } catch (err) {
    return rejectWithValue(getAuthError(err, 'Registration failed'));
  }
});

export const verifyOTP = createAsyncThunk('auth/verifyOTP', async ({ email, otp }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/verify-otp', {
      email: normalizeEmail(email),
      otp: otp.trim(),
    });
    await storage.setAccessToken(data.data.accessToken);
    await storage.setRefreshToken(data.data.refreshToken);
    return data.data.user;
  } catch (err) {
    return rejectWithValue(getAuthError(err, 'OTP verification failed'));
  }
});

export const resendOTP = createAsyncThunk('auth/resendOTP', async ({ email }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/resend-otp', {
      email: normalizeEmail(email),
    });
    return data.message;
  } catch (err) {
    return rejectWithValue(getAuthError(err, 'Could not resend OTP'));
  }
});

export const forgotPassword = createAsyncThunk('auth/forgotPassword', async ({ email }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/forgot-password', { email: normalizeEmail(email) });
    return { email: normalizeEmail(email), message: data.message };
  } catch (err) {
    return rejectWithValue(getAuthError(err, 'Could not send reset code'));
  }
});

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ email, otp, password }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/reset-password', {
        email: normalizeEmail(email),
        otp: otp.trim(),
        password,
      });
      return data.message;
    } catch (err) {
      return rejectWithValue(getAuthError(err, 'Password reset failed'));
    }
  }
);

export const googleLogin = createAsyncThunk('auth/google', async (idToken, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/google', { idToken });
    await storage.setAccessToken(data.data.accessToken);
    await storage.setRefreshToken(data.data.refreshToken);
    return data.data.user;
  } catch (err) {
    return rejectWithValue(getAuthError(err, 'Google login failed'));
  }
});

export const loadUser = createAsyncThunk('auth/loadUser', async () => {
  const token = await storage.getAccessToken();
  if (!token) return null;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout for this call
    const { data } = await api.get('/auth/me', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return data.data;
  } catch (err) {
    console.warn('loadUser failed:', err.message);
    await storage.clearTokens();
    return null;
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  try {
    await api.post('/auth/logout');
  } catch {
    // ignore
  }
  await storage.clearTokens();
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    initializing: true,
    error: null,
    pendingEmail: null,
    resetEmail: null,
    successMessage: null,
    needsVerification: false,
    unverifiedEmail: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.needsVerification = false;
      state.unverifiedEmail = null;
    },
    clearSuccess: (state) => {
      state.successMessage = null;
    },
    setPendingEmail: (state, action) => {
      state.pendingEmail = action.payload;
    },
    setAuthError: (state, action) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.error = null;
        state.needsVerification = false;
        state.unverifiedEmail = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        const payload = action.payload;
        if (typeof payload === 'object' && payload?.needsVerification) {
          state.error = payload.message;
          state.needsVerification = true;
          state.unverifiedEmail = payload.email;
          state.pendingEmail = payload.email;
        } else {
          state.error = typeof payload === 'string' ? payload : payload?.message || 'Login failed';
        }
      })
      .addCase(registerUser.pending, (state) => {
        state.error = null;
        state.successMessage = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.pendingEmail = action.payload.email;
        state.successMessage = 'Account created! Check your email for the verification code.';
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(verifyOTP.pending, (state) => {
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.pendingEmail = null;
        state.needsVerification = false;
        state.unverifiedEmail = null;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(resendOTP.fulfilled, (state, action) => {
        state.successMessage = action.payload;
        state.error = null;
      })
      .addCase(resendOTP.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(forgotPassword.pending, (state) => {
        state.error = null;
        state.successMessage = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.resetEmail = action.payload.email;
        state.successMessage = action.payload.message;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(resetPassword.pending, (state) => {
        state.error = null;
        state.successMessage = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.successMessage = action.payload;
        state.resetEmail = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(googleLogin.pending, (state) => {
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(loadUser.pending, (state) => {
        state.initializing = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.initializing = false;
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
      })
      .addCase(loadUser.rejected, (state) => {
        state.initializing = false;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, clearSuccess, setPendingEmail, setAuthError } = authSlice.actions;
export default authSlice.reducer;
