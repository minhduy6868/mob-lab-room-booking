# VKU Room Booking — Week 5 React Native

**Môn:** Cross-Platform Mobile App Development (VKU)  
**Sinh viên:** Nguyễn Văn Duy · 23IT038

**Live:** https://vku-room-booking.pages.dev/  
**Repo:** https://github.com/minhduy6868/mob-lab-room-booking

## Đề bài (Week 5 — React Native Part 1)

App đặt phòng học thông minh: danh sách phòng, tìm/lọc, đặt theo ca, xem lịch của tôi, hồ sơ sinh viên.

## Đã làm

- Expo SDK 57, TypeScript, React Navigation (Stack + Tabs)
- Safe Area, Ionicons (font load + flatten `.ttf` khi deploy web)
- Zustand persist phiên đăng nhập (SecureStore / localStorage)
- TanStack Query catalog phòng
- Cloudflare Pages Functions + KV: `GET/POST/PUT /api/bookings`, `POST /api/auth`, `GET /api/health`
- Poll KV ~2,5s khi đã vào app
- Email mặc định `abc@vku.udn.vn` (Duy / 23IT038)

## Demo

1. Mở live hoặc Expo Go
2. Đăng nhập `abc@vku.udn.vn` / `vku@2026`
3. Đặt một ca trống → mã QR / mã đặt chỗ
4. Thử ca đã kín hoặc trùng giờ → 409 + thông báo
5. Đăng xuất → về màn email
