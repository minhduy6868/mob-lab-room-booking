import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import {
  AppAlertRequest,
  AppAlertTone,
  setAppAlertPresenter,
} from '../../lib/app-alert';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const TONE_CONFIG: Record<
  AppAlertTone,
  {
    icon: IconName;
    accent: string;
    background: string;
    border: string;
  }
> = {
  info: {
    icon: 'information-circle',
    accent: THEME.colors.primaryLight,
    background: '#EFF6FF',
    border: '#BFDBFE',
  },
  success: {
    icon: 'checkmark-circle',
    accent: THEME.colors.available,
    background: THEME.colors.availableBg,
    border: THEME.colors.availableBorder,
  },
  warning: {
    icon: 'alert-circle',
    accent: THEME.colors.reserved,
    background: THEME.colors.reservedBg,
    border: THEME.colors.reservedBorder,
  },
  danger: {
    icon: 'warning',
    accent: THEME.colors.occupied,
    background: THEME.colors.occupiedBg,
    border: THEME.colors.occupiedBorder,
  },
};

interface Props {
  children: React.ReactNode;
}

export function AppAlertProvider({ children }: Props) {
  const [alert, setAlert] = useState<AppAlertRequest | null>(null);

  useEffect(() => {
    return setAppAlertPresenter((request) => {
      setAlert(request);
    });
  }, []);

  const closeAlert = useCallback(() => {
    setAlert(null);
  }, []);

  const handleConfirm = useCallback(() => {
    const onConfirm = alert?.onConfirm;
    setAlert(null);
    if (onConfirm) {
      setTimeout(onConfirm, 120);
    }
  }, [alert]);

  const tone = alert?.tone ?? 'info';
  const config = useMemo(() => TONE_CONFIG[tone], [tone]);
  const isConfirm = alert?.kind === 'confirm';

  return (
    <>
      {children}
      <Modal
        visible={Boolean(alert)}
        animationType="fade"
        transparent
        onRequestClose={closeAlert}
      >
        <View style={styles.overlay}>
          <View style={styles.card}>
            <View style={[styles.iconWrap, { backgroundColor: config.background, borderColor: config.border }]}>
              <Ionicons name={config.icon} size={28} color={config.accent} />
            </View>

            <Text style={styles.title}>{alert?.title}</Text>
            {alert?.message ? (
              <Text style={styles.message} selectable>
                {alert.message}
              </Text>
            ) : null}

            <View style={isConfirm ? styles.confirmActions : styles.noticeActions}>
              {isConfirm ? (
                <Pressable
                  style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
                  onPress={closeAlert}
                >
                  <Text style={styles.secondaryButtonText}>{alert?.cancelText ?? 'Hủy'}</Text>
                </Pressable>
              ) : null}

              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  { backgroundColor: config.accent },
                  pressed && styles.pressed,
                ]}
                onPress={isConfirm ? handleConfirm : closeAlert}
              >
                <Text style={styles.primaryButtonText}>
                  {alert?.confirmText ?? (isConfirm ? 'Đồng ý' : 'Đã hiểu')}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.56)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: THEME.spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: THEME.colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: THEME.spacing.xl,
    alignItems: 'center',
    ...THEME.shadows.lg,
  },
  iconWrap: {
    width: 58,
    height: 58,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: THEME.colors.text,
    textAlign: 'center',
  },
  message: {
    marginTop: THEME.spacing.sm,
    fontSize: 13,
    lineHeight: 20,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
  },
  confirmActions: {
    flexDirection: 'row',
    gap: THEME.spacing.sm,
    marginTop: THEME.spacing.xl,
    width: '100%',
  },
  noticeActions: {
    marginTop: THEME.spacing.xl,
    width: '100%',
  },
  secondaryButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    backgroundColor: THEME.colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: THEME.spacing.md,
  },
  secondaryButtonText: {
    color: THEME.colors.textSecondary,
    fontWeight: '800',
    fontSize: 14,
  },
  primaryButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: THEME.spacing.md,
  },
  primaryButtonText: {
    color: THEME.colors.textLight,
    fontWeight: '900',
    fontSize: 14,
  },
  pressed: {
    opacity: 0.84,
  },
});
