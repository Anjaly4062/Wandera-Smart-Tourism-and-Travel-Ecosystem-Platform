"""
Compatibility proxy module providing pdfutils alias for pdf_utils.
Ensures both pdfutils and pdf_utils import paths function equivalently.
"""
from .pdf_utils import (
    generate_booking_pdf,
    generate_itinerary_pdf,
    format_indian_currency,
    escape_xml,
    ItineraryNumberedCanvas
)

__all__ = [
    "generate_booking_pdf",
    "generate_itinerary_pdf",
    "format_indian_currency",
    "escape_xml",
    "ItineraryNumberedCanvas",
]
