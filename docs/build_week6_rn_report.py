from __future__ import annotations

from pathlib import Path

from fpdf import FPDF

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "Mini-Project-Week06-Technical-Report.pdf"
FONT = Path(r"C:\Windows\Fonts\arial.ttf")
FONT_B = Path(r"C:\Windows\Fonts\arialbd.ttf")
FONT_I = Path(r"C:\Windows\Fonts\ariali.ttf")


class Report(FPDF):
    def header(self) -> None:
        if self.page_no() == 1:
            return
        self.set_font("Body", "I", 8)
        self.set_text_color(80, 80, 80)
        self.cell(0, 6, "Mini-Project 2 Technical Report | VKU Room Booking | Week 6", ln=1)
        self.set_draw_color(30, 58, 95)
        self.line(16, 12, 194, 12)
        self.ln(4)
        self.set_text_color(0, 0, 0)

    def footer(self) -> None:
        self.set_y(-12)
        self.set_font("Body", "", 8)
        self.set_text_color(90, 90, 90)
        self.cell(0, 8, str(self.page_no()), align="C")
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
        self.cell(46, 6, f"{label}:")
        self.set_font("Body", "", 10)
        self.cell(0, 6, value, ln=1)


def table(pdf: Report, headers: list[str], rows: list[list[str]], widths: list[float]) -> None:
    pdf.set_font("Body", "B", 8)
    pdf.set_fill_color(30, 58, 95)
    pdf.set_text_color(255, 255, 255)
    for header, width in zip(headers, widths):
        pdf.cell(width, 7, header, border=1, fill=True, align="C")
    pdf.ln()
    pdf.set_text_color(0, 0, 0)
    pdf.set_font("Body", "", 8)
    for index, row in enumerate(rows):
        max_lines = 1
        for cell, width in zip(row, widths):
            max_lines = max(max_lines, int(pdf.get_string_width(cell) / max(width - 2, 8)) + 1)
        height = max(8, max_lines * 4)
        if pdf.get_y() + height > 277:
            pdf.add_page()
        x, y = pdf.get_x(), pdf.get_y()
        if index % 2 == 1:
            pdf.set_fill_color(241, 245, 249)
        else:
            pdf.set_fill_color(255, 255, 255)
        for cell, width in zip(row, widths):
            pdf.rect(x, y, width, height, "DF")
            pdf.set_xy(x + 1, y + 1)
            pdf.multi_cell(width - 2, 3.6, cell)
            x += width
        pdf.set_xy(16, y + height)
    pdf.ln(3)


def build() -> None:
    pdf = Report(format="A4", unit="mm")
    pdf.set_auto_page_break(auto=True, margin=16)
    pdf.set_left_margin(16)
    pdf.set_right_margin(16)
    pdf.add_font("Body", "", str(FONT))
    pdf.add_font("Body", "B", str(FONT_B))
    pdf.add_font("Body", "I", str(FONT_I))
    pdf.add_page()

    pdf.set_font("Body", "B", 16)
    pdf.multi_cell(0, 8, "MINI-PROJECT 2 SHORT TECHNICAL REPORT")
    pdf.ln(1)
    for label, value in [
        ("Course", "Cross-Platform Mobile App Development (VKU)"),
        ("Topic", "Week 6 - React Native Part 2: Navigation, State, Query, Animations"),
        ("Student", "Nguyễn Văn Duy - 23IT038 - abc@vku.udn.vn"),
        ("Submission Date", "30/09/2026"),
        ("Live Demo", "https://vku-room-booking.pages.dev/"),
        ("Repository", "https://github.com/minhduy6868/mob-lab-room-booking"),
    ]:
        pdf.kv(label, value)

    pdf.h1("1. PROJECT OVERVIEW")
    pdf.body(
        "VKU Room Booking is a campus room reservation app for labs, seminar rooms, library spaces, "
        "makerspaces and smart classrooms. Week 6 upgrades the Week 5 app with typed navigation, "
        "separated client/server state, realtime cache sync, native-feeling alerts, Reanimated motion and native gestures."
    )
    pdf.body("Demo account: abc@vku.udn.vn / vku@2026 (Nguyễn Văn Duy - 23IT038).")

    pdf.h1("2. WEEK 6 IMPLEMENTATION CHECKLIST")
    table(
        pdf,
        ["Requirement", "Status", "Implementation"],
        [
            [
                "Root Stack + Bottom Tabs",
                "Complete",
                "RootNavigator owns Login, Main tabs, RoomDetails and BookingConfirmation modal.",
            ],
            [
                "Type-safe route params",
                "Complete",
                "RootStackParamList defines RoomDetails { roomId, roomName } and BookingConfirmation { bookingId }.",
            ],
            [
                "Zustand persist",
                "Complete",
                "Auth session persists; booking store persists selected rooms/bookings/filter cache while KV stays authoritative.",
            ],
            [
                "TanStack Query realtime sync",
                "Complete",
                "Live bookings upsert into Zustand and Query cache after POST/PUT; focus/reconnect and pull refresh reconcile KV.",
            ],
            [
                "In-app alert UI",
                "Complete",
                "AppAlertProvider replaces browser/native alerts with one polished notice/confirm modal.",
            ],
            [
                "Reanimated animations",
                "Complete",
                "Room cards use FadeInDown, FadeOutUp and Layout.springify for polished list transitions.",
            ],
            [
                "Gesture Handler",
                "Complete",
                "BookingCard supports swipe-left cancel with Gesture.Pan, shared values and runOnJS.",
            ],
            [
                "Code quality",
                "Complete",
                "Strict TypeScript, typed navigation, memoized RoomCard, FlatList windowing and Safe Area setup.",
            ],
        ],
        [42, 22, 114],
    )

    pdf.h1("3. NAVIGATION ARCHITECTURE")
    pdf.set_font("Body", "", 9)
    pdf.multi_cell(
        0,
        4.5,
        "NavigationContainer\n"
        "└── Root Stack\n"
        "    ├── Login\n"
        "    ├── Main Tabs\n"
        "    │   ├── Browse\n"
        "    │   ├── Bookings\n"
        "    │   └── Profile\n"
        "    ├── RoomDetails\n"
        "    └── BookingConfirmation (modal)",
    )
    pdf.ln(2)
    pdf.body(
        "RoomDetails is pushed above the tab navigator so the tab bar is hidden. BookingConfirmation is "
        "presented as a modal digital pass after POST /api/bookings succeeds."
    )

    pdf.h1("4. STATE AND DATA FLOW")
    pdf.body(
        "Zustand handles client state: auth session, selected date/filter, selected modal room, selected QR pass "
        "and cached bookings. TanStack Query handles server state: room catalog and live booking records. "
        "Cloudflare Pages Functions with KV remain the source of truth for conflict validation, cancellation and check-in."
    )
    pdf.body(
        "The app no longer polls KV on a timer. Successful POST/PUT responses return the changed booking, then the client "
        "upserts that record into Zustand and the TanStack Query cache immediately."
    )
    pdf.set_font("Body", "", 9)
    pdf.multi_cell(
        0,
        4.5,
        "Browse card -> RoomDetails -> Booking sheet -> POST /api/bookings\n"
        "  -> server validates conflict rules\n"
        "  -> store/query cache upsert the returned booking record\n"
        "  -> BookingConfirmation modal opens with bookingId",
    )

    pdf.h1("5. MOTION, GESTURE AND DEMO SCRIPT")
    pdf.body(
        "Room cards animate into the list with Reanimated. Booking cards expose a red cancel action under the card; "
        "a left swipe past the threshold triggers the same confirm-safe cancellation path as the visible cancel button."
    )
    pdf.body(
        "Demo: login -> tap a room card -> RoomDetails -> book an available slot -> BookingConfirmation pass -> "
        "open My Bookings and see the new booking without interval reload -> pull refresh only when reconciling cloud state -> "
        "swipe left to cancel -> try an occupied/overlapping slot and verify the 409 message."
    )

    pdf.h1("6. NOTES")
    pdf.body(
        "NPM reported existing dependency audit findings after installing Reanimated. No automatic npm audit fix was applied "
        "because it may introduce breaking dependency upgrades outside the Week 6 assignment scope."
    )

    OUT.parent.mkdir(parents=True, exist_ok=True)
    pdf.output(str(OUT))
    print(f"Wrote {OUT} bytes={OUT.stat().st_size}")


if __name__ == "__main__":
    build()
