"""A4 PDF report — same layout family as Trovey Mini-Project Short Technical Report."""

from __future__ import annotations

from pathlib import Path

from fpdf import FPDF

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "Mini-Project-Week05-Technical-Report.pdf"
FONT = Path(r"C:\Windows\Fonts\arial.ttf")
FONT_B = Path(r"C:\Windows\Fonts\arialbd.ttf")
FONT_I = Path(r"C:\Windows\Fonts\ariali.ttf")
EVIDENCE = Path(__file__).resolve().parent / "evidence"


class Report(FPDF):
    def header(self) -> None:
        if self.page_no() == 1:
            return
        self.set_font("Body", "I", 8)
        self.set_text_color(80, 80, 80)
        self.cell(0, 6, "Mini-Project Short Technical Report  |  VKU Room Booking  |  VKU", ln=1)
        self.set_draw_color(30, 58, 95)
        self.line(16, 12, 194, 12)
        self.ln(4)
        self.set_text_color(0, 0, 0)

    def footer(self) -> None:
        self.set_y(-12)
        self.set_font("Body", "", 8)
        self.set_text_color(90, 90, 90)
        self.cell(0, 8, f"{self.page_no()}", align="C")
        self.set_text_color(0, 0, 0)

    def h1(self, text: str) -> None:
        self.set_font("Body", "B", 11)
        self.ln(2)
        self.cell(0, 7, text, ln=1)
        self.set_draw_color(30, 58, 95)
        self.line(16, self.get_y(), 194, self.get_y())
        self.ln(3)

    def body(self, text: str) -> None:
        self.set_font("Body", "", 10)
        self.multi_cell(0, 5, text)
        self.ln(1)

    def kv(self, label: str, value: str) -> None:
        self.set_font("Body", "B", 10)
        self.cell(48, 6, f"{label}:")
        self.set_font("Body", "", 10)
        self.cell(0, 6, value, ln=1)


def table(pdf: Report, headers: list[str], rows: list[list[str]], widths: list[float]) -> None:
    pdf.set_font("Body", "B", 8)
    pdf.set_fill_color(30, 58, 95)
    pdf.set_text_color(255, 255, 255)
    for h, w in zip(headers, widths):
        pdf.cell(w, 7, h, border=1, fill=True, align="C")
    pdf.ln()
    pdf.set_text_color(0, 0, 0)
    pdf.set_font("Body", "", 8)
    fill = False
    for row in rows:
        heights = []
        for cell, w in zip(row, widths):
            heights.append(pdf.get_string_width(cell) / max(w - 2, 8))
        lines = max(1, int(max(heights)) + 1)
        h = max(8, lines * 4)
        x, y = pdf.get_x(), pdf.get_y()
        if y + h > 277:
            pdf.add_page()
            x, y = pdf.get_x(), pdf.get_y()
        for cell, w in zip(row, widths):
            pdf.set_fill_color(241, 245, 249)
            pdf.rect(x, y, w, h)
            if fill:
                pdf.rect(x, y, w, h, "F")
                pdf.rect(x, y, w, h)
            pdf.set_xy(x + 1, y + 1)
            pdf.multi_cell(w - 2, 3.6, cell)
            x += w
        pdf.set_xy(16, y + h)
        fill = not fill
    pdf.ln(3)


def try_shots() -> dict[str, Path]:
    shots: dict[str, Path] = {}
    EVIDENCE.mkdir(parents=True, exist_ok=True)
    live = "https://vku-room-booking.pages.dev/"
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        return shots
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=2)
            page.goto(live, wait_until="domcontentloaded", timeout=45000)
            page.wait_for_timeout(4000)
            path = EVIDENCE / "01-login.png"
            page.screenshot(path=path, full_page=False)
            shots["01-login"] = path

            page.fill("input", "abc@vku.udn.vn")
            inputs = page.locator("input")
            if inputs.count() >= 2:
                inputs.nth(1).fill("vku@2026")
            page.get_by_text("Đăng nhập", exact=True).first.click()
            page.wait_for_timeout(3500)
            path = EVIDENCE / "02-browse.png"
            page.screenshot(path=path, full_page=False)
            shots["02-browse"] = path
            browser.close()
    except Exception as exc:
        print("screenshot skip:", str(exc).encode("ascii", "replace").decode("ascii"))
        return shots


def pair_figures(pdf: Report, items: list[tuple[Path | None, str]]) -> None:
    paths = [(p, c) for p, c in items if p and p.exists()]
    if not paths:
        return
    if pdf.get_y() > 175:
        pdf.add_page()
    y0 = pdf.get_y()
    w = 82
    gap = 8
    x = 16
    img_h = 0.0
    for path, _ in paths[:2]:
        pdf.image(str(path), x=x, y=y0, w=w)
        try:
            from PIL import Image

            with Image.open(path) as im:
                img_h = w * im.size[1] / im.size[0]
        except Exception:
            img_h = 110
        x += w + gap
    pdf.set_y(y0 + min(img_h, 118) + 1)
    pdf.set_font("Body", "I", 8)
    x = 16
    y = pdf.get_y()
    for _, caption in paths[:2]:
        pdf.set_xy(x, y)
        pdf.multi_cell(w, 4, caption)
        x += w + gap
    pdf.ln(4)


def build(shots: dict[str, Path]) -> None:
    pdf = Report(format="A4", unit="mm")
    pdf.set_auto_page_break(auto=True, margin=16)
    pdf.set_left_margin(16)
    pdf.set_right_margin(16)
    pdf.add_font("Body", "", str(FONT))
    pdf.add_font("Body", "B", str(FONT_B))
    pdf.add_font("Body", "I", str(FONT_I))
    pdf.add_page()

    pdf.set_font("Body", "B", 16)
    pdf.multi_cell(0, 8, "MINI-PROJECT SHORT TECHNICAL REPORT")
    pdf.ln(1)
    pdf.set_font("Body", "", 10)
    meta = [
        ("Course", "Cross-Platform Mobile App Development (VKU)"),
        ("Mini-Project Title", "Mini-Project — Week 5 React Native (VKU Room Booking)"),
        ("Team / Student Name", "Nguyễn Văn Duy"),
        ("Submission Date", "17/09/2026"),
    ]
    for k, v in meta:
        pdf.kv(k, v)
    pdf.ln(2)

    pdf.h1("1. GENERAL INFORMATION & DELIVERABLE LINKS")
    pdf.set_font("Body", "B", 10)
    pdf.cell(0, 6, "Team Members:", ln=1)
    pdf.set_font("Body", "", 10)
    pdf.multi_cell(
        0,
        5,
        "1. Nguyễn Văn Duy — Student ID: 23IT038 — Role: Solo (UI, Expo, booking rules, Cloudflare KV) — Contribution: 100%",
    )
    pdf.ln(1)
    pdf.kv("Live Demo URL", "https://vku-room-booking.pages.dev/")
    pdf.kv("GitHub Repository", "https://github.com/minhduy6868/mob-lab-room-booking")
    pdf.kv("Video Demo", "Not submitted.")
    pdf.ln(1)
    pdf.body(
        "Demo login (pre-filled): email abc@vku.udn.vn — password vku@2026 — profile Nguyễn Văn Duy / 23IT038."
    )

    pdf.h1("2. FEATURE IMPLEMENTATION CHECKLIST")
    table(
        pdf,
        ["#", "Required Feature", "Status", "Implementation Details & Acceptance Level"],
        [
            [
                "1",
                "Expo / React Native app",
                "Complete",
                "SDK 57, RN 0.86, TypeScript. Stack + Tabs (React Navigation 7).",
            ],
            [
                "2",
                "Room list + search/filter",
                "Complete",
                "22 rooms, chips (type/building/status), Safe Area, Ionicons.",
            ],
            [
                "3",
                "Booking by time slot",
                "Complete",
                "Today/tomorrow, ca 1–5, purpose, booking code + QR pass.",
            ],
            [
                "4",
                "Overlap / conflict rules",
                "Complete",
                "Occupied slot, cross-room overlap, 2 slots/day, past slot, maintenance, cancel 30 min, check-in 10 min. Client + KV Functions.",
            ],
            [
                "5",
                "Auth + profile",
                "Complete",
                "Email @vku.udn.vn. Google button hidden. Zustand persist session.",
            ],
            [
                "6",
                "Cloud persistence",
                "Complete",
                "Cloudflare Pages Functions + KV VKU_BOOKINGS. GET/POST/PUT /api/bookings.",
            ],
            [
                "7",
                "HTTPS live deploy",
                "Complete",
                "https://vku-room-booking.pages.dev/  Health: /api/health",
            ],
            [
                "8",
                "Realtime occupancy",
                "Complete",
                "Poll KV every 2.5s after login so two clients share the same holds.",
            ],
        ],
        [10, 42, 22, 104],
    )

    pdf.h1("3. TECHNICAL ARCHITECTURE & PROJECT STRUCTURE")
    pdf.body(
        "Client is Expo (React Native Web on Pages, same codebase for Expo Go). "
        "useAuthStore and useBookingStore (Zustand) call Cloudflare. "
        "evaluateBooking runs on the device and again in functions/_lib/rules.js so a second browser cannot double-book."
    )
    pdf.body("Directory map:")
    pdf.set_font("Body", "", 9)
    pdf.multi_cell(
        0,
        4.4,
        "App.tsx                      Font boot (Ionicons) + splash + NavigationContainer\n"
        "src/screens/                 Login, BrowseRooms, MyBookings, Profile\n"
        "src/store/useAuthStore.ts    Session persist (SecureStore / localStorage)\n"
        "src/store/useBookingStore.ts hydrate / book / cancel / check-in\n"
        "src/lib/booking-rules.ts     Conflict engine (client)\n"
        "functions/api/bookings.js    GET list, POST create, PUT cancel|checkin\n"
        "functions/api/auth.js        Email demo abc@vku.udn.vn\n"
        "functions/_lib/store.js      KV prefix + seed Minh & Huy\n"
        "scripts/prepare-pages.cjs    bundle/ + icon-fonts for Pages\n"
        "wrangler.toml                KV binding VKU_BOOKINGS",
    )
    pdf.ln(2)
    pdf.body(
        "State flow: login -> hydrateFromCloud() -> decorateSlots from KV -> POST /api/bookings -> "
        "200 + bookingCode or 409 + Vietnamese message -> refetch. Occupancy is not local-only."
    )
    pdf.body(
        "Exception handling: Functions return JSON { ok:false, error }. The UI shows the error on the booking sheet. "
        "A write is accepted only after KV putBooking. Seed rows (Minh ca 2 Lab A3-101, Huy ca 1 Library) stay as collision fixtures."
    )

    pdf.h1("4. EMPIRICAL EVIDENCE & SCREENSHOTS")
    pdf.body(
        "Live host https://vku-room-booking.pages.dev/ on a 390x844 viewport. Captured 17/09/2026 if Chromium was available."
    )
    pair_figures(
        pdf,
        [
            (shots.get("01-login"), "Figure 1. Login: abc@vku.udn.vn pre-filled, Google hidden."),
            (shots.get("02-browse"), "Figure 2. Browse rooms after email login (Cloudflare KV occupancy)."),
        ],
    )
    if not shots:
        pdf.body(
            "Screenshot capture was skipped in this build environment. Grade against the live URL: "
            "login abc@vku.udn.vn / vku@2026, book an empty slot, retry a seeded occupied slot (409)."
        )

    pdf.h1("5. TECHNICAL CHALLENGES & RESOLUTIONS")
    pdf.set_font("Body", "B", 10)
    pdf.cell(0, 6, "5.1 Ionicons missing on Cloudflare Pages", ln=1)
    pdf.body(
        "Expo web emits _expo/static/js and fonts under node_modules/@expo/.../*.ttf. Pages reserved _* paths and "
        "SPA rewrite /* -> index.html served HTML for JS/TTF, so every icon broke. "
        "Change: scripts/prepare-pages.cjs renames _expo to /bundle, copies hashed fonts to /assets/icon-fonts/, "
        "and does not install a catch-all 200 rewrite."
    )
    pdf.set_font("Body", "B", 10)
    pdf.cell(0, 6, "5.2 Logout and booking confirm did nothing on web", ln=1)
    pdf.body(
        "React Native Alert.alert on web is window.alert; button onPress is ignored. "
        "Change: src/lib/confirm.ts uses window.confirm on EXPO_OS === web."
    )
    pdf.set_font("Body", "B", 10)
    pdf.cell(0, 6, "5.3 POST /api/bookings 409 past-slot at night", ln=1)
    pdf.body(
        "Correct rule: Asia/Ho_Chi_Minh, a finished ca cannot be booked. Use the Tomorrow date chip to demo a live reservation after hours."
    )

    OUT.parent.mkdir(parents=True, exist_ok=True)
    pdf.output(str(OUT))
    print(f"Wrote {OUT}  bytes={OUT.stat().st_size}")


if __name__ == "__main__":
    shots = try_shots()
    print("shots", sorted(shots))
    build(shots)
