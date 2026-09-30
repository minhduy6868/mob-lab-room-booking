# VKU Room Booking — Week 6 React Native Part 2

**Môn:** Cross-Platform Mobile App Development (VKU)  
**Sinh viên:** Nguyễn Văn Duy · 23IT038

**Live (Week 6):** https://vku-room-booking-part2.pages.dev/  
**Week 5:** https://vku-room-booking.pages.dev/  
**Repo:** https://github.com/minhduy6868/mob-lab-room-booking

## Đề bài (Week 6 — React Native Part 2)

Nâng cấp app đặt phòng học thông minh theo chủ đề Navigation, Zustand, TanStack Query, Reanimated và Gesture Handler.

## Đã làm

- Expo SDK 57, TypeScript, React Navigation (typed Root Stack + Bottom Tabs)
- Safe Area, Ionicons (font load + flatten `.ttf` khi deploy web)
- `RoomDetails` push ngoài tab và `BookingConfirmation` modal pass
- Zustand persist phiên đăng nhập và cache có chọn lọc cho bookings / rooms / filters
- TanStack Query catalog phòng + live bookings; cập nhật realtime store/cache sau POST/PUT, không polling interval
- AppAlertProvider cho confirm/notice chuẩn UI app thay browser alert
- Reanimated layout/entry animation cho room card
- Gesture Handler + Reanimated swipe-to-cancel cho booking card
- Cloudflare Pages Functions + KV: `GET/POST/PUT /api/bookings`, `POST /api/auth`, `GET /api/health`
- Focus/reconnect refetch + pull-to-refresh thủ công để đồng bộ lại Cloudflare KV khi cần
- Email mặc định `abc@vku.udn.vn` (Duy / 23IT038)

## Demo

1. Mở live hoặc Expo Go
2. Đăng nhập `abc@vku.udn.vn` / `vku@2026`
3. Chọn một room card → xem Room Details → đặt một ca trống
4. Booking Confirmation modal hiện mã QR / mã đặt chỗ
5. My Bookings tự cập nhật sau đặt/hủy/check-in; có thể kéo để đồng bộ lại thủ công, vuốt trái booking để hủy
6. Thử ca đã kín hoặc trùng giờ → 409 + thông báo
