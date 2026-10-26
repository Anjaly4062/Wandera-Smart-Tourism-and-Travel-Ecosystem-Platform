
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


def test_destination_view():
    driver = webdriver.Chrome()

    try:
        # Open the Wandera destination page
        driver.get("http://localhost:5173/destinations")

        # Wait for the page to load
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )

        # Print page details
        print("Current URL:", driver.current_url)
        print("Page title:", driver.title)

        # Verify the destination page opened
        assert "destinations" in driver.current_url.lower()

        # Check whether destination content is displayed
        body_text = driver.find_element(By.TAG_NAME, "body").text

        assert body_text.strip() != "", "Destination page is empty"

        # Save a screenshot
        driver.save_screenshot(
            "destination_view.png"
        )

        print("Destination page opened successfully.")
        print("Screenshot saved as destination_view.png")

    finally:
        driver.quit()
