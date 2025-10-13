import { __test__ } from "../app/api/chat/route";

function assert(cond: any, msg: string) {
  if (!cond) {
    console.error("Assertion failed:", msg);
    process.exit(1);
  }
}

function includes(hay: string, needle: string) {
  return hay.toLowerCase().includes(needle.toLowerCase());
}

(async function main() {
  // 1) Greeting strip + FAQ mapping (leadership)
  const q1 = "hi: Do you have leadership qualities?";
  const best = __test__.faqBestMatch(q1);
  assert(best.idx >= 0, "faqBestMatch should find a match for leadership question");
  const ans = __test__.answerFAQ(best.idx);
  assert(includes(ans, "mentor peers"), "leadership answer should mention 'mentor peers'");

  // 2) Fuzzy intent detection: 'stak' -> skills
  const intent = __test__.intentFrom("stak");
  assert(intent === "skills", `intentFrom('stak') should be 'skills', got '${intent}'`);

  // 3) Normalize strips bracketed refs
  const norm = __test__.normalize("NLP [1, 2, 3] overview");
  assert(!/\[\d/.test(norm), "normalize should remove bracketed numeric refs");

  // 4) Greeting-only detection
  assert(__test__.isGreeting("hello"), "isGreeting('hello') should be true");
  assert(__test__.isGreeting("good morning"), "isGreeting('good morning') should be true");
  assert(!__test__.isGreeting("hello there, tell me about projects"), "isGreeting should be false when message is not greeting-only");

  console.log("OK: chat-router basic tests passed.");
})();
