
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from pathlib import Path
import time


def test_tourist_login():

    driver = webdriver.Chrome()
    driver.maximize_window()

    screenshot_folder = Path("screenshots")
    screenshot_folder.mkdir(exist_ok=True)

    try:
        # Open Login page directly
        driver.get("http://localhost:5173/login")

        # Wait for Login page
        WebDriverWait(driver, 10).until(
            EC.url_contains("/login")
        )

        print("Login page opened successfully.")

        # Enter email
        email = WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located(
                (By.CSS_SELECTOR, 'input[placeholder="Email Address"]')
            )
        )

        email.send_keys("selenium.test.tourist@gmail.com")

        # Enter password
        password = WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located(
                (By.CSS_SELECTOR, 'input[placeholder="Password"]')
            )
        )

        password.send_keys("Test@12345")

        print("Login details entered successfully.")

        # Screenshot of filled form
        driver.save_screenshot(
            str(screenshot_folder / "TC003_login_form_filled.png")
        )

        # Click Login button
        login_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable(
                (By.XPATH, '//button[normalize-space()="Login"]')
            )
        )

        login_button.click()

        print("Login button clicked.")

        # Wait for login processing
        time.sleep(3)

        # Check current URL
        current_url = driver.current_url

        print("Current URL:", current_url)

        if "/login" not in current_url:

            driver.save_screenshot(
                str(screenshot_folder / "TC003_login_success.png")
            )

            print("Tourist login successful.")

        else:

            driver.save_screenshot(
                str(screenshot_folder / "TC003_login_failed.png")
            )

            print("Tourist login failed.")

            assert False, "Tourist login failed."

    finally:
        driver.quit()
