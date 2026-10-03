from selenium import webdriver
from selenium.webdriver.common.by import By


def test_wandera_homepage():

    driver = webdriver.Chrome()

    try:
        driver.get("http://localhost:5173/")

        print("Page URL:", driver.current_url)
        print("Page Title:", driver.title)

        assert "localhost:5173" in driver.current_url

        print("TEST PASSED: Wandera homepage opened successfully.")

    finally:
        driver.quit()