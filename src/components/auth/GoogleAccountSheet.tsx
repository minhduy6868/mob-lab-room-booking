import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { DEMO_ACCOUNTS, DemoAccount } from '../../constants/accounts';

interface GoogleAccountSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (account: DemoAccount) => void;
}

export function GoogleAccountSheet({ visible, onClose, onSelect }: GoogleAccountSheetProps) {
  if (!visible) return null;

  return (
    <Modal visible animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay} pointerEvents="box-none">
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handleWrap}>
            <View style={styles.handle} />
          </View>

          <View style={styles.header}>
            <Ionicons name="logo-google" size={22} color="#EA4335" />
            <Text style={styles.title}>Chọn tài khoản Google</Text>
          </View>
          <Text style={styles.subtitle}>
            Tài khoản sẵn: Nguyễn Văn Duy (23IT038) — abc@vku.udn.vn
          </Text>

          <ScrollView keyboardShouldPersistTaps="handled">
            {DEMO_ACCOUNTS.map((account) => (
              <Pressable
                key={account.email}
                style={({ pressed }) => [styles.accountRow, pressed && { opacity: 0.85 }]}
                onPress={() => onSelect(account)}
                hitSlop={8}
              >
                <Image source={{ uri: account.avatar }} style={styles.avatar} />
                <View style={styles.accountMeta}>
                  <Text style={styles.accountName}>{account.fullName}</Text>
                  <Text style={styles.accountEmail} selectable>
                    {account.email}
                  </Text>
                  <Text style={styles.accountId}>
                    MSSV {account.studentId} • {account.googleAccountLabel}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={THEME.colors.textMuted} />
              </Pressable>
            ))}
          </ScrollView>

          <Pressable style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>Hủy</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: THEME.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 28,
    maxHeight: '78%',
    zIndex: 2,
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    marginTop: 6,
    marginBottom: 12,
    lineHeight: 18,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: THEME.colors.border,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.colors.surfaceAlt,
  },
  accountMeta: {
    flex: 1,
  },
  accountName: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.colors.text,
  },
  accountEmail: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  accountId: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 2,
    fontWeight: '600',
  },
  cancelBtn: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: THEME.colors.surfaceAlt,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
  },
});
