from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from pathlib import Path
import time


def test_tourist_registration():

    driver = webdriver.Chrome()
    driver.maximize_window()

    screenshot_folder = Path("screenshots")
    screenshot_folder.mkdir(exist_ok=True)

    try:
        # 1. Open Wandera homepage
        driver.get("http://localhost:5173")

        # 2. Click Signup
        signup_link = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable(
                (By.CSS_SELECTOR, 'a[href="/signup"]')
            )
        )
        signup_link.click()

        # 3. Wait for Signup page
        WebDriverWait(driver, 10).until(
            EC.url_contains("/signup")
        )

        print("Signup page opened successfully.")

        # 4. Enter Full Name
        full_name = WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.ID, "full_name"))
        )
        full_name.send_keys("Selenium Test Tourist")

        # 5. Enter Email
        email = driver.find_element(By.ID, "email")
        email.send_keys("selenium.test.tourist@gmail.com")

        # 6. Enter Password
        password = driver.find_element(By.ID, "password")
        password.send_keys("Test@12345")

        # 7. Enter Confirm Password
        confirm_password = driver.find_element(By.ID, "confirm_password")
        confirm_password.send_keys("Test@12345")

        # 8. Make sure Account Type is Tourist
        role = driver.find_element(By.ID, "role")
        role.send_keys("Tourist")

        # 9. Screenshot before submitting
        driver.save_screenshot(
            str(screenshot_folder / "TC002_registration_form_filled.png")
        )

        print("Registration form filled successfully.")
        print("Screenshot saved: TC002_registration_form_filled.png")

        # 10. Click Register
        register_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable(
                (By.CSS_SELECTOR, 'button[type="submit"]')
            )
        )
        register_button.click()

        # 11. Wait for registration result
        time.sleep(3)

        # 12. Check result
        current_url = driver.current_url

        if current_url.endswith("/") and "/signup" not in current_url:
            # Registration successful
            driver.save_screenshot(
                str(screenshot_folder / "TC002_registration_success.png")
            )

            print("Registration successful.")
            print("Screenshot saved: TC002_registration_success.png")

        else:
            # Registration failed
            driver.save_screenshot(
                str(screenshot_folder / "TC002_registration_failed.png")
            )

            print("Registration failed.")
            print("Screenshot saved: TC002_registration_failed.png")

            assert False, "Tourist registration failed."

    finally:
        driver.quit()