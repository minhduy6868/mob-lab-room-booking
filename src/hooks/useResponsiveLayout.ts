import { useWindowDimensions } from 'react-native';

/**
 * Custom Hook: useResponsiveLayout
 * Matches and enhances Slides 26 & 27 from Week 5 VKU Lecture.
 * Uses useWindowDimensions() which automatically re-renders on device rotation,
 * dynamically calculating the grid columns, card width, and layout padding.
 */
export function useResponsiveLayout() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const isTablet = width >= 768;

  // Responsive column count: 3 on desktop/tablet landscape, 2 on phablet/tablet portrait, 1 on phone
  const columns = width >= 1024 ? 3 : width >= 640 ? 2 : 1;

  const horizontalPadding = isTablet ? 24 : 16;
  const cardGap = 16;

  // Exact card width calculation taking padding and gaps into account
  const totalGaps = cardGap * (columns - 1);
  const totalPadding = horizontalPadding * 2;
  const cardWidth = Math.floor((width - totalPadding - totalGaps) / columns);

  return {
    width,
    height,
    isLandscape,
    isTablet,
    columns,
    cardWidth,
    horizontalPadding,
    cardGap,
  };
}
