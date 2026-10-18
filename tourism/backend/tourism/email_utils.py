import logging
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from .pdf_utils import generate_booking_pdf

logger = logging.getLogger(__name__)

def send_booking_confirmation_email(booking, service_otps=None):
    """
    Sends a concise, professional booking confirmation email with an attached detailed PDF.
    Contains only essential details in the body, with complete info in the PDF attachment.
    Includes Service Verification OTPs for each booked service item when provided.
    Non-blocking: Exceptions are caught and logged so that booking/payment flows are never broken.
    """
    try:
        user = booking.user
        if not user or not user.email:
            print(f"[WARNING] No recipient email found for booking #{booking.booking_id}. Skipping email.")
            logger.warning(f"No recipient email found for booking #{booking.booking_id}. Skipping email.")
            return False

        recipient_email = user.email.strip()
        user_id = getattr(user, 'user_id', getattr(user, 'id', 'N/A'))
        booking_status_val = getattr(booking, 'booking_status', getattr(booking, 'status', 'N/A'))

        print("==================================================")
        print("[WANDERA EMAIL] BOOKING EMAIL FUNCTION CALLED")
        print(f"   * Booking ID: #{booking.booking_id}")
        print(f"   * User ID: {user_id}")
        print(f"   * Recipient Email: {recipient_email}")
        print(f"   * Booking Status: {booking_status_val}")
        print(f"   * Payment Method: {booking.payment_method}")
        print(f"   * Payment Status: {booking.payment_status}")
        if service_otps:
            print(f"   * Service OTPs to include: {len(service_otps)} service(s)")
        print("==================================================")

        tourist_name = user.full_name or "Traveler"
        booking_ref = f"#{booking.booking_id}"
        destination_name = booking.destination.name if booking.destination else "Kerala Trip"
        start_date = str(booking.start_date) if booking.start_date else "N/A"
        end_date = str(booking.end_date) if booking.end_date else "N/A"
        total_amount = float(booking.total_amount or 0)
        payment_status = booking.payment_status or "Pending"
        payment_method = booking.payment_method or "Offline"

        # Summarize unique service categories booked (e.g. Hotel, Transportation, Activity)
        service_types = list(booking.items.values_list('service_type', flat=True).distinct())
        services_summary = ", ".join(service_types) if service_types else "Trip Services"

        subject = f"Booking Confirmed - Ref #{booking.booking_id} | Wandera"
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', None) or getattr(settings, 'EMAIL_HOST_USER', None) or 'Wandera Smart Tourism <no-reply@wandera.com>'

        # Format OTP text & html snippets if present
        otp_text_block = ""
        otp_html_block = ""
        if service_otps and len(service_otps) > 0:
            otp_text_block = "\nSERVICE VERIFICATION OTPs\n----------------------------------------\n"
            otp_items_html = ""
            for s_info in service_otps:
                stype = s_info.get("service_type", "Service")
                slabel = "Pickup OTP" if stype == "Transportation" else "Check-in OTP"
                sotp = s_info.get("otp", "")
                sname = s_info.get("item_name", "")
                name_str = f" ({sname})" if sname else ""
                otp_text_block += f"{stype}{name_str} - {slabel}: {sotp}\n"
                otp_items_html += f"""
                <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px 14px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <strong style="color:#1e293b; font-size:13.5px;">{stype}{name_str}</strong>
                    <div style="color:#64748b; font-size:12px; margin-top:2px;">{slabel}</div>
                  </div>
                  <div style="background:#18261f; color:#55d6be; font-family:'Courier New', monospace; font-size:18px; font-weight:700; letter-spacing:2px; padding:4px 12px; border-radius:6px;">
                    {sotp}
                  </div>
                </div>"""
            
            otp_text_block += "\nImportant: Please provide the respective OTP to your service provider upon arrival/pickup.\n"
            otp_html_block = f"""
            <div style="margin:20px 0 16px;">
              <h3 style="font-size:14px; color:#18261f; margin:0 0 8px; text-transform:uppercase; letter-spacing:0.5px;">🔑 Service Verification OTPs</h3>
              <p style="font-size:12.5px; color:#64748b; margin:0 0 12px;">Share each OTP with the corresponding service provider at check-in or pickup.</p>
              {otp_items_html}
            </div>"""

        # 1. Concise Plain Text Body
        text_content = f"""Dear {tourist_name},

Thank you for choosing Wandera! Your trip booking has been confirmed.

BOOKING SUMMARY
----------------------------------------
Booking Reference: {booking_ref}
Destination:       {destination_name}
Travel Dates:      {start_date} to {end_date}
Services Booked:   {services_summary}
Total Amount:      INR {total_amount:,.2f}
Payment Status:    {payment_status} ({payment_method})
{otp_text_block}
Your complete booking details and payment information are available in the attached booking voucher PDF.

Wishing you a safe and memorable journey!

Warm regards,
The Wandera Team
https://wandera.com
"""

        # 2. Clean, Professional HTML Body
        html_content = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #1e293b; }}
  .email-container {{ max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }}
  .email-header {{ background: #18261f; color: #ffffff; padding: 24px 28px; text-align: left; }}
  .email-header h1 {{ margin: 0 0 4px; font-size: 20px; color: #55d6be; letter-spacing: 0.5px; }}
  .email-header p {{ margin: 0; font-size: 13px; color: #cbd5e1; }}
  .email-body {{ padding: 28px; }}
  .badge-confirmed {{ display: inline-block; background: #ecfdf5; color: #047857; font-weight: 600; font-size: 12px; padding: 4px 10px; border-radius: 20px; border: 1px solid #a7f3d0; margin-bottom: 16px; }}
  .summary-table {{ width: 100%; border-collapse: collapse; margin: 18px 0; }}
  .summary-table td {{ padding: 8px 0; font-size: 13.5px; border-bottom: 1px solid #f1f5f9; }}
  .summary-table td.label {{ color: #64748b; font-weight: 500; width: 42%; }}
  .summary-table td.val {{ color: #0f172a; font-weight: 600; text-align: right; }}
  .total-row td {{ font-size: 15px; color: #18261f; font-weight: 700; border-top: 1.5px solid #cbd5e1; padding-top: 10px; }}
  .pdf-notice-box {{ background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px 16px; margin: 20px 0 10px; color: #166534; font-size: 13px; line-height: 1.4; }}
  .email-footer {{ background: #f8fafc; padding: 18px 28px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }}
</style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>WANDERA</h1>
      <p>Smart Tourism & Travel Ecosystem Platform</p>
    </div>
    <div class="email-body">
      <span class="badge-confirmed">✓ Booking Confirmed</span>
      <p style="font-size: 14px; margin: 0 0 12px; color: #334155;">
        Dear <strong>{tourist_name}</strong>,
      </p>
      <p style="font-size: 13.5px; line-height: 1.5; color: #475569; margin: 0 0 16px;">
        Your booking has been successfully processed and confirmed. Here is your essential trip summary:
      </p>

      <table class="summary-table">
        <tr>
          <td class="label">Booking Reference</td>
          <td class="val">{booking_ref}</td>
        </tr>
        <tr>
          <td class="label">Destination</td>
          <td class="val">{destination_name}</td>
        </tr>
        <tr>
          <td class="label">Travel Dates</td>
          <td class="val">{start_date} &rarr; {end_date}</td>
        </tr>
        <tr>
          <td class="label">Services Booked</td>
          <td class="val">{services_summary}</td>
        </tr>
        <tr>
          <td class="label">Payment Status</td>
          <td class="val">{payment_status} ({payment_method})</td>
        </tr>
        <tr class="total-row">
          <td class="label" style="color:#18261f;">Total Amount</td>
          <td class="val" style="color:#18261f;">&#8377;{total_amount:,.2f} INR</td>
        </tr>
      </table>

      {otp_html_block}

      <div class="pdf-notice-box">
        📎 <strong>PDF Attachment:</strong> Your complete booking details and payment information are available in the attached booking voucher PDF (<strong>Wandera_Booking_{booking.booking_id}.pdf</strong>).
      </div>
    </div>
    <div class="email-footer">
      &copy; Wandera Smart Tourism Platform &bull; Need help? Contact <a href="mailto:support@wandera.com" style="color:#2b7a4b; text-decoration:none;">support@wandera.com</a>
    </div>
  </div>
</body>
</html>
"""

        # 3. Create Email Message
        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=from_email,
            to=[recipient_email]
        )
        msg.attach_alternative(html_content, "text/html")

        # 4. Generate & Attach PDF (Resilient: Send email even if PDF generation fails)
        try:
            pdf_buffer = generate_booking_pdf(booking)
            if pdf_buffer:
                pdf_filename = f"Wandera_Booking_{booking.booking_id}.pdf"
                msg.attach(pdf_filename, pdf_buffer.getvalue(), "application/pdf")
                print(f"[EMAIL] PDF attached successfully: {pdf_filename}")
        except Exception as pdf_err:
            logger.error(f"Error generating PDF for email attachment (Booking #{booking.booking_id}): {pdf_err}")
            print(f"[WARNING] PDF generation error (proceeding to send email without attachment): {pdf_err}")

        # 5. Send Email
        print(f"[EMAIL] Sending confirmation email to: {recipient_email}...")
        msg.send(fail_silently=False)
        print(f"[SUCCESS] Email sent successfully to: {recipient_email}")
        logger.info(f"Booking confirmation email sent successfully to {recipient_email} for Booking #{booking.booking_id}")
        return True

    except Exception as e:
        print(f"[ERROR] Email error when sending to {getattr(getattr(booking, 'user', None), 'email', 'unknown')}: {str(e)}")
        logger.exception(
            f"Failed to send booking confirmation email "
            f"for Booking #{getattr(booking, 'booking_id', 'N/A')}: {e}"
        )
        # Do not fail or raise - preserve successful booking and payment
        return False


def send_service_checkout_otp_email(booking_item, checkout_otp):
    """
    Sends a service completion / checkout OTP email to the tourist.
    Triggered when a service provider requests checkout verification.
    Non-blocking: Catches and logs all errors.
    """
    try:
        booking = booking_item.booking
        user = booking.user if booking else None
        if not user or not user.email:
            print(f"[WARNING] No recipient email found for checkout OTP (Item #{booking_item.booking_item_id}).")
            return False

        recipient_email = user.email.strip()
        tourist_name = user.full_name or "Traveler"
        service_type = booking_item.service_type or "Service"
        item_name = booking_item.item_name or (booking_item.provider.business_name if booking_item.provider else service_type)
        destination_name = booking.destination.name if booking and booking.destination else "Kerala Trip"
        booking_ref = f"#{booking.booking_id}" if booking else "#N/A"

        print("==================================================")
        print("[WANDERA EMAIL] CHECKOUT OTP EMAIL DISPATCH")
        print(f"   * Booking ID: {booking_ref}")
        print(f"   * Service Item ID: #{booking_item.booking_item_id} ({service_type})")
        print(f"   * Recipient Email: {recipient_email}")
        print("==================================================")

        subject = f"Wandera - Service Completion OTP | {service_type} (Ref {booking_ref})"
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', None) or getattr(settings, 'EMAIL_HOST_USER', None) or 'Wandera Smart Tourism <no-reply@wandera.com>'

        # Plain Text Body
        text_content = f"""Dear {tourist_name},

Your service provider has requested completion confirmation for your booking:

SERVICE DETAILS
----------------------------------------
Service:           {service_type} ({item_name})
Booking Reference: {booking_ref}
Destination:       {destination_name}

YOUR CHECKOUT VERIFICATION OTP:
{checkout_otp}

Please provide this 6-digit OTP to your service provider to verify completion of your service.
This OTP is single-use and valid until verified.

Warm regards,
The Wandera Team
https://wandera.com
"""

        # HTML Body
        html_content = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #1e293b; }}
  .email-container {{ max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }}
  .email-header {{ background: #18261f; color: #ffffff; padding: 22px 26px; text-align: left; }}
  .email-header h1 {{ margin: 0 0 4px; font-size: 19px; color: #55d6be; }}
  .email-header p {{ margin: 0; font-size: 13px; color: #cbd5e1; }}
  .email-body {{ padding: 26px; }}
  .otp-display-card {{ background: #f0fdf4; border: 1.5px dashed #10b981; border-radius: 10px; padding: 18px; text-align: center; margin: 20px 0; }}
  .otp-code {{ font-family: 'Courier New', monospace; font-size: 28px; font-weight: 800; letter-spacing: 6px; color: #065f46; margin: 8px 0; }}
  .info-table {{ width: 100%; border-collapse: collapse; margin: 16px 0; }}
  .info-table td {{ padding: 7px 0; font-size: 13.5px; border-bottom: 1px solid #f1f5f9; }}
  .info-table td.lbl {{ color: #64748b; font-weight: 500; width: 40%; }}
  .info-table td.val {{ color: #0f172a; font-weight: 600; text-align: right; }}
  .email-footer {{ background: #f8fafc; padding: 16px 26px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }}
</style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>WANDERA</h1>
      <p>Service Completion Confirmation</p>
    </div>
    <div class="email-body">
      <p style="font-size: 14px; margin: 0 0 12px; color: #334155;">
        Dear <strong>{tourist_name}</strong>,
      </p>
      <p style="font-size: 13.5px; line-height: 1.5; color: #475569; margin: 0 0 16px;">
        Your service provider has requested completion verification for your booked service.
      </p>

      <table class="info-table">
        <tr>
          <td class="lbl">Service</td>
          <td class="val">{service_type}</td>
        </tr>
        <tr>
          <td class="lbl">Provider / Item</td>
          <td class="val">{item_name}</td>
        </tr>
        <tr>
          <td class="lbl">Booking Reference</td>
          <td class="val">{booking_ref}</td>
        </tr>
        <tr>
          <td class="lbl">Destination</td>
          <td class="val">{destination_name}</td>
        </tr>
      </table>

      <div class="otp-display-card">
        <div style="font-size: 12px; color: #047857; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Your Checkout Verification OTP</div>
        <div class="otp-code">{checkout_otp}</div>
        <div style="font-size: 12px; color: #059669;">Please share this code with the service provider to verify service completion.</div>
      </div>
    </div>
    <div class="email-footer">
      &copy; Wandera Smart Tourism Platform &bull; Need help? Contact <a href="mailto:support@wandera.com" style="color:#2b7a4b; text-decoration:none;">support@wandera.com</a>
    </div>
  </div>
</body>
</html>
"""

        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=from_email,
            to=[recipient_email]
        )
        msg.attach_alternative(html_content, "text/html")

        print(f"[EMAIL] Sending checkout OTP email to: {recipient_email}...")
        msg.send(fail_silently=False)
        print(f"[SUCCESS] Checkout OTP email sent successfully to: {recipient_email}")
        logger.info(f"Checkout OTP email sent successfully to {recipient_email} for Item #{booking_item.booking_item_id}")
        return True

    except Exception as e:
        print(f"[ERROR] Failed to send checkout OTP email for Item #{getattr(booking_item, 'booking_item_id', 'N/A')}: {str(e)}")
        logger.exception(f"Checkout OTP email failure: {e}")
        return False


