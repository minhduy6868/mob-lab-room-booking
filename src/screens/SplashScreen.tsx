import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';

const { width: SCREEN_W } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  // Animation values
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineY = useRef(new Animated.Value(30)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const loadBarWidth = useRef(new Animated.Value(0)).current;
  const dotOpacity1 = useRef(new Animated.Value(0.3)).current;
  const dotOpacity2 = useRef(new Animated.Value(0.3)).current;
  const dotOpacity3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.sequence([
      // 1. Logo bounces in
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 60,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      // 2. Tagline slides up
      Animated.parallel([
        Animated.timing(taglineY, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      // 3. Loading bar fills
      Animated.timing(loadBarWidth, {
        toValue: SCREEN_W * 0.55,
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
    ]).start(() => {
      // Done → call onFinish after brief pause
      setTimeout(onFinish, 300);
    });

    // Pulsing dots animation loop
    const pulseDots = () => {
      Animated.sequence([
        Animated.timing(dotOpacity1, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dotOpacity2, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dotOpacity3, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.delay(200),
        Animated.parallel([
          Animated.timing(dotOpacity1, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          Animated.timing(dotOpacity2, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          Animated.timing(dotOpacity3, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        ]),
      ]).start(pulseDots);
    };
    pulseDots();
  }, []);

  return (
    <View style={styles.container}>
      {/* Background gradient top layer */}
      <View style={styles.backgroundTop} />
      <View style={styles.backgroundBottom} />

      {/* Star/particle blobs for depth */}
      <View style={[styles.blob, styles.blobTopLeft]} />
      <View style={[styles.blob, styles.blobTopRight]} />
      <View style={[styles.blob, styles.blobCenter]} />

      {/* Logo area */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        <Image
          source={require('../../assets/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Tagline */}
      <Animated.View
        style={[
          styles.taglineContainer,
          {
            opacity: taglineOpacity,
            transform: [{ translateY: taglineY }],
          },
        ]}
      >
        <Text style={styles.appName}>Study Room Booking</Text>
        <Text style={styles.appSubtitle}>Đặt phòng học thông minh</Text>
        <Text style={styles.universityName}>
          Trường Đại học CNTT & TT Việt - Hàn
        </Text>
      </Animated.View>

      {/* Bottom loading indicator */}
      <View style={styles.loadingSection}>
        {/* Loading bar track */}
        <View style={styles.loadBarTrack}>
          <Animated.View style={[styles.loadBarFill, { width: loadBarWidth }]} />
        </View>

        {/* Pulse dots */}
        <View style={styles.dotsRow}>
          <Animated.View style={[styles.dot, { opacity: dotOpacity1 }]} />
          <Animated.View style={[styles.dot, { opacity: dotOpacity2 }]} />
          <Animated.View style={[styles.dot, { opacity: dotOpacity3 }]} />
        </View>

        <Text style={styles.loadingText}>Đang kết nối hệ thống...</Text>
      </View>

      {/* Version badge */}
      <View style={styles.versionBadge}>
        <Text style={styles.versionText}>v1.0.0 Beta • Khoa CNTT VKU</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1628',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backgroundTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: '#0F1E36',
  },
  backgroundBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: '#0A1628',
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(30, 58, 95, 0.6)',
  },
  blobTopLeft: {
    width: 220,
    height: 220,
    top: -60,
    left: -60,
  },
  blobTopRight: {
    width: 180,
    height: 180,
    top: 40,
    right: -50,
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
  },
  blobCenter: {
    width: 300,
    height: 300,
    top: '30%',
    left: '50%',
    marginLeft: -150,
    backgroundColor: 'rgba(30, 58, 95, 0.3)',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    zIndex: 10,
  },
  logo: {
    width: 200,
    height: 200,
  },
  taglineContainer: {
    alignItems: 'center',
    zIndex: 10,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: 15,
    color: '#93C5FD',
    fontWeight: '600',
    marginTop: 6,
    letterSpacing: 0.3,
  },
  universityName: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 12,
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  loadingSection: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
    width: '100%',
    zIndex: 10,
  },
  loadBarTrack: {
    width: SCREEN_W * 0.55,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 14,
  },
  loadBarFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 2,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#93C5FD',
  },
  loadingText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.4)',
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  versionBadge: {
    position: 'absolute',
    bottom: 32,
    zIndex: 10,
  },
  versionText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.25)',
    textAlign: 'center',
    fontWeight: '400',
  },
});
