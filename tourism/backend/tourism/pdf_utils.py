import io
import re
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas


def generate_booking_pdf(booking):
    """
    Generates a professional, beautifully styled PDF voucher and tax receipt
    for a Wandera booking, containing all available booking and payment details.
    Returns a BytesIO stream containing the binary PDF content.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom Color Palette
    PRIMARY = colors.HexColor("#18261f")    # Dark Forest / Slate
    SECONDARY = colors.HexColor("#2b7a4b")  # Wandera Emerald Green
    ACCENT = colors.HexColor("#55d6be")     # Wandera Mint
    BG_LIGHT = colors.HexColor("#f8fafc")   # Slate 50
    BORDER_COLOR = colors.HexColor("#e2e8f0") # Slate 200
    TEXT_DARK = colors.HexColor("#0f172a")  # Slate 900
    TEXT_MUTED = colors.HexColor("#64748b") # Slate 500

    # Custom Typography Styles
    style_brand = ParagraphStyle(
        'BrandTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=PRIMARY
    )

    style_tagline = ParagraphStyle(
        'BrandTagline',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=TEXT_MUTED
    )

    style_receipt_title = ParagraphStyle(
        'ReceiptTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=SECONDARY,
        alignment=2 # Right align
    )

    style_receipt_sub = ParagraphStyle(
        'ReceiptSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=TEXT_MUTED,
        alignment=2 # Right align
    )

    style_section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=PRIMARY,
        spaceBefore=10,
        spaceAfter=4
    )

    style_label = ParagraphStyle(
        'FieldLabel',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=TEXT_MUTED
    )

    style_value = ParagraphStyle(
        'FieldValue',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13,
        textColor=TEXT_DARK
    )

    style_value_bold = ParagraphStyle(
        'FieldValueBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=13,
        textColor=TEXT_DARK
    )

    style_table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.white
    )

    style_table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=TEXT_DARK
    )

    style_table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=12,
        textColor=TEXT_DARK
    )

    style_footer = ParagraphStyle(
        'FooterText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=TEXT_MUTED,
        alignment=1 # Center align
    )

    story = []

    # 1. HEADER SECTION (Brand Left, Voucher Info Right)
    brand_p = [
        Paragraph("WANDERA", style_brand),
        Paragraph("Smart Tourism & Travel Ecosystem Platform", style_tagline),
        Paragraph("Official Booking Voucher & Tax Invoice", style_tagline)
    ]
    
    booking_date_str = booking.created_at.strftime("%d %b %Y, %I:%M %p") if booking.created_at else datetime.now().strftime("%d %b %Y")
    receipt_p = [
        Paragraph(f"BOOKING #{booking.booking_id}", style_receipt_title),
        Paragraph(f"<b>Issue Date:</b> {booking_date_str}", style_receipt_sub),
        Paragraph(f"<b>Status:</b> {booking.booking_status}", style_receipt_sub)
    ]

    header_table = Table(
        [[brand_p, receipt_p]],
        colWidths=[4.0 * inch, 3.5 * inch]
    )
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=1.5, color=SECONDARY, spaceBefore=2, spaceAfter=10))

    # 2. OVERVIEW INFO BOX (Tourist Details & Trip Itinerary)
    user = booking.user
    tourist_name = user.full_name if user else "N/A"
    tourist_email = user.email if user else "N/A"
    
    tourist_phone = "N/A"
    if user and hasattr(user, 'tourist_profile') and user.tourist_profile:
        tourist_phone = user.tourist_profile.phone or "N/A"

    destination_name = booking.destination.name if booking.destination else "Kerala Travel Itinerary"
    start_date_str = str(booking.start_date) if booking.start_date else "Not Specified"
    end_date_str = str(booking.end_date) if booking.end_date else "Not Specified"
    
    overview_data = [
        [
            Paragraph("TOURIST DETAILS", style_section_heading),
            Paragraph("TRIP OVERVIEW", style_section_heading)
        ],
        [
            Paragraph(f"<b>Full Name:</b> {tourist_name}<br/><b>Email:</b> {tourist_email}<br/><b>Phone:</b> {tourist_phone}", style_value),
            Paragraph(f"<b>Destination:</b> {destination_name}<br/><b>Travel Dates:</b> {start_date_str} to {end_date_str}<br/><b>Total Services:</b> {booking.items.count()}", style_value)
        ]
    ]

    overview_table = Table(overview_data, colWidths=[3.75 * inch, 3.75 * inch])
    overview_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), BG_LIGHT),
        ('BOX', (0, 0), (-1, -1), 1, BORDER_COLOR),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(overview_table)
    story.append(Spacer(1, 14))

    # 3. ITEMIZED SERVICES TABLE
    story.append(Paragraph("ITEMIZED BOOKING SERVICES", style_section_heading))

    items_data = [
        [
            Paragraph("Service", style_table_header),
            Paragraph("Service Provider & Item Details", style_table_header),
            Paragraph("Schedule / Dates", style_table_header),
            Paragraph("Amount (INR)", style_table_header)
        ]
    ]

    items = booking.items.all().select_related("provider__hotel", "provider__transportation", "provider__activity")

    for item in items:
        service_type = item.service_type
        details = item.details or {}
        provider = item.provider

        details_lines = []
        schedule_lines = []

        if service_type == "Hotel":
            hotel_name = provider.hotel.hotel_name if provider and hasattr(provider, 'hotel') else (item.item_name or "Hotel")
            room_name = details.get("room_name") or "Standard Room"
            rooms_count = details.get("rooms_count", 1)
            nights = details.get("nights", 1)
            address = provider.hotel.address if provider and hasattr(provider, 'hotel') else ""

            details_lines.append(f"<b>{hotel_name}</b>")
            details_lines.append(f"Room: {room_name} ({rooms_count} room{'s' if rooms_count > 1 else ''})")
            if address:
                details_lines.append(f"Address: {address}")

            check_in = details.get("check_in", "N/A")
            check_out = details.get("check_out", "N/A")
            schedule_lines.append(f"Check-in: {check_in}")
            schedule_lines.append(f"Check-out: {check_out}")
            schedule_lines.append(f"Duration: {nights} night{'s' if nights > 1 else ''}")

        elif service_type == "Transportation":
            agency_name = provider.transportation.service_name if provider and hasattr(provider, 'transportation') else (item.item_name or "Transportation")
            vehicle_name = details.get("vehicle_name", "Vehicle")
            pickup = details.get("pickup_location", "")
            drop = details.get("drop_location", "")

            details_lines.append(f"<b>{agency_name}</b>")
            details_lines.append(f"Vehicle: {vehicle_name}")
            if pickup:
                details_lines.append(f"Pickup: {pickup}")
            if drop:
                details_lines.append(f"Drop-off: {drop}")

            journey_date = details.get("journey_date", "N/A")
            return_date = details.get("return_date", "")
            schedule_lines.append(f"Journey Date: {journey_date}")
            if return_date:
                schedule_lines.append(f"Return Date: {return_date}")

        elif service_type == "Activity":
            center_name = provider.activity.activity_name if provider and hasattr(provider, 'activity') else (item.item_name or "Activity")
            act_title = details.get("activity_title", "")
            participants = details.get("participants_count", 1)
            time_slot = details.get("time_slot", "")

            details_lines.append(f"<b>{center_name}</b>")
            if act_title:
                details_lines.append(f"Package: {act_title}")
            details_lines.append(f"Participants: {participants} Person{'s' if participants > 1 else ''}")

            act_date = details.get("activity_date", "N/A")
            schedule_lines.append(f"Date: {act_date}")
            if time_slot:
                schedule_lines.append(f"Time Slot: {time_slot}")

        else:
            details_lines.append(f"<b>{item.item_name or 'Custom Service'}</b>")
            schedule_lines.append("Confirmed")

        amount_val = float(item.amount or 0)
        items_data.append([
            Paragraph(f"<b>{service_type}</b>", style_table_cell_bold),
            Paragraph("<br/>".join(details_lines), style_table_cell),
            Paragraph("<br/>".join(schedule_lines), style_table_cell),
            Paragraph(f"₹{amount_val:,.2f}", style_table_cell_bold)
        ])

    items_table = Table(
        items_data,
        colWidths=[1.1 * inch, 3.1 * inch, 2.1 * inch, 1.2 * inch]
    )
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('ALIGN', (3, 0), (3, -1), 'RIGHT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(items_table)
    story.append(Spacer(1, 12))

    # 4. PAYMENT & TOTALS SUMMARY (Keep together)
    payment_method = booking.payment_method or "Offline"
    payment_status = booking.payment_status or "Pending"
    total_amount = float(booking.total_amount or 0)
    
    razorpay_id = booking.razorpay_payment_id or "N/A (Offline/Pending)"

    payment_summary_data = [
        [
            Paragraph("PAYMENT & TRANSACTION INFORMATION", style_section_heading),
            Paragraph("TOTAL AMOUNT", style_section_heading)
        ],
        [
            Paragraph(
                f"<b>Payment Method:</b> {payment_method}<br/>"
                f"<b>Payment Status:</b> {payment_status}<br/>"
                f"<b>Transaction / Ref ID:</b> {razorpay_id}<br/>"
                f"<b>Booking Reference:</b> #{booking.booking_id}",
                style_value
            ),
            Paragraph(
                f"<font size=14 color='#18261f'><b>₹{total_amount:,.2f} INR</b></font><br/>"
                f"<font size=8 color='#64748b'>Status: <b>{booking.booking_status}</b></font><br/>"
                f"<font size=8 color='#64748b'>{'Paid in Full (Online)' if payment_status == 'Completed' else 'Pay in person to service providers'}</font>",
                style_value
            )
        ]
    ]

    payment_table = Table(payment_summary_data, colWidths=[4.5 * inch, 3.0 * inch])
    payment_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), BG_LIGHT),
        ('BOX', (0, 0), (-1, -1), 1, BORDER_COLOR),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(KeepTogether([
        payment_table,
        Spacer(1, 16),
        HRFlowable(width="100%", thickness=0.5, color=BORDER_COLOR, spaceBefore=4, spaceAfter=8),
        Paragraph(
            "<b>Important Travel Instructions:</b> Please present this voucher upon arrival at each destination service provider. "
            "For offline bookings, please make direct payments at the respective counters. "
            "For assistance, cancellations, or inquiries, reach out to <b>support@wandera.com</b> or visit your Wandera profile.",
            style_footer
        ),
        Spacer(1, 4),
        Paragraph("Thank you for choosing Wandera — Wishing you a wonderful and safe journey across Kerala!", style_footer)
    ]))

    doc.build(story)
    buffer.seek(0)
    return buffer


def format_indian_currency(amount):
    """
    Formats a numeric amount with the Indian Rupee symbol and Indian numbering system (e.g. ₹1,50,000.00).
    """
    try:
        val = float(amount or 0)
    except (ValueError, TypeError):
        return "₹0.00"
    is_neg = val < 0
    val = abs(val)
    parts = f"{val:.2f}".split(".")
    int_part, dec_part = parts[0], parts[1]
    if len(int_part) <= 3:
        formatted_int = int_part
    else:
        last3 = int_part[-3:]
        rest = int_part[:-3]
        groups = []
        while len(rest) > 2:
            groups.insert(0, rest[-2:])
            rest = rest[:-2]
        if rest:
            groups.insert(0, rest)
        groups.append(last3)
        formatted_int = ",".join(groups)
    sign = "-" if is_neg else ""
    return f"{sign}₹{formatted_int}.{dec_part}"


def escape_xml(text):
    """
    Escapes special XML/HTML characters to prevent ReportLab markup parsing errors.
    """
    if not text:
        return ""
    return str(text).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


class ItineraryNumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute and print 'Page X of Y' alongside
    a professional running footer on every page.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b")) # Slate 500
        w, h = self._pagesize
        footer_y = 24

        # Subtle separator line
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.75)
        self.line(36, footer_y + 12, w - 36, footer_y + 12)

        # Left branding
        self.drawString(36, footer_y, "Wandera Smart Tourism Platform • Kerala Travel Itinerary & Expense Guide")

        # Right page number
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(w - 36, footer_y, page_str)
        self.restoreState()


def generate_itinerary_pdf(itinerary):
    """
    Generates a professional, publication-quality PDF for a Wandera shared/curated
    itinerary, including overview, day-by-day experience, visited places/activities,
    expense breakdown, travel tips, and total trip cost.
    Accepts an Itinerary model instance or a dictionary.
    Returns a BytesIO stream containing binary PDF content.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=46
    )

    styles = getSampleStyleSheet()

    # Shared Wandera Brand Color Palette
    PRIMARY = colors.HexColor("#18261f")      # Dark Forest / Slate
    SECONDARY = colors.HexColor("#2b7a4b")    # Wandera Emerald Green
    ACCENT = colors.HexColor("#55d6be")       # Wandera Mint
    BG_LIGHT = colors.HexColor("#f8fafc")     # Slate 50
    BORDER_COLOR = colors.HexColor("#e2e8f0") # Slate 200
    TEXT_DARK = colors.HexColor("#0f172a")    # Slate 900
    TEXT_MUTED = colors.HexColor("#64748b")   # Slate 500
    AMBER_BG = colors.HexColor("#fffbeb")     # Amber 50
    AMBER_BORDER = colors.HexColor("#fde68a") # Amber 200
    AMBER_TEXT = colors.HexColor("#92400e")   # Amber 800

    # Typography Styles
    style_brand = ParagraphStyle(
        'ItinBrandTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=PRIMARY
    )

    style_tagline = ParagraphStyle(
        'ItinBrandTagline',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=TEXT_MUTED
    )

    style_receipt_title = ParagraphStyle(
        'ItinReceiptTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=SECONDARY,
        alignment=2 # Right align
    )

    style_receipt_sub = ParagraphStyle(
        'ItinReceiptSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=TEXT_MUTED,
        alignment=2 # Right align
    )

    style_section_heading = ParagraphStyle(
        'ItinSectionHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=PRIMARY,
        spaceBefore=10,
        spaceAfter=4
    )

    style_body = ParagraphStyle(
        'ItinBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=TEXT_DARK
    )

    style_body_day_title = ParagraphStyle(
        'ItinDayTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=SECONDARY,
        spaceBefore=6,
        spaceAfter=2
    )

    style_body_muted = ParagraphStyle(
        'ItinBodyMuted',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=13,
        textColor=TEXT_MUTED
    )

    style_table_header = ParagraphStyle(
        'ItinTableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.white
    )

    style_table_cell = ParagraphStyle(
        'ItinTableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=TEXT_DARK
    )

    style_table_cell_bold = ParagraphStyle(
        'ItinTableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=13,
        textColor=TEXT_DARK
    )

    style_table_cell_cost = ParagraphStyle(
        'ItinTableCellCost',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=13,
        textColor=SECONDARY,
        alignment=2 # Right align
    )

    style_total_label = ParagraphStyle(
        'ItinTotalLabel',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.white
    )

    style_total_val = ParagraphStyle(
        'ItinTotalVal',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=13,
        textColor=colors.white,
        alignment=2 # Right align
    )

    style_tips_text = ParagraphStyle(
        'ItinTipsText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13.5,
        textColor=AMBER_TEXT
    )

    style_footer = ParagraphStyle(
        'ItinFooterText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=TEXT_MUTED,
        alignment=1 # Center align
    )

    # Extract data handling both model instance and dictionary
    if isinstance(itinerary, dict):
        itinerary_id = itinerary.get("itinerary_id", "N/A")
        title = itinerary.get("title") or "Wandera Travel Itinerary"
        destination = itinerary.get("destination") or "Kerala, India"
        number_of_days = itinerary.get("number_of_days") or 1
        description = itinerary.get("description") or ""
        hotel_name = itinerary.get("hotel_name") or ""
        accommodation_cost = itinerary.get("accommodation_cost") or 0
        transportation_type = itinerary.get("transportation_type") or ""
        transportation_cost = itinerary.get("transportation_cost") or 0
        activities = itinerary.get("activities") or ""
        food_cost = itinerary.get("food_cost") or 0
        other_cost = itinerary.get("other_cost") or 0
        total_cost = itinerary.get("total_cost") or 0
        travel_tips = itinerary.get("travel_tips") or ""
        created_at_raw = itinerary.get("created_at")
    else:
        itinerary_id = getattr(itinerary, "itinerary_id", "N/A")
        title = getattr(itinerary, "title", "") or "Wandera Travel Itinerary"
        destination = getattr(itinerary, "destination", "") or "Kerala, India"
        number_of_days = getattr(itinerary, "number_of_days", 1) or 1
        description = getattr(itinerary, "description", "") or ""
        hotel_name = getattr(itinerary, "hotel_name", "") or ""
        accommodation_cost = getattr(itinerary, "accommodation_cost", 0) or 0
        transportation_type = getattr(itinerary, "transportation_type", "") or ""
        transportation_cost = getattr(itinerary, "transportation_cost", 0) or 0
        activities = getattr(itinerary, "activities", "") or ""
        food_cost = getattr(itinerary, "food_cost", 0) or 0
        other_cost = getattr(itinerary, "other_cost", 0) or 0
        total_cost = getattr(itinerary, "total_cost", 0) or 0
        travel_tips = getattr(itinerary, "travel_tips", "") or ""
        created_at_raw = getattr(itinerary, "created_at", None)

    # Format created date
    if isinstance(created_at_raw, datetime):
        created_date_str = created_at_raw.strftime("%d %b %Y")
    elif isinstance(created_at_raw, str) and created_at_raw:
        try:
            dt = datetime.fromisoformat(created_at_raw.replace("Z", "+00:00"))
            created_date_str = dt.strftime("%d %b %Y")
        except Exception:
            created_date_str = created_at_raw[:10]
    else:
        created_date_str = datetime.now().strftime("%d %b %Y")

    try:
        number_of_days = int(number_of_days)
    except (ValueError, TypeError):
        number_of_days = 1

    days_label = f"{number_of_days} Day{'s' if number_of_days > 1 else ''} Trip"

    story = []

    # 1. HEADER SECTION (Brand Left, Itinerary Meta Right)
    brand_p = [
        Paragraph("WANDERA", style_brand),
        Paragraph("Smart Tourism & Travel Ecosystem Platform", style_tagline),
        Paragraph("Curated Community Travel Itinerary & Expense Guide", style_tagline)
    ]

    itin_meta_p = [
        Paragraph(f"ITINERARY #{itinerary_id}", style_receipt_title),
        Paragraph(f"<b>Published:</b> {escape_xml(created_date_str)}", style_receipt_sub),
        Paragraph(f"<b>Duration:</b> {escape_xml(days_label)}", style_receipt_sub)
    ]

    header_table = Table(
        [[brand_p, itin_meta_p]],
        colWidths=[4.2 * inch, 3.3 * inch]
    )
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 4))
    story.append(HRFlowable(width="100%", thickness=1.5, color=SECONDARY, spaceBefore=2, spaceAfter=8))

    # 2. HERO / OVERVIEW CARD
    overview_data = [
        [
            Paragraph("TRIP DETAILS", style_section_heading),
            Paragraph("SCHEDULE & TIMELINE", style_section_heading)
        ],
        [
            Paragraph(
                f"<b>Title:</b> {escape_xml(title)}<br/>"
                f"<b>Destination:</b> {escape_xml(destination)}",
                style_body
            ),
            Paragraph(
                f"<b>Duration:</b> {escape_xml(days_label)}<br/>"
                f"<b>Published Date:</b> {escape_xml(created_date_str)}",
                style_body
            )
        ]
    ]

    overview_table = Table(overview_data, colWidths=[3.75 * inch, 3.75 * inch])
    overview_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), BG_LIGHT),
        ('BOX', (0, 0), (-1, -1), 1, BORDER_COLOR),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(overview_table)
    story.append(Spacer(1, 10))

    # 3. COST HIGHLIGHT BANNER
    cost_banner_data = [
        [
            Paragraph(
                f"<font size=8 color='#64748b'>TOTAL ESTIMATED TRIP BUDGET</font><br/>"
                f"<font size=14 color='#18261f'><b>{format_indian_currency(total_cost)} INR</b></font><br/>"
                f"<font size=8 color='#64748b'>Comprehensive estimated expenses for {escape_xml(days_label)} across stay, transit, food & extras</font>",
                style_body
            ),
            Paragraph(
                f"<font size=8 color='#64748b'>DESTINATION</font><br/>"
                f"<font size=11 color='#2b7a4b'><b>{escape_xml(destination)}</b></font><br/>"
                f"<font size=8 color='#64748b'>Verified Community Guide</font>",
                style_body
            )
        ]
    ]
    cost_banner_table = Table(cost_banner_data, colWidths=[4.75 * inch, 2.75 * inch])
    cost_banner_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), BG_LIGHT),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#bbf7d0")), # Soft Emerald border
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
    ]))
    story.append(cost_banner_table)
    story.append(Spacer(1, 12))

    # 4. DAY-BY-DAY TRAVEL EXPERIENCE
    story.append(Paragraph("DAY-BY-DAY TRAVEL EXPERIENCE", style_section_heading))

    if description.strip():
        lines = description.strip().split("\n")
        current_paragraphs = []
        for line in lines:
            line_clean = line.strip()
            if not line_clean:
                if current_paragraphs:
                    story.append(Paragraph("<br/>".join(current_paragraphs), style_body))
                    story.append(Spacer(1, 5))
                    current_paragraphs = []
            else:
                day_match = re.match(r'^(Day\s+\d+[:\-\s]*)(.*)$', line_clean, re.IGNORECASE)
                if day_match:
                    if current_paragraphs:
                        story.append(Paragraph("<br/>".join(current_paragraphs), style_body))
                        story.append(Spacer(1, 4))
                        current_paragraphs = []
                    day_prefix = escape_xml(day_match.group(1).strip())
                    day_rest = escape_xml(day_match.group(2).strip())
                    story.append(Paragraph(f"• <b>{day_prefix}</b> {day_rest}", style_body_day_title if not day_rest else style_body))
                else:
                    current_paragraphs.append(escape_xml(line_clean))
        if current_paragraphs:
            story.append(Paragraph("<br/>".join(current_paragraphs), style_body))
    else:
        story.append(Paragraph("No detailed travel notes provided for this itinerary.", style_body_muted))

    story.append(Spacer(1, 12))

    # 5. ACTIVITIES & PLACES VISITED (if provided)
    if activities.strip():
        story.append(Paragraph("ACTIVITIES & PLACES VISITED", style_section_heading))
        activities_lines = [line.strip() for line in activities.strip().split("\n") if line.strip()]
        formatted_act_lines = []
        for line in activities_lines:
            formatted_act_lines.append(f"• {escape_xml(line)}")

        act_table = Table(
            [[Paragraph("<br/>".join(formatted_act_lines), style_body)]],
            colWidths=[7.5 * inch]
        )
        act_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), BG_LIGHT),
            ('BOX', (0, 0), (-1, -1), 1, BORDER_COLOR),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('LEFTPADDING', (0, 0), (-1, -1), 12),
            ('RIGHTPADDING', (0, 0), (-1, -1), 12),
        ]))
        story.append(act_table)
        story.append(Spacer(1, 12))

    # 6. COMPREHENSIVE EXPENSE BREAKDOWN TABLE
    story.append(Paragraph("COMPREHENSIVE EXPENSE BREAKDOWN", style_section_heading))

    hotel_desc = f"<b>{escape_xml(hotel_name)}</b>" if hotel_name else "Standard / self-arranged stay"
    transit_desc = f"<b>{escape_xml(transportation_type)}</b>" if transportation_type else "Local public transit / cab"

    expense_data = [
        [
            Paragraph("Category", style_table_header),
            Paragraph("Item & Experience Details", style_table_header),
            Paragraph("Estimated Cost (INR)", ParagraphStyle('THRight', parent=style_table_header, alignment=2))
        ],
        [
            Paragraph("<b>Accommodation</b>", style_table_cell_bold),
            Paragraph(f"Lodging & Stay: {hotel_desc}", style_table_cell),
            Paragraph(format_indian_currency(accommodation_cost), style_table_cell_cost)
        ],
        [
            Paragraph("<b>Transportation</b>", style_table_cell_bold),
            Paragraph(f"Transit & Travel: {transit_desc}", style_table_cell),
            Paragraph(format_indian_currency(transportation_cost), style_table_cell_cost)
        ],
        [
            Paragraph("<b>Food & Dining</b>", style_table_cell_bold),
            Paragraph("Daily meals, local specialties & refreshments", style_table_cell),
            Paragraph(format_indian_currency(food_cost), style_table_cell_cost)
        ],
        [
            Paragraph("<b>Other Expenses</b>", style_table_cell_bold),
            Paragraph("Entry tickets, permits, local activities & incidentals", style_table_cell),
            Paragraph(format_indian_currency(other_cost), style_table_cell_cost)
        ],
        [
            Paragraph("<b>TOTAL ESTIMATED COST</b>", style_total_label),
            Paragraph(f"All-inclusive trip expenses for {escape_xml(days_label)}", style_total_label),
            Paragraph(format_indian_currency(total_cost), style_total_val)
        ]
    ]

    expense_table = Table(
        expense_data,
        colWidths=[1.8 * inch, 3.9 * inch, 1.8 * inch]
    )
    expense_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -2), 0.5, BORDER_COLOR),
        ('BACKGROUND', (0, 1), (-1, -2), BG_LIGHT),
        ('BACKGROUND', (0, -1), (-1, -1), SECONDARY),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))

    story.append(KeepTogether([expense_table]))
    story.append(Spacer(1, 12))

    # 7. HELPFUL TRAVEL TIPS (if provided)
    if travel_tips.strip():
        story.append(Paragraph("HELPFUL TRAVEL TIPS & RECOMMENDATIONS", style_section_heading))
        tips_clean = travel_tips.strip().split("\n")
        formatted_tips = [f"• {escape_xml(t.strip())}" for t in tips_clean if t.strip()]
        tips_data = [
            [
                Paragraph("<b>PRO TRAVELER ADVICE:</b><br/>" + "<br/>".join(formatted_tips), style_tips_text)
            ]
        ]
        tips_table = Table(tips_data, colWidths=[7.5 * inch])
        tips_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), AMBER_BG),
            ('BOX', (0, 0), (-1, -1), 1, AMBER_BORDER),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('LEFTPADDING', (0, 0), (-1, -1), 12),
            ('RIGHTPADDING', (0, 0), (-1, -1), 12),
        ]))
        story.append(KeepTogether([tips_table]))
        story.append(Spacer(1, 14))

    # 8. FOOTER / DISCLAIMER
    story.append(KeepTogether([
        HRFlowable(width="100%", thickness=0.5, color=BORDER_COLOR, spaceBefore=4, spaceAfter=8),
        Paragraph(
            "<b>Community Travel Disclaimer:</b> This itinerary was shared by a Wandera traveler for community inspiration and reference. "
            "Individual travel costs and service availability can vary depending on seasonality, group size, and dynamic provider rates. "
            "Verify all service details and reserve certified hotels, transportation, and activities directly on <b>Wandera</b>.",
            style_footer
        ),
        Spacer(1, 4),
        Paragraph("Thank you for using Wandera — Discover, Plan, and Experience God's Own Country seamlessly!", style_footer)
    ]))

    doc.build(story, canvasmaker=ItineraryNumberedCanvas)
    buffer.seek(0)
    return buffer

