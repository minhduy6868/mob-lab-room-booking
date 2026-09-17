import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { useBookingStore } from '../../store/useBookingStore';

export function QRCodePassModal() {
  const { selectedBookingForQR: booking, closeQRModal, checkInBooking } = useBookingStore();

  if (!booking) return null;

  const isOngoing = booking.status === 'ongoing';

  const handleCheckIn = async () => {
    const result = await checkInBooking(booking.id);
    if (!result.success) {
      Alert.alert('Không thể check-in', result.message);
      return;
    }
    Alert.alert('Check-in thành công', result.message);
  };

  return (
    <Modal
      visible={!!booking}
      animationType="fade"
      transparent
      onRequestClose={closeQRModal}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Top Banner */}
          <View style={styles.banner}>
            <View style={styles.bannerLeft}>
              <View style={styles.vkuLogo}>
                <Text style={styles.vkuLogoText}>VKU</Text>
              </View>
              <View>
                <Text style={styles.passTitle}>THẺ VÀO PHÒNG HỌC</Text>
                <Text style={styles.passSub}>DIGITAL ACCESS PASS</Text>
              </View>
            </View>
            <Pressable onPress={closeQRModal} hitSlop={10} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* Body */}
          <View style={styles.body}>
            <View style={styles.roomInfo}>
              <Text style={styles.roomName}>{booking.roomName}</Text>
              <Text style={styles.building}>{booking.building}</Text>
            </View>

            {/* Simulated QR Code Visual */}
            <View style={styles.qrContainer}>
              <View style={styles.qrFrame}>
                {/* 3 Finder patterns at corners */}
                <View style={[styles.finderPattern, styles.finderTopLeft]}>
                  <View style={styles.finderInner} />
                </View>
                <View style={[styles.finderPattern, styles.finderTopRight]}>
                  <View style={styles.finderInner} />
                </View>
                <View style={[styles.finderPattern, styles.finderBottomLeft]}>
                  <View style={styles.finderInner} />
                </View>

                {/* Center barcode / matrix dots */}
                <View style={styles.qrCenterContent}>
                  <Ionicons name="qr-code" size={110} color={THEME.colors.primary} />
                </View>
              </View>
              <Text style={styles.codeLabel}>{booking.bookingCode}</Text>
              <Text style={styles.scanNotice}>
                Đưa mã này lại gần đầu đọc camera tại cửa phòng để mở khóa tự động
              </Text>
            </View>

            {/* Details Box */}
            <View style={styles.detailsBox}>
              <View style={styles.detailRow}>
                <Text style={styles.detailTitle}>Thời gian:</Text>
                <Text style={styles.detailVal}>
                  {booking.slotLabel} ({booking.date})
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailTitle}>Sinh viên:</Text>
                <Text style={styles.detailVal}>
                  {booking.studentName} ({booking.studentId})
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailTitle}>Mục đích:</Text>
                <Text style={styles.detailVal} numberOfLines={1}>
                  {booking.purpose}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailTitle}>Trạng thái:</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>
                    {isOngoing ? 'Đang sử dụng phòng' : 'Đã xác nhận đặt chỗ'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Action buttons */}
            <View style={styles.btnRow}>
              {!isOngoing && (
                <Pressable
                  style={({ pressed }) => [styles.checkInBtn, pressed && { opacity: 0.85 }]}
                  onPress={handleCheckIn}
                >
                  <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.checkInBtnText}>Mô phỏng Check-in Ngay</Text>
                </Pressable>
              )}
              <Pressable style={styles.doneBtn} onPress={closeQRModal}>
                <Text style={styles.doneBtnText}>Hoàn tất</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: THEME.colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    ...THEME.shadows.lg,
  },
  banner: {
    backgroundColor: THEME.colors.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  vkuLogo: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  vkuLogoText: {
    color: THEME.colors.primary,
    fontWeight: '900',
    fontSize: 14,
  },
  passTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  passSub: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    padding: 20,
    alignItems: 'center',
  },
  roomInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  roomName: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.colors.text,
  },
  building: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  qrContainer: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 16,
    width: '100%',
  },
  qrFrame: {
    width: 150,
    height: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    ...THEME.shadows.sm,
  },
  finderPattern: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderWidth: 3,
    borderColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finderInner: {
    width: 10,
    height: 10,
    backgroundColor: THEME.colors.primary,
  },
  finderTopLeft: {
    top: 6,
    left: 6,
  },
  finderTopRight: {
    top: 6,
    right: 6,
  },
  finderBottomLeft: {
    bottom: 6,
    left: 6,
  },
  qrCenterContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeLabel: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.primary,
    letterSpacing: 2,
  },
  scanNotice: {
    marginTop: 6,
    fontSize: 11,
    color: THEME.colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 10,
  },
  detailsBox: {
    width: '100%',
    backgroundColor: THEME.colors.surfaceAlt,
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailTitle: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
  },
  detailVal: {
    fontSize: 12,
    color: THEME.colors.text,
    fontWeight: '700',
    flexShrink: 1,
    textAlign: 'right',
  },
  statusBadge: {
    backgroundColor: THEME.colors.availableBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.available,
  },
  btnRow: {
    width: '100%',
    marginTop: 16,
    gap: 10,
  },
  checkInBtn: {
    backgroundColor: THEME.colors.available,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  checkInBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  doneBtn: {
    backgroundColor: THEME.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  doneBtnText: {
    color: THEME.colors.textSecondary,
    fontWeight: '600',
    fontSize: 13,
  },
});
