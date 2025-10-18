
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Navigate to a blog post edit page (replace 'test-post' with a real post ID if needed)
    page.goto("http://localhost:3000/admin/blog/edit/test-post")

    # Wait for the editor to be visible
    page.wait_for_selector('.toastui-editor-main')

    # Take a screenshot
    page.screenshot(path="jules-scratch/verification/verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
