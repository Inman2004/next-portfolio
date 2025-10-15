from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:3000", timeout=120000)

    # Wait for the chat widget to be attached to the DOM
    page.wait_for_selector('button[aria-label="Open chat"]', state='attached', timeout=120000)
    page.wait_for_timeout(5000) # Wait for 5 seconds to ensure the component is fully loaded

    # Open the chat widget
    page.click('button[aria-label="Open chat"]')
    page.screenshot(path="jules-scratch/verification/chat-widget.png")

    # Go to the full-screen chat page
    page.wait_for_selector('a[aria-label="Fullscreen"]', timeout=120000)
    page.click('a[aria-label="Fullscreen"]')
    page.wait_for_url("http://localhost:3000/chat", timeout=120000)
    page.screenshot(path="jules-scratch/verification/fullscreen-chat.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
