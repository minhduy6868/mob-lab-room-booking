# Mini-Project 2 — Báo cáo ngắn | VKU Room Booking

**Môn:** Cross-Platform Mobile App Development  
**Tuần 6:** React Native Part 2 — Navigation, State, Query, Animations  
**Sinh viên:** Nguyễn Minh Duy · 23IT038 · abc@vku.udn.vn  
**Ngày kiểm tra:** 30/09/2026  
**Live Week 6:** https://vku-room-booking-part2.pages.dev/  
**Live Week 5:** https://vku-room-booking.pages.dev/  
**Repo:** https://github.com/minhduy6868/mob-lab-room-booking

## 1. Kết luận kiểm tra

Week 6 đã deploy lên https://vku-room-booking-part2.pages.dev/. Bundle production có `RoomDetails`, `BookingConfirmation`, `FadeInDown` và `Gesture.Pan`. Không còn timer 2,5 giây tải lịch. Bản tuần 5 giữ ở https://vku-room-booking.pages.dev/.

`GET /api/health` trên domain part2 trả `ok: true`, `kv: true`, `kvCount: 13`. GitHub chưa nhận commit Week 6 (`origin/main` vẫn ở `56ed666`).

## 2. Đối chiếu slide Week 6

| Yêu cầu slide | Code + domain part2 |
|---|---|
| Root Stack + Bottom Tabs | Có trên `vku-room-booking-part2.pages.dev`. Bundle có `RoomDetails` và `BookingConfirmation` |
| Param typed `roomId`, `roomName`, `bookingId` | Có trong `RootStackParamList` |
| Zustand + persist | Auth persist session; booking persist cache phòng/lịch/filter |
| TanStack Query + pull-to-refresh | Có trên Browse và My Bookings |
| Reanimated `FadeInDown` | Có trong bundle (`FadeInDown` xuất hiện 10 lần) |
| Gesture Handler swipe-to-cancel | Có `Gesture.Pan` trên thẻ lịch |
| Live demo + video 2–3 phút | Live đã có. Chưa có file video trong repo |
| GitHub public + README | Repo có. `origin/main` vẫn dừng ở commit tuần 5 `56ed666` |

## 3. Realtime: cái gì là thật

Code máy **không còn** `setInterval` tải lịch. Sau khi chính người dùng đặt, hủy hoặc check-in thành công, server trả booking và client ghi thẳng vào Zustand cùng cache TanStack Query (`setLiveBookingsCache`). Màn hình đổi ngay từ response đó, không đợi timer.

Đó không phải WebSocket, SSE hay Durable Object. Máy khác chỉ thấy lịch mới khi vào lại màn My Bookings, khi cửa sổ lấy focus, khi mạng nối lại, hoặc khi kéo refresh. Dòng header “Cloudflare KV realtime” đang nói quá.

KV `list()` còn eventually consistent: lần `GET` ngay sau `POST` thử nghiệm chưa thấy bản ghi; vài giây sau mới thấy và hủy được.

## 4. Việc còn lại trước khi nộp

1. Commit và push Week 6 lên GitHub.
2. Quay video 2–3 phút trên điện thoại thật (Expo Go) hoặc trên https://vku-room-booking-part2.pages.dev/.
3. Sửa header, bỏ chữ realtime nếu chưa có kênh push.
4. Xuất lại PDF sau khi GitHub khớp code máy.

## 5. Script demo khi đã deploy bản mới

1. Đăng nhập `abc@vku.udn.vn` / `vku@2026`.
2. Mở một room card → Room Details → đặt một ca trống.
3. Modal Booking Confirmation hiện mã QR.
4. My Bookings hiện lịch vừa đặt ngay sau response, không cần chờ 2,5 giây.
5. Vuốt trái thẻ lịch để hủy.
6. Thử ca đã kín → HTTP 409 và thông báo xung đột.
