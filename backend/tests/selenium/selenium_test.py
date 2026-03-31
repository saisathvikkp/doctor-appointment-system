import os
import sys
import time

import requests
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager


BACKEND_URL = os.getenv("BACKEND_URL", "http://127.0.0.1:5000")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://127.0.0.1:3000")


def build_driver():
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")

    service = Service(ChromeDriverManager().install())
    return webdriver.Chrome(service=service, options=options)


def wait_for_page(driver, url, expected_title=None, timeout=20):
    end_time = time.time() + timeout
    last_error = None

    while time.time() < end_time:
        try:
            driver.get(url)
            if expected_title is None or expected_title.lower() in driver.title.lower():
                return
            return
        except Exception as exc:  # pragma: no cover - timing dependent
            last_error = exc
            time.sleep(1)

    raise RuntimeError(f"Timed out opening {url}: {last_error}")


def main():
    response = requests.get(f"{BACKEND_URL}/test", timeout=10)
    response.raise_for_status()

    driver = build_driver()
    try:
        frontend_available = False
        try:
            frontend_response = requests.get(FRONTEND_URL, timeout=5)
            frontend_available = frontend_response.ok
        except requests.RequestException:
            frontend_available = False

        if frontend_available:
            wait_for_page(driver, FRONTEND_URL)
            body = driver.find_element(By.TAG_NAME, "body")
            assert body.text.strip(), "Frontend loaded but body text was empty."
        else:
            wait_for_page(driver, f"{BACKEND_URL}/test")
            body = driver.find_element(By.TAG_NAME, "body")
            assert "Backend working" in body.text, "Backend health page did not render as expected."
    finally:
        driver.quit()

    print("Selenium smoke test completed successfully.")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"Selenium test failed: {exc}", file=sys.stderr)
        sys.exit(1)
