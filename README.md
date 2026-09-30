# VKU Room Booking

**Môn:** Cross-Platform Mobile App Development (VKU)  
**Tuần 6:** React Native Part 2 — Navigation, State, Query, Animations  
**Sinh viên:** Nguyễn Minh Duy — 23IT038  
**Email demo:** abc@vku.udn.vn · mật khẩu `vku@2026`

Ứng dụng đặt phòng học, lab, thư viện trên campus VKU. Lịch đặt lưu Cloudflare KV. Sau khi đặt hoặc hủy, UI cập nhật từ response; máy khác kéo để làm mới hoặc mở lại màn lịch.

**Live (Week 6):** https://vku-room-booking-part2.pages.dev/  
**API health:** https://vku-room-booking-part2.pages.dev/api/health  
**Week 5:** https://vku-room-booking.pages.dev/  
**GitHub:** https://github.com/minhduy6868/mob-lab-room-booking  
**Báo cáo Mini-Project 2 (PDF):** [docs/Mini-Project-2-Technical-Report.pdf](docs/Mini-Project-2-Technical-Report.pdf)  
**Báo cáo tuần 5 (PDF):** [docs/Mini-Project-Week05-Technical-Report.pdf](docs/Mini-Project-Week05-Technical-Report.pdf)

---

## Chạy trên máy

```powershell
npm install
npx expo start
```

- Web: `npx expo start --web`
- Điện thoại: Expo Go, quét QR (`npx expo start --tunnel` nếu khác mạng)

## Đăng nhập (demo)

| | |
|---|---|
| Email | `abc@vku.udn.vn` |
| MSSV | 23IT038 |
| Họ tên | Nguyễn Minh Duy |
| Mật khẩu | `vku@2026` |

Tài khoản phụ (cùng mật khẩu) để thử trùng lịch: `minhnv.22it@vku.udn.vn`, `hanhtt.23it@vku.udn.vn`, `huylq.22ce@vku.udn.vn`.

## Yêu cầu tuần 6 đã hoàn thiện

- React Navigation 7: Root Stack + Bottom Tabs, typed params cho `RoomDetails` và `BookingConfirmation`
- Room Details push ngoài tab, Booking Confirmation trình bày dạng modal pass
- Zustand persist có chọn lọc cho cache bookings / rooms / filters; Cloudflare KV vẫn là nguồn đồng bộ chính
- TanStack Query cho room catalog và live bookings; booking POST/PUT cập nhật store/cache ngay, focus/reconnect refetch và pull-to-refresh thủ công
- AppAlertProvider thay browser/native alert rời rạc bằng modal thông báo/confirm thống nhất trong app
- Reanimated card entry/layout animation cho danh sách phòng
- Gesture Handler + Reanimated swipe-to-cancel trên thẻ lịch đặt
- TypeScript strict, FlatList windowing, memo `RoomCard`, Safe Area, Ionicons
- Bộ lọc tòa A/B/C/V, sức chứa 2–20, thiết bị (máy chiếu, bảng, PC, điều hòa) và thanh 7 ngày
- Nhắc check-in 15 phút trước ca trên iOS/Android qua `expo-notifications` (bản web không phát thông báo hệ điều hành)
- Zustand persist bằng `@react-native-async-storage/async-storage`

## Luật đặt phòng

- Một ca đã có người → không đặt thêm
- Sinh viên không đặt hai phòng cùng khung giờ (overlap)
- Tối đa 2 ca / ngày
- Không đặt ca đã qua; phòng bảo trì không đặt
- Hủy trước giờ bắt đầu ≥ 30 phút
- Check-in sớm nhất 10 phút trước ca

Luật chạy cả client (`src/lib/booking-rules.ts`) và server (`functions/_lib/rules.js`).

## Cấu trúc

```
App.tsx                 Font Ionicons, splash, AppAlertProvider, navigator
src/navigation/         Typed Root Stack + Bottom Tabs
src/screens/            Login, Browse, RoomDetails, BookingConfirmation, MyBookings, Profile
src/store/              Zustand auth + bookings → Cloudflare
src/lib/booking-rules.ts
functions/api/          health, bookings, auth (Pages Functions)
wrangler.toml           KV VKU_BOOKINGS
scripts/prepare-pages.cjs   Font + bundle path cho Pages
```

## Deploy Cloudflare Pages (free)

```powershell
npm run deploy
```

Host Week 6: `vku-room-booking-part2.pages.dev`. KV binding `VKU_BOOKINGS` (cùng namespace với bản Week 5).

Không commit file `.env`.
