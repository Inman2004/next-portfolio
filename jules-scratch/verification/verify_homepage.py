from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Go to the homepage
    page.goto("http://localhost:3000/")

    # Wait for the page to load by looking for a known element
    expect(page.get_by_role("heading", name="Full Stack Developer")).to_be_visible()

    # Take a screenshot of the homepage
    page.screenshot(path="jules-scratch/verification/homepage.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)