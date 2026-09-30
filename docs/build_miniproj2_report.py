"""A4 PDF — same plain layout as the Week 5 short technical report."""

from __future__ import annotations

from pathlib import Path

from fpdf import FPDF

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "Mini-Project-2-Technical-Report.pdf"
FONT = Path(r"C:\Windows\Fonts\arial.ttf")
FONT_B = Path(r"C:\Windows\Fonts\arialbd.ttf")
FONT_I = Path(r"C:\Windows\Fonts\ariali.ttf")
EVIDENCE = Path(__file__).resolve().parent / "evidence"
LIVE = "https://vku-room-booking-part2.pages.dev/"


class Report(FPDF):
    def header(self) -> None:
        if self.page_no() == 1:
            return
        self.set_font("Body", "I", 8)
        self.set_text_color(80, 80, 80)
        self.cell(0, 6, "Mini-Project 2 Short Technical Report  |  VKU Room Booking  |  VKU", ln=1)
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
        self.ln(1)
        self.cell(0, 7, text, ln=1)
        self.set_draw_color(30, 58, 95)
        self.line(16, self.get_y(), 194, self.get_y())
        self.ln(2)

    def body(self, text: str) -> None:
        self.set_font("Body", "", 10)
        self.multi_cell(0, 4.6, text)
        self.ln(1)

    def kv(self, label: str, value: str) -> None:
        self.set_font("Body", "B", 10)
        self.cell(46, 5.5, f"{label}:")
        self.set_font("Body", "", 10)
        self.cell(0, 5.5, value, ln=1)


def table(pdf: Report, headers: list[str], rows: list[list[str]], widths: list[float]) -> None:
    pdf.set_font("Body", "B", 8)
    pdf.set_fill_color(30, 58, 95)
    pdf.set_text_color(255, 255, 255)
    for header, width in zip(headers, widths):
        pdf.cell(width, 6, header, border=1, fill=True, align="C")
    pdf.ln()
    pdf.set_text_color(0, 0, 0)
    pdf.set_font("Body", "", 8)
    for index, row in enumerate(rows):
        lines = 1
        for cell, width in zip(row, widths):
            lines = max(lines, int(pdf.get_string_width(cell) / max(width - 2, 8)) + 1)
        height = max(7, lines * 3.6)
        if pdf.get_y() + height > 280:
            pdf.add_page()
        x, y = pdf.get_x(), pdf.get_y()
        pdf.set_fill_color(241, 245, 249 if index % 2 else 255)
        if index % 2 == 0:
            pdf.set_fill_color(255, 255, 255)
        else:
            pdf.set_fill_color(241, 245, 249)
        for cell, width in zip(row, widths):
            pdf.rect(x, y, width, height, "DF")
            pdf.set_xy(x + 1, y + 1)
            pdf.multi_cell(width - 2, 3.4, cell)
            x += width
        pdf.set_xy(16, y + height)
    pdf.ln(2)


def try_shots() -> dict[str, Path]:
    shots: dict[str, Path] = {}
    EVIDENCE.mkdir(parents=True, exist_ok=True)
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        return shots
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(channel="chrome", headless=True)
            page = browser.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=2)
            page.goto(LIVE, wait_until="domcontentloaded", timeout=45000)
            page.get_by_text("Đăng nhập", exact=True).first.wait_for(timeout=20000)
            path = EVIDENCE / "mp2-01-login.png"
            page.screenshot(path=path, clip={"x": 0, "y": 0, "width": 390, "height": 520})
            shots["login"] = path

            page.get_by_text("Đăng nhập", exact=True).first.click()
            page.get_by_text("7 ngày", exact=False).first.wait_for(timeout=20000)
            page.wait_for_timeout(1200)
            path = EVIDENCE / "mp2-02-browse.png"
            page.screenshot(path=path, clip={"x": 0, "y": 0, "width": 390, "height": 520})
            shots["browse"] = path

            page.get_by_text("Lab A3-101", exact=False).first.click()
            slots = page.get_by_text("Lịch ca học", exact=False).first
            slots.wait_for(timeout=15000)
            slots.scroll_into_view_if_needed()
            page.wait_for_timeout(500)
            path = EVIDENCE / "mp2-03-details.png"
            page.screenshot(path=path, clip={"x": 0, "y": 0, "width": 390, "height": 640})
            shots["details"] = path

            back = page.locator('[aria-label="Go back"], [aria-label="Back"], [data-testid="header-back"]')
            if back.count() > 0:
                back.first.click()
            else:
                page.mouse.click(28, 32)
            page.get_by_text("Lịch của tôi", exact=True).first.wait_for(timeout=10000)
            page.get_by_text("Lịch của tôi", exact=True).first.click()
            page.get_by_text("Có hiệu lực", exact=False).first.click()
            page.wait_for_timeout(800)
            path = EVIDENCE / "mp2-04-bookings.png"
            page.screenshot(path=path, clip={"x": 0, "y": 0, "width": 390, "height": 640})
            shots["bookings"] = path
            browser.close()
    except Exception as exc:
        print("screenshot skip:", str(exc).encode("ascii", "replace").decode("ascii"))
    return shots


def pair_figures(pdf: Report, items: list[tuple[Path | None, str]]) -> None:
    paths = [(path, caption) for path, caption in items if path and path.exists()]
    if not paths:
        return
    if pdf.get_y() > 200:
        pdf.add_page()
    y0 = pdf.get_y()
    shot_h = 78
    gap = 8
    x = 16
    from PIL import Image

    sizes = []
    for path, _caption in paths[:2]:
        with Image.open(path) as image:
            sizes.append(shot_h * image.size[0] / image.size[1])
    for (path, _caption), shot_w in zip(paths[:2], sizes):
        pdf.image(str(path), x=x, y=y0, w=shot_w, h=shot_h)
        x += shot_w + gap
    pdf.set_y(y0 + shot_h + 1)
    pdf.set_font("Body", "I", 8)
    y = pdf.get_y()
    x = 16
    for (_path, caption), shot_w in zip(paths[:2], sizes):
        pdf.set_xy(x, y)
        pdf.multi_cell(shot_w, 3.6, caption)
        x += shot_w + gap
    pdf.set_y(y + 10)


def build(shots: dict[str, Path]) -> None:
    pdf = Report(format="A4", unit="mm")
    pdf.set_auto_page_break(auto=True, margin=14)
    pdf.set_left_margin(16)
    pdf.set_right_margin(16)
    pdf.add_font("Body", "", str(FONT))
    pdf.add_font("Body", "B", str(FONT_B))
    pdf.add_font("Body", "I", str(FONT_I))
    pdf.add_page()

    pdf.set_font("Body", "B", 15)
    pdf.multi_cell(0, 7, "MINI-PROJECT 2 SHORT TECHNICAL REPORT")
    pdf.ln(1)
    for label, value in [
        ("Course", "Cross-Platform Mobile App Development (VKU)"),
        ("Title", "Real-time Study Room Booking App (React Native & Expo)"),
        ("Weeks", "5-6    Weight: 10%"),
        ("Student", "Nguyễn Văn Duy — 23IT038 — abc@vku.udn.vn"),
        ("Date", "30/09/2026"),
    ]:
        pdf.kv(label, value)
    pdf.ln(1)

    pdf.h1("1. GENERAL INFORMATION & DELIVERABLE LINKS")
    pdf.body(
        "Solo project. Nguyễn Văn Duy (23IT038) built the Expo app, booking rules, Cloudflare KV API, and this report. Contribution: 100%."
    )
    pdf.kv("Live Demo URL", "https://vku-room-booking-part2.pages.dev/")
    pdf.kv("API health", "https://vku-room-booking-part2.pages.dev/api/health")
    pdf.kv("GitHub", "https://github.com/minhduy6868/mob-lab-room-booking")
    pdf.kv("Video", "Not recorded. The live URL is the demo deliverable.")
    pdf.body(
        "Demo login is pre-filled: abc@vku.udn.vn / vku@2026 (Nguyễn Văn Duy, 23IT038). "
        "Week 5 remains at https://vku-room-booking.pages.dev/. Week 6 is the part2 host above."
    )

    pdf.h1("2. FEATURE IMPLEMENTATION CHECKLIST")
    table(
        pdf,
        ["#", "Required feature", "Status", "Where it lives"],
        [
            [
                "1",
                "Room feed: photo, building/floor, capacity, Available vs Occupied",
                "Complete",
                "FlatList in BrowseRoomsScreen. RoomCard is memoized. windowSize 5, initialNumToRender 10. Status comes from KV bookings for the selected day.",
            ],
            [
                "2",
                "Search and chips: building A/B/C/V, capacity 2-20, equipment",
                "Complete",
                "Search matches name, building, amenity, description. Chips: type, building (A, B, C, V, library, dorm), capacity 2-20 or over 20, projector / whiteboard / high-spec PC / AC, available vs full.",
            ],
            [
                "3",
                "7-day selector and 2-hour slots with conflicts disabled",
                "Complete",
                "DateStrip shows 7 days. Slots: 07:30-09:30, 09:45-11:45, 13:00-15:00, 15:15-17:15, 17:30-19:30, 19:45-21:45. Occupied, past, overlap, daily limit (2), and maintenance slots are disabled. Rules run in booking-rules.ts and functions/_lib/rules.js.",
            ],
            [
                "4",
                "Booking pass with QR check-in",
                "Complete",
                "POST /api/bookings returns a booking code. BookingConfirmation is a modal pass. QRCodePassModal opens from My Bookings. Check-in is allowed from 10 minutes before the slot.",
            ],
            [
                "5",
                "Zustand: session, reservations, filters, cancel",
                "Complete",
                "useAuthStore holds the session. useBookingStore holds bookings, date, filters, book, cancel, and check-in. TanStack Query holds the room catalog and the live booking cache.",
            ],
            [
                "6",
                "Persist with AsyncStorage",
                "Complete",
                "Zustand persist uses @react-native-async-storage/async-storage (localStorage on web). Auth session and booking/filter cache are restored on the next launch. KV remains the source of truth.",
            ],
            [
                "7",
                "Check-in reminder 15 minutes before the slot",
                "Complete on device",
                "expo-notifications schedules a local alert 15 minutes before start and cancels it if the booking is cancelled. The Pages web demo does not show an OS notification; Expo Go / a dev build does.",
            ],
            [
                "8",
                "Navigation, motion, list performance",
                "Complete",
                "Root stack + bottom tabs. Typed params for RoomDetails and BookingConfirmation. Reanimated FadeInDown on cards. Swipe-left cancel uses Gesture Handler.",
            ],
        ],
        [8, 48, 28, 94],
    )

    pdf.h1("3. TECHNICAL ARCHITECTURE")
    pdf.body(
        "One Expo SDK 57 TypeScript app. Web export is hosted on Cloudflare Pages. The same screens run in Expo Go. "
        "A booking is accepted only after Pages Functions write Cloudflare KV. The client then upserts that record into Zustand and the TanStack Query cache, so the open session updates from the response. "
        "Another browser sees the change on focus, reconnect, or pull-to-refresh. There is no 2.5 second poll and no WebSocket."
    )
    pdf.set_font("Body", "", 9)
    pdf.multi_cell(
        0,
        4.2,
        "App.tsx                         Navigation, Query, alerts; notification handler on iOS/Android\n"
        "src/navigation/                Root stack + tabs; RoomDetails; BookingConfirmation modal\n"
        "src/screens/                   Login, Browse, RoomDetails, MyBookings, Profile\n"
        "src/store/useAuthStore.ts      Session\n"
        "src/store/useBookingStore.ts   Filters, book, cancel, check-in, reminder hook\n"
        "src/lib/booking-rules.ts       Conflict engine (client)\n"
        "src/lib/reminders.ts           15-minute local notification\n"
        "src/lib/storage.ts             AsyncStorage adapter\n"
        "functions/api/bookings.js      GET, POST, PUT cancel|checkin\n"
        "functions/_lib/rules.js        Same conflict rules on the server\n"
        "wrangler.toml                  KV binding VKU_BOOKINGS",
    )
    pdf.ln(1)
    pdf.body(
        "Flow: login -> hydrate bookings from GET /api/bookings -> pick a day and a free slot -> POST /api/bookings. "
        "The server returns 200 plus a booking code, or 409 plus a Vietnamese conflict message. "
        "Cancel is PUT with action cancel, and is refused inside 30 minutes of the start time."
    )

    pdf.h1("4. SCREENSHOTS")
    pdf.body(
        "Captured from https://vku-room-booking-part2.pages.dev/ at 390x844 on 30/09/2026. Login used the pre-filled demo account."
    )
    pair_figures(
        pdf,
        [
            (shots.get("login"), "Figure 1. Login. Email abc@vku.udn.vn and password are pre-filled."),
            (shots.get("browse"), "Figure 2. Browse. 7-day strip, building/capacity/equipment chips, room cards."),
        ],
    )
    pair_figures(
        pdf,
        [
            (shots.get("details"), "Figure 3. Room details. Slot list disables occupied and past slots."),
            (shots.get("bookings"), "Figure 4. My Bookings. Pull to refresh. Swipe left cancels a valid booking."),
        ],
    )
    if len(shots) < 4:
        pdf.body("Some screenshots were not captured in this run. Use the live URL with the demo account above.")

    pdf.h1("5. NOTES")
    pdf.body(
        "GitHub origin/main is still the Week 5 commit (56ed666). The Week 6 app is what is deployed on the part2 URL. Push the local tree before the repository itself is graded."
    )
    pdf.body(
        "KV list() is briefly delayed after a write, so a second device can miss a booking for a few seconds until focus or pull-to-refresh. "
        "The web host cannot fire expo-notifications; the reminder code runs on iOS and Android."
    )

    OUT.parent.mkdir(parents=True, exist_ok=True)
    pdf.output(str(OUT))
    print(f"Wrote {OUT} bytes={OUT.stat().st_size} pages={pdf.page_no()}")


if __name__ == "__main__":
    shots = try_shots()
    print("shots", sorted(shots))
    build(shots)
