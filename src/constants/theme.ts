export const THEME = {
  colors: {
    primary: '#1E3A5F',       // VKU Deep Navy Blue
    primaryLight: '#2563EB',  // Royal Blue
    primaryDark: '#0F1E36',
    accent: '#0284C7',        // Sky Cyan
    accentSubtle: '#F0F9FF',
    
    // Status colors
    available: '#10B981',     // Emerald Green
    availableBg: '#ECFDF5',
    availableBorder: '#A7F3D0',
    
    occupied: '#EF4444',      // Red
    occupiedBg: '#FEF2F2',
    occupiedBorder: '#FECACA',
    
    reserved: '#F59E0B',      // Amber
    reservedBg: '#FFFBEB',
    reservedBorder: '#FDE68A',
    
    maintenance: '#64748B',   // Slate
    maintenanceBg: '#F1F5F9',
    maintenanceBorder: '#CBD5E1',

    // Neutral colors
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceAlt: '#F1F5F9',
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    
    // Text colors
    text: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    textLight: '#FFFFFF',

    badgeBg: '#EFF6FF',
    badgeText: '#1D4ED8',
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },

  borderRadius: {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 18,
    full: 9999,
  },

  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.12,
      shadowRadius: 14,
      elevation: 7,
    },
  },
};
