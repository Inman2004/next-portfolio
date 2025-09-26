import re
from playwright.sync_api import sync_playwright, Page, expect

def verify_chatbot(page: Page):
    # 1. Open the chat widget
    chat_button = page.get_by_role("button", name="Open chat")
    expect(chat_button).to_be_visible()
    chat_button.click()

    # 2. Verify the initial greeting and header
    chat_panel = page.get_by_role("dialog", name="Chat assistant")
    expect(chat_panel).to_be_visible()
    expect(chat_panel.get_by_text("AI Assistant")).to_be_visible()
    initial_message = "Greetings. I am Mimir, an AI assistant created by Immanuvel to share knowledge about his work."
    expect(chat_panel.get_by_text(initial_message)).to_be_visible()

    # Function to send a message and get the last response
    def ask_question_and_get_response(question: str):
        page.get_by_placeholder("Type your message...").fill(question)
        page.get_by_role("button", name="Send").click()
        # Wait for the "Thinking..." message to disappear
        expect(page.get_by_text("Thinking...")).to_be_hidden(timeout=20000)
        # Return the last message from the assistant
        return chat_panel.locator('[class*="bg-zinc-100"]').last

    # 3. Ask "Who are you?" and verify the response
    response_who = ask_question_and_get_response("Who are you?")
    expect(response_who).to_contain_text("I am Mimir, an AI assistant created by Immanuvel.")

    # 4. Ask for a skill rating
    response_rating = ask_question_and_get_response("What is your rating for React out of 10?")
    expect(response_rating).to_contain_text("Immanuvel's proficiency in React is at an Advanced level.")

    # 5. Ask about an unlisted technology
    response_redux = ask_question_and_get_response("Do you know Redux?")
    expect(response_redux).to_contain_text("Immanuvel's profile does not include experience with Redux.")

    # 6. Ask about an acronym
    response_rag = ask_question_and_get_response("What is RAG?")
    expect(response_rag).to_contain_text("Retrieval-Augmented Generation")

    # 7. Ask about the blog
    response_blog = ask_question_and_get_response("Where does Immanuvel post his blogs?")
    expect(response_blog.get_by_role("link", name="Building a Modern Portfolio with Next.js and Tailwind CSS")).to_be_visible()

    # 8. Take a screenshot
    page.screenshot(path="jules-scratch/verification/mimir_verification.png")


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:3001")
        verify_chatbot(page)
        browser.close()

if __name__ == "__main__":
    main()