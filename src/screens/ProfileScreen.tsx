import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { useBookingStore, hoursFromBookings } from '../store/useBookingStore';
import { useAuthStore, getProviderLabel } from '../store/useAuthStore';
import { Header } from '../components/common/Header';
import { isActiveBooking } from '../lib/booking-rules';
import { confirmAction } from '../lib/confirm';
import { DEMO_PASSWORD } from '../constants/accounts';

export function ProfileScreen() {
  const { bookings } = useBookingStore();
  const { session, logout } = useAuthStore();
  const user = session?.user;
  if (!user || !session) return null;

  const mine = bookings.filter((booking) => booking.studentId === user.studentId);
  const confirmedCount = mine.filter((b) => isActiveBooking(b)).length;
  const hours = hoursFromBookings(mine, user.studentId);

  const handleLogout = () => {
    confirmAction(
      'Đăng xuất',
      'Bạn sẽ cần đăng nhập lại bằng Google (Nguyễn Văn Duy) hoặc email.',
      'Đăng xuất',
      () => {
        void logout();
      }
    );
  };

  return (
    <View style={styles.container}>
      <Header showDateSwitcher={false} />
      <ScrollView
        style={styles.flex}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
      >
      {/* Student ID Card Simulation */}
      <View style={styles.cardWrapper}>
        <View style={styles.idCard}>
          {/* Card Top Brand */}
          <View style={styles.cardHeader}>
            <View style={styles.cardBrand}>
              <View style={styles.vkuLogo}>
                <Text style={styles.vkuLogoText}>VKU</Text>
              </View>
              <View>
                <Text style={styles.cardUniversity}>ĐẠI HỌC CNTT & TT VIỆT - HÀN</Text>
                <Text style={styles.cardFaculty}>{user.faculty}</Text>
              </View>
            </View>
            <View style={styles.chipGraphic}>
              <Ionicons name="hardware-chip-outline" size={24} color="#FBBF24" />
            </View>
          </View>

          {/* Student Info Row */}
          <View style={styles.cardBody}>
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
            <View style={styles.studentDetails}>
              <Text style={styles.studentName}>{user.fullName}</Text>
              <View style={styles.idBadge}>
              <Text style={styles.idBadgeText} selectable>
                MSSV: {user.studentId}
              </Text>
              </View>
              <Text style={styles.majorText}>Chuyên ngành: {user.major}</Text>
              <Text style={styles.cohortText} selectable>
                {user.cohort} • {user.email}
              </Text>
            </View>
          </View>

          {/* Card Footer Bar */}
          <View style={styles.cardFooter}>
            <Text style={styles.cardFooterText}>THẺ SINH VIÊN KỸ THUẬT SỐ • STUDENT PASS</Text>
            <Ionicons name="wifi" size={16} color="rgba(255, 255, 255, 0.7)" />
          </View>
        </View>
      </View>

      {/* Booking Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Thống kê hoạt động học tập</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Ionicons name="time" size={24} color={THEME.colors.primaryLight} />
            <Text style={styles.statVal}>{hours} Giờ</Text>
            <Text style={styles.statSub}>Đã học & nghiên cứu</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="checkmark-done-circle" size={24} color={THEME.colors.available} />
            <Text style={styles.statVal}>{mine.length} Lượt</Text>
            <Text style={styles.statSub}>Tổng lịch mượn phòng</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="hourglass" size={24} color={THEME.colors.reserved} />
            <Text style={styles.statVal}>{confirmedCount} Lịch</Text>
            <Text style={styles.statSub}>Đang chờ vào phòng</Text>
          </View>
        </View>
      </View>

      {/* Campus Rules & Guidelines */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Quy chế sử dụng phòng học VKU</Text>
        <View style={styles.rulesCard}>
          <View style={styles.ruleItem}>
            <Ionicons name="checkmark-circle-outline" size={18} color={THEME.colors.available} />
            <Text style={styles.ruleText}>
              Mỗi sinh viên được đăng ký tối đa 2 ca học/ngày để nhường quyền ưu tiên cho các nhóm khác.
            </Text>
          </View>
          <View style={styles.ruleItem}>
            <Ionicons name="scan-outline" size={18} color={THEME.colors.primaryLight} />
            <Text style={styles.ruleText}>
              Quét mã QR tại cửa phòng trước giờ học ít nhất 10 phút để điểm danh tự động.
            </Text>
          </View>
          <View style={styles.ruleItem}>
            <Ionicons name="warning-outline" size={18} color={THEME.colors.reserved} />
            <Text style={styles.ruleText}>
              Nếu không sử dụng, vui lòng hủy phòng trước 30 phút để giải phóng slot cho sinh viên khác.
            </Text>
          </View>
        </View>
      </View>

      {/* Architecture & Tech Stack Details */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Thông tin Nền tảng Ứng dụng</Text>
        <View style={styles.techCard}>
          <View style={styles.techRow}>
            <Text style={styles.techKey}>Framework:</Text>
            <Text style={styles.techVal}>React Native & Expo Managed SDK 57</Text>
          </View>
          <View style={styles.techRow}>
            <Text style={styles.techKey}>Runtime Architecture:</Text>
            <Text style={styles.techVal}>Hermes Bytecode + Fabric Renderer + JSI</Text>
          </View>
          <View style={styles.techRow}>
            <Text style={styles.techKey}>State Management:</Text>
            <Text style={styles.techVal}>Zustand (Client State Engine)</Text>
          </View>
          <View style={styles.techRow}>
            <Text style={styles.techKey}>Navigation:</Text>
            <Text style={styles.techVal}>React Navigation 7 (Stack + Tabs)</Text>
          </View>
          <View style={styles.techRow}>
            <Text style={styles.techKey}>Database:</Text>
            <Text style={styles.techVal} selectable>
              Cloudflare KV
            </Text>
          </View>
          <View style={styles.techRow}>
            <Text style={styles.techKey}>Domain:</Text>
            <Text style={styles.techVal} selectable>
              vku-room-booking.pages.dev
            </Text>
          </View>
          <View style={styles.techRow}>
            <Text style={styles.techKey}>Đăng nhập:</Text>
            <Text style={styles.techVal}>{getProviderLabel(session.provider)}</Text>
          </View>
          <View style={styles.techRow}>
            <Text style={styles.techKey}>Safe Area Handling:</Text>
            <Text style={styles.techVal}>react-native-safe-area-context</Text>
          </View>
          <View style={styles.techRow}>
            <Text style={styles.techKey}>Bản quyền:</Text>
            <Text style={styles.techVal}>Khoa Khoa học Máy tính - VKU</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Kịch bản demo (chấm bài)</Text>
        <View style={styles.rulesCard}>
          <Text style={styles.ruleText}>
            Tài khoản mặc định: Nguyễn Văn Duy — 23IT038 — abc@vku.udn.vn. Mật khẩu: {DEMO_PASSWORD}.
          </Text>
          <Text style={styles.ruleText}>
            Thử: đặt trùng ca với phòng khác, đặt slot Huy đang giữ, vượt 2 ca/ngày, đặt ca đã qua, hủy sát giờ, phòng bảo trì Lab Vi mạch.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color="#FFFFFF" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </Pressable>
      </View>

      <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  flex: {
    flex: 1,
  },
  cardWrapper: {
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.lg,
  },
  idCard: {
    backgroundColor: THEME.colors.primary,
    borderRadius: 18,
    padding: 16,
    ...THEME.shadows.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.15)',
  },
  cardBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  vkuLogo: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  vkuLogoText: {
    color: THEME.colors.primary,
    fontWeight: '900',
    fontSize: 14,
  },
  cardUniversity: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardFaculty: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 9,
    fontWeight: '500',
  },
  chipGraphic: {
    opacity: 0.8,
  },
  cardBody: {
    flexDirection: 'row',
    gap: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  idBadge: {
    backgroundColor: THEME.colors.primaryLight,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginVertical: 4,
  },
  idBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  majorText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 11,
    fontWeight: '500',
  },
  cohortText: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 10,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
  },
  cardFooterText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: THEME.spacing.lg,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.text,
    marginBottom: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: THEME.colors.surface,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.sm,
  },
  statVal: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.text,
    marginTop: 6,
  },
  statSub: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  rulesCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    gap: 12,
  },
  ruleItem: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  ruleText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  techCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    gap: 8,
  },
  techRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  techKey: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    fontWeight: '600',
  },
  techVal: {
    fontSize: 11,
    color: THEME.colors.text,
    fontWeight: '700',
    flexShrink: 1,
    textAlign: 'right',
    maxWidth: '62%',
  },
  logoutBtn: {
    backgroundColor: THEME.colors.occupied,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
});
