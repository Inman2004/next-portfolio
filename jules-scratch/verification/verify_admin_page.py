from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Go to the admin page
    page.goto("http://localhost:3000/admin")

    # Wait for the redirect to the signin page
    expect(page).to_have_url("http://localhost:3000/signin?callbackUrl=%2Fadmin")

    # Take a screenshot of the signin page
    page.screenshot(path="jules-scratch/verification/admin_signin_redirect.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)