// API_URL is now defined in src/services/api.js

export const darkColors = {
  background: '#060B18',
  surface: '#0A1020',
  card: 'rgba(10, 16, 32, 0.6)',
  text: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.7)',
  textMuted: 'rgba(255,255,255,0.5)',
  border: 'rgba(255,255,255,0.12)',
  primary: '#00C2FF',
  secondary: '#8B5CF6',
  accent: '#F59E0B',
  success: '#10B981',
  error: '#EF4444',
  streak: '#F59E0B',
  xp: '#00C2FF',
  badge: 'rgba(139, 92, 246, 0.15)',
};

export const lightColors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  card: 'rgba(255, 255, 255, 0.9)',
  text: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  primary: '#00C2FF',
  secondary: '#7C3AED',
  accent: '#F59E0B',
  success: '#10B981',
  error: '#EF4444',
  streak: '#F59E0B',
  xp: '#00C2FF',
  badge: 'rgba(124, 58, 237, 0.1)',
};

export const getColors = (isDark) => {
  try {
    return isDark ? darkColors : lightColors;
  } catch (e) {
    console.error('Error in getColors, falling back to darkColors', e);
    return darkColors;
  }
};

export const BADGES = [
  { id: 'first', label: 'First Lesson', icon: 'play-circle-outline' },
  { id: 'xp100', label: '100 XP', icon: 'flash-outline' },
  { id: 'xp500', label: '500 XP', icon: 'trophy-outline' },
  { id: 'streak3', label: '3-Day Streak', icon: 'flame-outline' },
  { id: 'streak7', label: '7-Day Streak', icon: 'rocket-outline' },
  { id: 'streak30', label: '30-Day Streak', icon: 'star-outline' },
];

export const CATEGORY_ICONS = {
  'Web Development': 'code-slash',
  React: 'logo-react',
  'Node.js': 'server-outline',
  JavaScript: 'logo-javascript',
  MongoDB: 'leaf-outline',
  Java: 'cafe-outline',
  Python: 'logo-python',
  'Data Science': 'bar-chart-outline',
  AI: 'sparkles-outline',
  DevOps: 'git-network-outline',
  'Mobile Development': 'phone-portrait-outline',
};

export const formatDuration = (seconds) => {
  if (!seconds) return '0m';
  const mins = Math.floor(seconds / 60);
  if (mins >= 60) return `${Math.floor(mins / 60)}h`;
  return `${mins}m`;
};

export const formatCount = (count) => {
  if (!count) return '0';
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return count.toString();
};

export const getCategoryIcon = (title) => CATEGORY_ICONS[title] || 'book-outline';

export const addOpacityToHex = (hex, opacity) => {
  const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
  return `${hex}${alpha}`;
};

// Export default colors for backwards compatibility
export const COLORS = darkColors;
