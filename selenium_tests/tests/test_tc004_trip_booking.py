
import time
from pathlib import Path
from datetime import date, timedelta

import pytest

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException


# ============================================================
# CONFIGURATION
# ============================================================

BASE_URL = "http://localhost:5173"

TOURIST_EMAIL = "selenium.test.tourist@gmail.com"
TOURIST_PASSWORD = "Test@12345"

SCREENSHOT_DIR = (
    Path(__file__).resolve().parent.parent / "screenshots"
)

SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# SCREENSHOT HELPER
# ============================================================

def save_screenshot(driver, filename):
    path = SCREENSHOT_DIR / filename
    driver.save_screenshot(str(path))
    print(f"Screenshot saved: {path}")


# ============================================================
# TEST
# ============================================================

def test_tc004_login_destination_hotel_booking():

    # --------------------------------------------------------
    # START CHROME
    # --------------------------------------------------------

    options = Options()
    options.add_argument("--start-maximized")

    driver = webdriver.Chrome(options=options)
    wait = WebDriverWait(driver, 20)

    try:

        # ====================================================
        # STEP 1 - OPEN WEBSITE
        # ====================================================

        driver.get(BASE_URL)

        wait.until(
            EC.presence_of_element_located(
                (By.TAG_NAME, "body")
            )
        )

        print("\nSTEP 1: Website opened successfully")

        save_screenshot(
            driver,
            "TC004_01_homepage.png"
        )


        # ====================================================
        # STEP 2 - OPEN LOGIN PAGE
        # ====================================================

        driver.get(f"{BASE_URL}/login")

        wait.until(
            EC.presence_of_element_located(
                (
                    By.CSS_SELECTOR,
                    'input[placeholder="Email Address"]'
                )
            )
        )

        print("STEP 2: Login page opened")

        save_screenshot(
            driver,
            "TC004_02_login_page.png"
        )


        # ====================================================
        # STEP 3 - ENTER LOGIN DETAILS
        # ====================================================

        email_input = wait.until(
            EC.presence_of_element_located(
                (
                    By.CSS_SELECTOR,
                    'input[placeholder="Email Address"]'
                )
            )
        )

        password_input = wait.until(
            EC.presence_of_element_located(
                (
                    By.CSS_SELECTOR,
                    'input[placeholder="Password"]'
                )
            )
        )

        email_input.clear()
        email_input.send_keys(TOURIST_EMAIL)

        password_input.clear()
        password_input.send_keys(TOURIST_PASSWORD)

        print("STEP 3: Login details entered")

        save_screenshot(
            driver,
            "TC004_03_login_details.png"
        )


        # ====================================================
        # STEP 4 - LOGIN
        # ====================================================

        login_button = wait.until(
            EC.element_to_be_clickable(
                (
                    By.XPATH,
                    '//button[normalize-space()="Login"]'
                )
            )
        )

        login_button.click()

        wait.until(
            EC.url_contains("/destinations")
        )

        print("STEP 4: Tourist logged in successfully")
        print("Current URL:", driver.current_url)

        save_screenshot(
            driver,
            "TC004_04_login_success.png"
        )


        # ====================================================
        # STEP 5 - DESTINATIONS PAGE
        # ====================================================

        wait.until(
            EC.presence_of_element_located(
                (
                    By.CSS_SELECTOR,
                    ".destination-card"
                )
            )
        )

        print("STEP 5: Destinations page opened")

        save_screenshot(
            driver,
            "TC004_05_destinations.png"
        )


        # ====================================================
        # STEP 6 - FIND DESTINATIONS
        # ====================================================

        destination_cards = wait.until(
            EC.presence_of_all_elements_located(
                (
                    By.CSS_SELECTOR,
                    ".destination-card"
                )
            )
        )

        print(
            f"STEP 6: {len(destination_cards)} destination(s) found"
        )

        assert len(destination_cards) > 0


        # ====================================================
        # STEP 7 - OPEN FIRST DESTINATION
        # ====================================================

        view_buttons = wait.until(
            EC.presence_of_all_elements_located(
                (
                    By.CSS_SELECTOR,
                    ".destination-card .view-btn"
                )
            )
        )

        assert len(view_buttons) > 0

        driver.execute_script(
            """
            arguments[0].scrollIntoView({
                block: 'center',
                inline: 'center'
            });
            """,
            view_buttons[0]
        )

        driver.execute_script(
            "arguments[0].click();",
            view_buttons[0]
        )

        wait.until(
            EC.url_contains("/view/")
        )

        print(
            "STEP 7: First destination details opened"
        )

        save_screenshot(
            driver,
            "TC004_06_destination_details.png"
        )


        # ====================================================
        # STEP 8 - NEARBY SERVICES
        # ====================================================

        nearby_services = wait.until(
            EC.presence_of_element_located(
                (
                    By.CSS_SELECTOR,
                    ".nearby-services"
                )
            )
        )

        assert nearby_services.is_displayed()

        print(
            "STEP 8: Nearby services section displayed"
        )

        save_screenshot(
            driver,
            "TC004_07_nearby_services.png"
        )


        # ====================================================
        # STEP 9 - SELECT HOTELS
        # ====================================================

        hotel_category = wait.until(
            EC.element_to_be_clickable(
                (
                    By.XPATH,
                    '//button[contains(@class, "service-category") '
                    'and normalize-space()="Hotels"]'
                )
            )
        )

        driver.execute_script(
            """
            arguments[0].scrollIntoView({
                block: 'center'
            });
            """,
            hotel_category
        )

        driver.execute_script(
            "arguments[0].click();",
            hotel_category
        )

        print("STEP 9: Hotels category selected")


        # ====================================================
        # STEP 10 - FIND HOTELS
        # ====================================================

        hotel_cards = wait.until(
            EC.presence_of_all_elements_located(
                (
                    By.CSS_SELECTOR,
                    ".nearby-service-card"
                )
            )
        )

        assert len(hotel_cards) > 0

        print(
            f"STEP 10: {len(hotel_cards)} hotel(s) found"
        )

        try:
            first_hotel_name = hotel_cards[0].find_element(
                By.CSS_SELECTOR,
                "h4"
            ).text.strip()

        except Exception:
            first_hotel_name = "First Hotel"

        print(
            f"First hotel: {first_hotel_name}"
        )


        # ====================================================
        # STEP 11 - ADD FIRST HOTEL TO TRIP
        # ====================================================

        add_to_trip_buttons = wait.until(
            EC.presence_of_all_elements_located(
                (
                    By.CSS_SELECTOR,
                    ".nearby-service-card .add-to-trip-btn"
                )
            )
        )

        assert len(add_to_trip_buttons) > 0

        driver.execute_script(
            """
            arguments[0].scrollIntoView({
                block: 'center'
            });
            """,
            add_to_trip_buttons[0]
        )

        driver.execute_script(
            "arguments[0].click();",
            add_to_trip_buttons[0]
        )

        print("STEP 11: Add to Trip clicked")

        # Wait briefly for React toast
        time.sleep(1)

        try:

            notification = WebDriverWait(
                driver,
                5
            ).until(
                EC.visibility_of_element_located(
                    (
                        By.CSS_SELECTOR,
                        ".trip-notification-toast"
                    )
                )
            )

            print(
                "Trip notification:",
                notification.text
            )

        except TimeoutException:

            print(
                "No trip notification displayed."
            )

        save_screenshot(
            driver,
            "TC004_08_hotel_added.png"
        )


        # ====================================================
        # STEP 12 - WAIT BEFORE MY TRIP
        # ====================================================

        time.sleep(1)

        print(
            "STEP 12: Waiting before opening My Trip"
        )


        # ====================================================
        # STEP 13 - OPEN MY TRIP
        # ====================================================

        my_trip_link = wait.until(
            EC.presence_of_element_located(
                (
                    By.CSS_SELECTOR,
                    'a[href="/plan-your-trip"]'
                )
            )
        )

        driver.execute_script(
            """
            arguments[0].scrollIntoView({
                block: 'center',
                inline: 'center'
            });
            """,
            my_trip_link
        )

        wait.until(
            lambda d: my_trip_link.is_displayed()
        )

        print(
            "STEP 13: My Trip link is visible"
        )

        save_screenshot(
            driver,
            "TC004_09_before_my_trip.png"
        )

        # JavaScript click avoids navbar position problems
        driver.execute_script(
            "arguments[0].click();",
            my_trip_link
        )

        wait.until(
            EC.url_contains("/plan-your-trip")
        )

        print(
            "STEP 13: My Trip page opened"
        )

        save_screenshot(
            driver,
            "TC004_09_my_trip.png"
        )


        # ====================================================
        # STEP 14 - HOTEL SECTION
        # ====================================================

        hotel_section = wait.until(
            EC.presence_of_element_located(
                (
                    By.XPATH,
                    '//h3[contains(normalize-space(), '
                    '"Hotels & Accommodation")]/ancestor::section[1]'
                )
            )
        )

        assert hotel_section.is_displayed()

        print(
            "STEP 14: Hotel booking section displayed"
        )


        
        # ====================================================
        # STEP 15 - SELECT FIRST ROOM
        # ====================================================

        room_select_element = wait.until(
            EC.presence_of_element_located(
                (
                    By.CSS_SELECTOR,
                    ".booking-details-section select"
                )
            )
        )

        # Scroll the select into view
        driver.execute_script(
            """
            arguments[0].scrollIntoView({
                block: 'center'
            });
            """,
            room_select_element
        )

        # Make sure it is visible
        wait.until(
            lambda d: room_select_element.is_displayed()
        )

        room_select = Select(room_select_element)

        room_options = room_select.options

        print(
            f"Available room options: {len(room_options)}"
        )

        assert len(room_options) > 1, (
            "No selectable hotel room found."
        )

        # Select the first actual room
        room_select.select_by_index(1)

        # Give React time to update
        time.sleep(1)

        selected_room_value = room_select_element.get_attribute(
            "value"
        )

        selected_room_text = room_select.first_selected_option.text

        print(
            "Selected room value:",
            selected_room_value
        )

        print(
            "Selected room:",
            selected_room_text
        )

        assert selected_room_value not in (
            "",
            None
        ), "Room was not selected."

        print(
            "STEP 15: First hotel room selected successfully"
        )


        # ====================================================
        # STEP 16 - CALCULATE DATES
        # ====================================================

        today = date.today()

        check_in = (
            today + timedelta(days=1)
        ).strftime("%Y-%m-%d")

        check_out = (
            today + timedelta(days=2)
        ).strftime("%Y-%m-%d")

        print(
            "STEP 16: Dates calculated"
        )

        print(
            "Check-in:",
            check_in
        )

        print(
            "Check-out:",
            check_out
        )


        # ====================================================
        # STEP 17 - SET REACT DATE INPUTS
        # ====================================================
        #
        # HTML date inputs do not work reliably with send_keys()
        # using YYYY-MM-DD in Chrome.
        #
        # We use the native HTMLInputElement value setter and
        # dispatch input/change events so React receives the
        # change.
        # ====================================================

        date_inputs = hotel_section.find_elements(
            By.CSS_SELECTOR,
            'input[type="date"]'
        )

        assert len(date_inputs) >= 2, (
            "Check-in/check-out date inputs not found."
        )

        check_in_input = date_inputs[0]
        check_out_input = date_inputs[1]


        def set_react_date(element, value):

            driver.execute_script(
                """
                const input = arguments[0];
                const value = arguments[1];

                const nativeSetter =
                    Object.getOwnPropertyDescriptor(
                        window.HTMLInputElement.prototype,
                        'value'
                    ).set;

                nativeSetter.call(input, value);

                input.dispatchEvent(
                    new Event('input', {
                        bubbles: true
                    })
                );

                input.dispatchEvent(
                    new Event('change', {
                        bubbles: true
                    })
                );

                input.dispatchEvent(
                    new Event('blur', {
                        bubbles: true
                    })
                );
                """,
                element,
                value
            )


        # ----------------------------------------------------
        # CHECK-IN
        # ----------------------------------------------------

        driver.execute_script(
            """
            arguments[0].scrollIntoView({
                block: 'center'
            });
            """,
            check_in_input
        )

        set_react_date(
            check_in_input,
            check_in
        )

        time.sleep(0.5)


        # ----------------------------------------------------
        # CHECK-OUT
        # ----------------------------------------------------

        driver.execute_script(
            """
            arguments[0].scrollIntoView({
                block: 'center'
            });
            """,
            check_out_input
        )

        set_react_date(
            check_out_input,
            check_out
        )

        time.sleep(1)


        # ----------------------------------------------------
        # VERIFY DATE VALUES
        # ----------------------------------------------------

        actual_check_in = check_in_input.get_attribute(
            "value"
        )

        actual_check_out = check_out_input.get_attribute(
            "value"
        )

        print(
            "Check-in field value:",
            actual_check_in
        )

        print(
            "Check-out field value:",
            actual_check_out
        )

        assert actual_check_in == check_in, (
            f"Check-in date was not entered correctly. "
            f"Expected {check_in}, got {actual_check_in}"
        )

        assert actual_check_out == check_out, (
            f"Check-out date was not entered correctly. "
            f"Expected {check_out}, got {actual_check_out}"
        )

        print(
            "STEP 17: Check-in and check-out dates "
            "entered successfully"
        )


        # ====================================================
        # STEP 18 - NUMBER OF ROOMS
        # ====================================================

        room_count_input = wait.until(
            EC.presence_of_element_located(
                (
                    By.CSS_SELECTOR,
                    '.booking-details-section input[type="number"]'
                )
            )
        )

        driver.execute_script(
            """
            arguments[0].scrollIntoView({
                block: 'center'
            });
            """,
            room_count_input
        )

        wait.until(
            lambda d: room_count_input.is_displayed()
        )

        # Use React-compatible native setter
        driver.execute_script(
            """
            const input = arguments[0];
            const value = arguments[1];

            const nativeSetter =
                Object.getOwnPropertyDescriptor(
                    window.HTMLInputElement.prototype,
                    'value'
                ).set;

            nativeSetter.call(input, value);

            input.dispatchEvent(
                new Event('input', {
                    bubbles: true
                })
            );

            input.dispatchEvent(
                new Event('change', {
                    bubbles: true
                })
            );

            input.dispatchEvent(
                new Event('blur', {
                    bubbles: true
                })
            );
            """,
            room_count_input,
            "1"
        )

        time.sleep(1)

        actual_room_count = room_count_input.get_attribute(
            "value"
        )

        print(
            "Number of rooms:",
            actual_room_count
        )

        assert actual_room_count == "1", (
            f"Room count was not entered correctly. "
            f"Expected 1, got {actual_room_count}"
        )

        print(
            "STEP 18: Number of rooms set to 1 successfully"
        )



        # ====================================================
        # STEP 19 - HOTEL AVAILABILITY
        # ====================================================

        availability_message = wait.until(
            EC.visibility_of_element_located(
                (
                    By.CSS_SELECTOR,
                    ".availability-feedback-msg"
                )
            )
        )

        availability_text = (
            availability_message.text.strip()
        )

        print(
            "Availability:",
            availability_text
        )

        availability_class = (
            availability_message
            .get_attribute("class")
            .lower()
        )

        if "error" in availability_class:

            save_screenshot(
                driver,
                "TC004_10_availability_error.png"
            )

            raise AssertionError(
                "Selected hotel room is not available: "
                + availability_text
            )

        print(
            "STEP 19: Hotel availability confirmed"
        )

        save_screenshot(
            driver,
            "TC004_10_booking_details.png"
        )


        # ====================================================
        # STEP 20 - BOOK THIS TRIP
        # ====================================================

        book_button = wait.until(
            EC.element_to_be_clickable(
                (
                    By.CSS_SELECTOR,
                    ".btn-book-this-trip"
                )
            )
        )

        driver.execute_script(
            """
            arguments[0].scrollIntoView({
                block: 'center'
            });
            """,
            book_button
        )

        time.sleep(0.5)

        book_button.click()

        print(
            "STEP 20: BOOK THIS TRIP clicked"
        )


        # ====================================================
        # STEP 21 - PAYMENT MODAL
        # ====================================================

        # First check whether application generated an alert.
        try:

            alert = WebDriverWait(
                driver,
                3
            ).until(
                EC.alert_is_present()
            )

            alert_text = alert.text

            print(
                "Application alert:",
                alert_text
            )

            save_screenshot(
                driver,
                "TC004_11_booking_alert.png"
            )

            alert.accept()

            raise AssertionError(
                "Booking could not continue. "
                "Application message: "
                + alert_text
            )

        except TimeoutException:

            # No alert means booking request probably succeeded.
            pass


        payment_modal = wait.until(
            EC.visibility_of_element_located(
                (
                    By.CSS_SELECTOR,
                    ".booking-payment-modal"
                )
            )
        )

        assert payment_modal.is_displayed()

        print(
            "STEP 21: Payment modal opened successfully"
        )

        save_screenshot(
            driver,
            "TC004_11_payment_modal.png"
        )


        # ====================================================
        # STEP 22 - SELECT OFFLINE PAYMENT
        # ====================================================

        offline_radio = wait.until(
            EC.element_to_be_clickable(
                (
                    By.CSS_SELECTOR,
                    'input[type="radio"][value="OFFLINE"]'
                )
            )
        )

        driver.execute_script(
            """
            arguments[0].scrollIntoView({
                block: 'center'
            });
            """,
            offline_radio
        )

        driver.execute_script(
            "arguments[0].click();",
            offline_radio
        )

        # Wait for React state update
        time.sleep(0.5)

        assert offline_radio.is_selected()

        print(
            "STEP 22: Offline payment selected"
        )

        save_screenshot(
            driver,
            "TC004_12_offline_payment_selected.png"
        )


        # ====================================================
        # STEP 23 - CONFIRM OFFLINE BOOKING
        # ====================================================

        confirm_button = wait.until(
            EC.element_to_be_clickable(
                (
                    By.CSS_SELECTOR,
                    ".btn-pay-confirm"
                )
            )
        )

        driver.execute_script(
            """
            arguments[0].scrollIntoView({
                block: 'center'
            });
            """,
            confirm_button
        )

        print(
            "Confirm button text:",
            confirm_button.text
        )

        confirm_button.click()

        print(
            "STEP 23: Offline booking confirmation clicked"
        )


        # ====================================================
        # STEP 24 - BOOKING SUCCESS
        # ====================================================

        success_modal = wait.until(
            EC.visibility_of_element_located(
                (
                    By.CSS_SELECTOR,
                    ".booking-success-modal"
                )
            )
        )

        assert success_modal.is_displayed()

        success_text = (
            success_modal.text.strip()
        )

        print(
            "Booking success message:"
        )

        print(
            success_text
        )

        assert (
            "Trip Booked Successfully"
            in success_text
            or
            "Payment Successful"
            in success_text
        ), (
            "Booking success message not found."
        )

        print(
            "STEP 24: Trip booked successfully"
        )

        save_screenshot(
            driver,
            "TC004_13_booking_success.png"
        )


        # ====================================================
        # FINAL RESULT
        # ====================================================

        print("\n" + "=" * 60)
        print("TC004 PASSED")
        print(
            "Login → Destinations → Hotel → "
            "My Trip → Booking → Offline Payment → Success"
        )
        print("=" * 60)


    except Exception as e:

        print(
            "\nTC004 FAILED:"
        )

        print(
            str(e)
        )

        try:
            save_screenshot(
                driver,
                "TC004_FAILED.png"
            )
        except Exception:
            pass

        raise


    finally:

        # Keep browser open for a short time so the final
        # result can be seen.
        time.sleep(2)

        driver.quit()

