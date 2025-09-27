import time
from playwright.sync_api import sync_playwright, Page, expect

def verify_animations(page: Page):
    # Wait for the page to be fully loaded and network to be idle
    page.wait_for_load_state('networkidle')

    # 1. Verify Hero section animations
    hero_section = page.locator("#home")
    expect(hero_section).to_be_visible(timeout=10000) # Increased timeout
    # Wait for number ticker animation
    page.wait_for_timeout(2000)
    hero_section.screenshot(path="jules-scratch/verification/01_hero_section.png")

    # 2. Verify Roadmap section animations
    roadmap_section = page.locator("#roadmap")
    roadmap_section.scroll_into_view_if_needed()
    # Wait for the animated beam to complete its cycle
    page.wait_for_timeout(7000)
    roadmap_section.screenshot(path="jules-scratch/verification/02_roadmap_section.png")

    # 3. Verify BlurFade on a subsequent section (Projects)
    projects_section = page.locator("#projects")
    projects_section.scroll_into_view_if_needed()
    page.wait_for_timeout(1000) # Wait for fade-in
    projects_section.screenshot(path="jules-scratch/verification/03_projects_section.png")


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_viewport_size({"width": 1280, "height": 800})
        page.goto("http://localhost:3001")
        verify_animations(page)
        browser.close()

if __name__ == "__main__":
    main()