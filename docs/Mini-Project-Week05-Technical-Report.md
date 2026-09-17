# Mini-Project 1 Short Technical Report | VKU Room Booking | VKU

**Course:** Cross-Platform Mobile App Development  
**Week:** 5 — React Native (Expo)  
**Student:** Nguyễn Văn Duy · 23IT038 · abc@vku.udn.vn  
**Live:** https://vku-room-booking.pages.dev/  
**Repo:** https://github.com/minhduy6868/mob-lab-room-booking  
**Date:** 17/09/2026

---

## 1. PROJECT OVERVIEW

VKU Room Booking is a campus study-room reservation app. Students browse 22 rooms (labs, seminar, library, smart classroom), pick a date (today / tomorrow) and a slot, then persist the booking on Cloudflare KV so every client sees the same occupancy.

The assignment stack is Expo / React Native (SDK 57) with a web export on Cloudflare Pages — the same free-host pattern as the Week 3 Trovey PWA (`*.pages.dev` + KV).

Demo account (pre-filled): **Nguyễn Văn Duy / 23IT038 / abc@vku.udn.vn**, password `vku@2026`.

## 2. FUNCTIONAL SCOPE

| Area | Behavior |
|---|---|
| Auth | Email `@vku.udn.vn` (and alias `minhduyy.id.vn`). Google UI hidden. |
| Browse | Search, type / building / availability chips, card grid |
| Book | Slot picker, purpose, conflict rules, booking code + QR pass |
| My bookings | Cancel (≥ 30 min before), check-in (≥ 10 min before start) |
| Profile | Hours, counts, logout (`window.confirm` on web) |
| Realtime | Poll `GET /api/bookings` every 2.5s after login |

## 3. TECHNICAL ARCHITECTURE

```
Expo App (RN Web / iOS / Android)
  Zustand  ──login──►  POST /api/auth
  Zustand  ──CRUD──►   GET|POST|PUT /api/bookings
                         │
Cloudflare Pages Functions
  functions/api/health.js
  functions/api/auth.js
  functions/api/bookings.js  →  KV VKU_BOOKINGS
```

Directory map:

```
App.tsx                      Font boot + splash + NavigationContainer
src/navigation/              Root stack (Login | Main tabs)
src/screens/                 Login, BrowseRooms, MyBookings, Profile
src/store/useAuthStore.ts    Session persist
src/store/useBookingStore.ts Cloud hydrate / book / cancel / check-in
src/lib/booking-rules.ts     Client conflict engine
src/lib/time.ts              VN timezone slot past/finished
functions/_lib/rules.js      Same rules on the server (409)
functions/_lib/store.js      KV list/put + seed Minh & Huy
scripts/prepare-pages.cjs    Rename _expo → bundle; flatten Ionicons .ttf
wrangler.toml                Pages + KV id
```

State flow: login → `hydrateFromCloud()` → decorate slots from KV records → `POST /api/bookings` → 200 + booking or 409 + Vietnamese error → refetch list. Occupancy is never “only on this phone”.

## 4. BOOKING CONFLICT RULES

Implemented in `evaluateBooking` / `evaluateCancel` / `evaluateCheckIn`:

1. Required name, student id (`22IT189` pattern), purpose ≥ 8 characters  
2. Room missing or `maintenance`  
3. Slot in the past (Asia/Ho_Chi_Minh)  
4. Slot already held by another student (`SLOT_OCCUPIED`)  
5. Same student already holds that room+slot  
6. Cross-room time overlap (`CROSS_ROOM_OVERLAP`)  
7. Daily cap 2 active slots (`DAILY_LIMIT`)  
8. Cancel only if ≥ 30 minutes remain  
9. Check-in window starts 10 minutes before the slot  

Seed data: Nguyễn Văn Minh holds Lab A3-101 ca 2; Lê Quốc Huy holds Library ca 1 — used to demo collisions.

## 5. WEB DEPLOY NOTES

Expo web puts Ionicons under `_expo/` and `node_modules/@expo/.../*.ttf`. Cloudflare treats `_` folders and SPA fallback as HTML, which broke every icon. `prepare-pages.cjs` copies fonts to `/assets/icon-fonts/` and the JS bundle to `/bundle/`. React Native `Alert.alert` on web ignores button `onPress`; confirm/cancel uses `window.confirm`.

## 6. HOW TO RUN / GRADE

```powershell
npm install
npx expo start --web
# or open https://vku-room-booking.pages.dev/
```

Login `abc@vku.udn.vn` / `vku@2026`. Book an empty slot. Retry an occupied seed slot — expect a conflict message. Logout and sign in again.

## 7. TECHNICAL CHALLENGES

**7.1 Icons missing on Pages**  
SPA `_redirects` `/* → index.html` served HTML for `.ttf` and `_expo` JS. Resolution: drop catch-all redirects, flatten assets.

**7.2 Logout / book confirm did nothing on web**  
`Alert.alert` is `window.alert`. Resolution: `src/lib/confirm.ts`.

**7.3 Night-time POST 409 past-slot**  
Correct: evening cannot book today’s finished ca. Use tomorrow on the date switcher.
