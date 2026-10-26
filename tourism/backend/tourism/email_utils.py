import logging
import os
import base64
import requests
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from .pdf_utils import generate_booking_pdf

logger = logging.getLogger(__name__)


def _send_email_message(msg):
    """
    Send via Brevo HTTPS API when BREVO_API_KEY is configured (Render).
    Otherwise use Django's configured email backend (local Gmail SMTP).
    Supports HTML/text bodies and ordinary Django tuple attachments.
    """
    api_key = os.environ.get("BREVO_API_KEY")

    # No Brevo key: preserve the existing local SMTP behavior.
    if not api_key:
        return msg.send(fail_silently=False)

    sender_email = os.environ.get("BREVO_SENDER_EMAIL", "").strip()
    sender_name = os.environ.get("BREVO_SENDER_NAME", "Wandera").strip() or "Wandera"
    if not sender_email:
        raise RuntimeError("BREVO_SENDER_EMAIL is missing from the environment.")

    payload = {
        "sender": {"name": sender_name, "email": sender_email},
        "to": [{"email": address} for address in msg.to],
        "subject": msg.subject,
        "textContent": msg.body or "",
    }

    # EmailMultiAlternatives stores alternatives as (content, mimetype) tuples.
    for content, mimetype in getattr(msg, "alternatives", []) or []:
        if mimetype == "text/html":
            payload["htmlContent"] = content
            break

    attachments = []
    for attachment in getattr(msg, "attachments", []) or []:
        # Django's msg.attach(filename, content, mimetype) stores a 3-tuple.
        if isinstance(attachment, tuple) and len(attachment) == 3:
            filename, content, mimetype = attachment
            if isinstance(content, str):
                content = content.encode("utf-8")
            elif not isinstance(content, bytes):
                content = bytes(content)
            attachments.append({
                "name": filename,
                "content": base64.b64encode(content).decode("ascii"),
            })

    if attachments:
        payload["attachment"] = attachments

    response = requests.post(
        "https://api.brevo.com/v3/smtp/email",
        headers={
            "accept": "application/json",
            "api-key": api_key,
            "content-type": "application/json",
        },
        json=payload,
        timeout=25,
    )
    if not response.ok:
        logger.error("Brevo email API failed: HTTP %s - %s", response.status_code, response.text[:1000])
        response.raise_for_status()

    logger.info("Brevo accepted email to %s (messageId=%s)", ", ".join(msg.to), response.json().get("messageId"))
    return 1



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
        _send_email_message(msg)
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
        _send_email_message(msg)
        print(f"[SUCCESS] Checkout OTP email sent successfully to: {recipient_email}")
        logger.info(f"Checkout OTP email sent successfully to {recipient_email} for Item #{booking_item.booking_item_id}")
        return True

    except Exception as e:
        print(f"[ERROR] Failed to send checkout OTP email for Item #{getattr(booking_item, 'booking_item_id', 'N/A')}: {str(e)}")
        logger.exception(f"Checkout OTP email failure: {e}")
        return False


from django.contrib.auth.tokens import PasswordResetTokenGenerator

class WanderaPasswordResetTokenGenerator(PasswordResetTokenGenerator):
    """
    Custom password reset token generator for Wandera User model.
    Binds the token to user pk, user password hash, email, and timestamp.
    When user's password changes, the hash changes, invalidating any previously issued tokens.
    """
    def _make_hash_value(self, user, timestamp):
        return f"{user.pk}{user.password}{user.email}{timestamp}"

password_reset_token_generator = WanderaPasswordResetTokenGenerator()


def send_password_reset_email(user, reset_url):
    """
    Sends a secure, professional password reset email containing a time-limited reset link.
    Reuses existing Django SMTP configuration from settings.
    Non-blocking / error-resilient: catches and logs exceptions.
    """
    try:
        recipient_email = user.email.strip()
        user_name = user.full_name or "Traveler"
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', None) or getattr(settings, 'EMAIL_HOST_USER', None) or 'Wandera Smart Tourism <no-reply@wandera.com>'

        subject = "Reset Your Password | Wandera Smart Tourism"

        text_content = f"""Dear {user_name},

We received a request to reset the password for your Wandera account ({recipient_email}).

Please click or open the link below to set a new password:
{reset_url}

IMPORTANT SECURITY NOTICE:
- This password reset link is valid for 1 hour and can only be used once.
- If you did not request a password reset, please ignore this email. Your account remains secure and your password will not be changed.

Best regards,
The Wandera Team
https://wandera.com
"""

        html_content = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }}
  .email-container {{ max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 16px rgba(0,0,0,0.06); }}
  .email-header {{ background: #18261f; color: #ffffff; padding: 26px 30px; text-align: left; }}
  .email-header h1 {{ margin: 0 0 4px; font-size: 22px; color: #55d6be; letter-spacing: 0.5px; font-weight: 700; }}
  .email-header p {{ margin: 0; font-size: 13px; color: #94a3b8; }}
  .email-body {{ padding: 32px 30px; }}
  .greeting {{ font-size: 15px; margin: 0 0 14px; color: #0f172a; }}
  .intro-text {{ font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px; }}
  .btn-wrapper {{ text-align: center; margin: 28px 0; }}
  .reset-btn {{ display: inline-block; background: #55d6be; color: #063b36 !important; font-size: 15px; font-weight: 700; padding: 13px 36px; border-radius: 28px; text-decoration: none; box-shadow: 0 4px 12px rgba(85, 214, 190, 0.35); }}
  .fallback-box {{ background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; margin: 22px 0 18px; font-size: 12px; color: #64748b; word-break: break-all; line-height: 1.5; }}
  .fallback-box a {{ color: #0789e8; text-decoration: underline; }}
  .security-notice {{ background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 14px; margin: 20px 0 10px; font-size: 12.5px; color: #92400e; line-height: 1.45; border-radius: 0 6px 6px 0; }}
  .email-footer {{ background: #f8fafc; padding: 20px 30px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }}
</style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>WANDERA</h1>
      <p>Smart Tourism & Travel Ecosystem Platform</p>
    </div>
    <div class="email-body">
      <p class="greeting">Hello <strong>{user_name}</strong>,</p>
      <p class="intro-text">
        We received a request to reset the password for your Wandera account associated with <strong>{recipient_email}</strong>.
      </p>

      <div class="btn-wrapper">
        <a href="{reset_url}" target="_blank" class="reset-btn">Reset My Password</a>
      </div>

      <div class="security-notice">
        <strong>⚠️ Security Notice:</strong> This reset link will expire in <strong>1 hour</strong> and can only be used once. If you did not make this request, you can safely ignore this email; your current password remains secure.
      </div>

      <div class="fallback-box">
        <strong>Having trouble clicking the button?</strong> Copy and paste this link into your web browser:<br>
        <a href="{reset_url}">{reset_url}</a>
      </div>
    </div>
    <div class="email-footer">
      &copy; Wandera Smart Tourism Platform &bull; Need assistance? Contact <a href="mailto:support@wandera.com" style="color:#2b7a4b; text-decoration:none;">support@wandera.com</a>
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

        print(f"[WANDERA EMAIL] Sending password reset email to: {recipient_email}...")
        _send_email_message(msg)
        print(f"[WANDERA EMAIL SUCCESS] Password reset email sent to: {recipient_email}")
        logger.info(f"Password reset email sent to {recipient_email}")
        return True

    except Exception as e:
        print(f"[WANDERA EMAIL ERROR] Failed to send password reset email to {getattr(user, 'email', 'N/A')}: {str(e)}")
        logger.exception(f"Password reset email failure: {e}")
        return False


