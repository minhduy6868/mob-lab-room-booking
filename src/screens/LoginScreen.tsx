import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  ScrollView,
  Image,
} from 'react-native';
import { confirmAction } from '../lib/confirm';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { THEME } from '../constants/theme';
import { useAuthStore } from '../store/useAuthStore';
import { DEMO_PASSWORD, PRIMARY_ACCOUNT } from '../constants/accounts';

export function LoginScreen() {
  const { loginWithEmail, loginAsDemo } = useAuthStore();
  const [email, setEmail] = useState(PRIMARY_ACCOUNT.email);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const buzz = (type: 'success' | 'error') => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.notificationAsync(
        type === 'success'
          ? Haptics.NotificationFeedbackType.Success
          : Haptics.NotificationFeedbackType.Error
      );
    }
  };

  const handleEmailLogin = async () => {
    setSubmitting(true);
    const result = await loginWithEmail(email, password);
    setSubmitting(false);
    if (!result.success) {
      setError(result.message);
      buzz('error');
      return;
    }
    setError(null);
    buzz('success');
  };

  const handleDemo = () => {
    confirmAction(
      'Vào bằng tài khoản demo',
      'Sẽ đăng nhập Nguyễn Văn Duy (23IT038) — abc@vku.udn.vn.',
      'Tiếp tục',
      () => {
        void loginAsDemo().then(() => buzz('success'));
      }
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brand}>
            <Image source={require('../../assets/icon.png')} style={styles.logo} />
            <Text style={styles.appName}>VKU Room Booking</Text>
            <Text style={styles.appSub}>Đặt phòng học • Lab • Thư viện</Text>
            <Text style={styles.uni}>Trường Đại học CNTT & TT Việt - Hàn</Text>
          </View>

          <Text style={styles.label}>Email VKU</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              setError(null);
            }}
            placeholder="ten.mssv@vku.udn.vn"
            placeholderTextColor={THEME.colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />

          <Text style={styles.label}>Mật khẩu</Text>
          <View style={styles.passwordWrap}>
            <TextInput
              style={styles.passwordInput}
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                setError(null);
              }}
              placeholder="Mật khẩu"
              placeholderTextColor={THEME.colors.textMuted}
              secureTextEntry={!showPassword}
              returnKeyType="done"
              onSubmitEditing={handleEmailLogin}
            />
            <Pressable onPress={() => setShowPassword((value) => !value)} hitSlop={8}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={THEME.colors.textMuted}
              />
            </Pressable>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={THEME.colors.occupied} />
              <Text style={styles.errorText} selectable>
                {error}
              </Text>
            </View>
          ) : (
            <Text style={styles.hint}>Mặc định: abc@vku.udn.vn • mật khẩu {DEMO_PASSWORD}</Text>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              submitting && { opacity: 0.6 },
              pressed && { opacity: 0.88 },
            ]}
            onPress={handleEmailLogin}
            disabled={submitting}
          >
            <Text style={styles.primaryText}>Đăng nhập</Text>
          </Pressable>

          <Pressable onPress={handleDemo} hitSlop={8} style={styles.demoBtn}>
            <Text style={styles.demoText}>Dùng tài khoản demo để chấm bài</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
  },
  brand: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logo: {
    width: 96,
    height: 96,
    marginBottom: 12,
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  appSub: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    marginTop: 4,
    fontWeight: '600',
  },
  uni: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    marginTop: 6,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: 12,
    paddingVertical: 13,
  },
  googleText: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.colors.text,
  },
  googleSub: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
    fontWeight: '600',
  },
  otherGoogle: {
    alignItems: 'center',
    marginTop: 10,
  },
  otherGoogleText: {
    fontSize: 13,
    color: THEME.colors.primaryLight,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 18,
  },
  divider: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: THEME.colors.border,
  },
  dividerText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    fontWeight: '600',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: THEME.colors.text,
    marginBottom: 12,
  },
  passwordWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: THEME.colors.text,
  },
  hint: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginBottom: 14,
  },
  errorBox: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    backgroundColor: THEME.colors.occupiedBg,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  errorText: {
    flex: 1,
    color: THEME.colors.occupied,
    fontSize: 12,
    fontWeight: '600',
  },
  primaryBtn: {
    backgroundColor: THEME.colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  demoBtn: {
    alignItems: 'center',
    marginTop: 16,
  },
  demoText: {
    fontSize: 13,
    color: THEME.colors.primaryLight,
    fontWeight: '700',
  },
});
