import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

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
