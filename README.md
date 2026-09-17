# VKU Room Booking

**Môn:** Cross-Platform Mobile App Development (VKU)  
**Tuần 5:** React Native / Expo  
**Sinh viên:** Nguyễn Văn Duy — 23IT038  
**Email demo:** abc@vku.udn.vn · mật khẩu `vku@2026`

Ứng dụng đặt phòng học, lab, thư viện trên campus VKU. Lịch đặt lưu Cloudflare KV, đồng bộ realtime trên web.

**Live:** https://vku-room-booking.pages.dev/  
**API health:** https://vku-room-booking.pages.dev/api/health  
**GitHub:** https://github.com/minhduy6868/mob-lab-room-booking  
**Báo cáo:** [docs/Mini-Project-Week05-Technical-Report.md](docs/Mini-Project-Week05-Technical-Report.md)

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
| Họ tên | Nguyễn Văn Duy |
| Mật khẩu | `vku@2026` |

Tài khoản phụ (cùng mật khẩu) để thử trùng lịch: `minhnv.22it@vku.udn.vn`, `hanhtt.23it@vku.udn.vn`, `huylq.22ce@vku.udn.vn`.

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
App.tsx                 Font Ionicons, splash, navigator
src/screens/            Login, Browse, MyBookings, Profile
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

Host: `vku-room-booking.pages.dev`. KV binding `VKU_BOOKINGS`.

Không commit file `.env`.
