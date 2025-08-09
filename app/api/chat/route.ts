import { NextRequest } from "next/server";
import { experiences } from "@/data/experiences";
import { projects } from "@/data/projects";
import { resume } from "@/data/resume";
import { faq } from "@/data/faq";
import { intentSynonyms } from "@/data/intentSynonyms";

export const runtime = "edge";

type Msg = { role: "user" | "assistant" | "system"; content: string };

function lastUserMessage(messages: Msg[]): string | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user") return messages[i].content || "";
  }
  return null;
}

function answerByIntent(key: string, query: string): string {
  switch (key) {
    case "name":
      return `**Name**\n${answerName()}`;
    case "contact":
      return answerContact();
    case "skills":
      return `**Skills**\n${answerSkills()}`;
    case "experience":
      return `**Experience**\n${answerExperience()}`;
    case "projects":
      return `**Projects**\n${answerProjects(query)}`;
    case "education":
      return `**Education**\n${answerEducation()}`;
    case "achievements":
      return `**Achievements**\n${answerAchievements()}`;
    case "location":
      return `**Location**\n${answerLocation()}`;
    case "availability":
      return `**Availability**\n${answerAvailability()}`;
    case "about":
    default:
      return `**About**\n${answerAbout()}`;
  }
}

function composeMultiIntent(text: string) {
  const scored = scoreIntents(text);
  const selected = scored.filter((s) => s.score > 0 && s.key !== 'about').slice(0, 2);
  if (selected.length < 2) return "";
  const parts = selected.map((s) => answerByIntent(s.key, text));
  return parts.join("\n\n");
}

function faqTopMatches(query: string, n = 3) {
  const qNorm = normalize(query);
  const qTokens = new Set(tokenize(query));
  const scored = faq.map((f, idx) => {
    const qTokensFaq = new Set(tokenize(f.question));
    const tagTokens = new Set(tokenize((f.tags || []).join(" ")));
    const ansTokens = new Set(tokenize(f.answer));
    let score = 0;
    for (const w of qTokens) if (qTokensFaq.has(w)) score += 3;
    for (const w of qTokens) if (tagTokens.has(w)) score += 2;
    let ansOverlap = 0;
    for (const w of qTokens) if (ansTokens.has(w)) ansOverlap++;
    score += Math.min(ansOverlap, 5);
    const fq = normalize(f.question);
    if (qNorm.includes(fq) || fq.includes(qNorm)) score += 5;
    // Fuzzy similarity on the whole question
    const sim = fuzzySim(qNorm, fq);
    if (sim >= 0.8) score += 4; else if (sim >= 0.6) score += 2;
    return { idx, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, Math.max(0, n));
}
 

// FAQ matching (top-level)
// Weighted FAQ matching
function faqBestMatch(query: string) {
  const qNorm = normalize(query);
  const qTokens = new Set(tokenize(query));
  let best = { idx: -1, score: 0 };
  for (let i = 0; i < faq.length; i++) {
    const f = faq[i];
    const qTokensFaq = new Set(tokenize(f.question));
    const tagTokens = new Set(tokenize((f.tags || []).join(" ")));
    const ansTokensArr = tokenize(f.answer);
    const ansTokens = new Set(ansTokensArr);
    let score = 0;
    // Question-token overlap (weight 3)
    for (const w of qTokens) if (qTokensFaq.has(w)) score += 3;
    // Tag overlap (weight 2)
    for (const w of qTokens) if (tagTokens.has(w)) score += 2;
    // Answer overlap (weight 1, capped)
    let ansOverlap = 0;
    for (const w of qTokens) if (ansTokens.has(w)) ansOverlap++;
    score += Math.min(ansOverlap, 5);
    // Phrase bonus if query contains question or vice versa
    const fq = normalize(f.question);
    if (qNorm.includes(fq) || fq.includes(qNorm)) score += 5;
    // Fuzzy similarity on the whole question
    const sim = fuzzySim(qNorm, fq);
    if (sim >= 0.8) score += 4; else if (sim >= 0.6) score += 2;
    if (score > best.score) best = { idx: i, score };
  }
  return best;
}

function answerFAQ(idx: number) {
  const f = faq[idx];
  return `**${f.question}**\n${f.answer}`;
}

function listFAQ(limit = 10) {
  const items = faq.slice(0, limit).map((f) => `- ${f.question}`);
  return `**FAQ (Top ${items.length})**\n${items.join("\n")}`;
}

function suggestFAQ(topN = 3) {
  const items = faq.slice(0, topN).map((f) => `- ${f.question}`);
  return `**Did you mean…**\n${items.join("\n")}`;
}

function didYouMean(query: string, n = 3) {
  const top = faqTopMatches(query, n).filter((x: { idx: number; score: number }) => x.score > 0);
  if (!top.length) return suggestFAQ(n);
  const lines = top.map(({ idx }: { idx: number; score: number }) => `- ${faq[idx].question}`);
  return `**Did you mean…**\n${lines.join("\n")}`;
}

function normalize(text: string) {
  let t = text.toLowerCase();
  // Remove bracketed numeric refs like [1, 2, 3]
  t = t.replace(/\[[\s\d,]+\]/g, " ");
  // Strip common greetings at the start (e.g., "hi:", "hello,", "hey-")
  t = t.replace(/^(?:\s*(?:hi|hello|hey|greetings|hi there|hello there|good\s+(?:morning|afternoon|evening)))\s*[:,\-]*\s*/i, "");
  // Collapse whitespace
  return t.replace(/\s+/g, " ").trim();
}

function pickTop<T>(arr: T[], n: number) {
  return arr.slice(0, Math.max(0, n));
}

function naturalJoin(items: string[], conj = 'and') {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} ${conj} ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, ${conj} ${items[items.length - 1]}`;
}

function isGreeting(text: string) {
  const t = (text || '').toLowerCase().trim();
  return /^(hi|hello|hey|greetings|hi there|hello there|yo|sup|good\s+(?:morning|afternoon|evening))([!.,:]*)?$/.test(t);
}

function intentFrom(text: string) {
  const t = normalize(text);
  const has = (w: string | RegExp) => (typeof w === "string" ? t.includes(w) : w.test(t));
  const fuzzyHas = (w: string) => {
    const s = normalize(w);
    if (!s) return false;
    if (t.includes(s)) return true;
    // Fuzzy similarity on whole phrase
    const sim = fuzzySim(t, s);
    return sim >= 0.8; // tolerate common typos like "stak"->"stack", "algorithims"->"algorithms"
  };

  // Strong phrase triggers
  if ([
    "introduce yourself",
    "self intro",
    "self introduction",
    "tell me about yourself",
    "about yourself",
    "who are you",
  ].some((p) => has(p))) {
    return "about";
  }

  const intents: { key: string; score: number }[] = Object.entries(intentSynonyms).map(([key, arr]) => {
    const match = arr.some((k) => typeof k === 'string' ? (has(k) || fuzzyHas(k)) : has(k));
    // Slightly higher weight for exact name questions
    const boosted = key === "name" && arr.some((k) => typeof k === 'string' && t === k) ? 2 : 0;
    return { key, score: match ? 1 + boosted : 0 };
  });
  intents.sort((a, b) => b.score - a.score);
  return intents[0].score > 0 ? intents[0].key : "about";
}

function scoreIntents(text: string) {
  const t = normalize(text);
  const has = (w: string | RegExp) => (typeof w === "string" ? t.includes(w) : w.test(t));
  const fuzzyHas = (w: string) => {
    const s = normalize(w);
    if (!s) return false;
    if (t.includes(s)) return true;
    const sim = fuzzySim(t, s);
    return sim >= 0.8;
  };
  const scores = Object.entries(intentSynonyms).map(([key, keys]) => ({
    key,
    score: keys.some((k)=> typeof k === 'string' ? (has(k) || fuzzyHas(k)) : has(k)) ? 1 : 0,
  }));
  scores.sort((a,b)=>b.score-a.score);
  return scores;
}

// Levenshtein distance and normalized similarity
function levenshtein(a: string, b: string) {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

function fuzzySim(a: string, b: string) {
  const dist = levenshtein(a, b);
  const maxLen = Math.max(1, Math.max(a.length, b.length));
  return 1 - dist / maxLen;
}

function isKnownTopic(text: string) {
  const t = normalize(text);
  const keywords = [
    "name",
    "contact",
    "email",
    "phone",
    "linkedin",
    "skills",
    "tech",
    "stack",
    "experience",
    "work",
    "role",
    "company",
    "project",
    "github",
    "education",
    "degree",
    "college",
    "university",
    "diploma",
    "achievement",
    "award",
    "cert",
    "course",
    "location",
    "based",
    "availability",
    "available",
    "join",
    "notice",
    "about",
    // compensation-related
    "salary",
    "ctc",
    "compensation",
    "pay",
    "package",
  ];
  return keywords.some((k) => t.includes(k));
}

function answerNoData() {
  const email = resume.links.email ? resume.links.email.replace('mailto:', '') : '';
  const phone = (resume.links as any).phone ? (resume.links as any).phone as string : '';
  const items: string[] = [];
  if (email) items.push(`- **Email**: [${email}](mailto:${email})`);
  if (phone) items.push(`- **Phone**: [${phone}](tel:${phone.replace(/\s+/g, '')})`);
  if (resume.links.linkedin) items.push(`- **LinkedIn**: [${urlLabel(resume.links.linkedin)}](${resume.links.linkedin})`);
  const footer = items.length ? `\n\nYou can reach me via:\n${items.join('\n')}` : '';
  return `**Sorry — I don't have that info yet.**${footer}`;
}

function answerName() {
  return `I'm **${resume.name}**.`;
}

function answerAbout() {
  return `Hi! I'm ${resume.name}, ${resume.headline}. ${resume.about}`;
}

function answerLocation() {
  return `Location: ${resume.location}. Open to: ${resume.openTo.join(", ")}.`;
}

function answerAvailability() {
  return `I'm available ${resume.availability}. I speak ${naturalJoin(resume.languages, 'and')}.`;
}

function urlLabel(u: string) {
  try {
    const url = new URL(u);
    const host = url.hostname.replace(/^www\./, "");
    const path = url.pathname.replace(/\/$/, "");
    return path && path !== "/" ? `${host}${path}` : host;
  } catch {
    return u.replace(/^mailto:/, "").replace(/^tel:/, "");
  }
}

function answerContact() {
  const email = resume.links.email ? resume.links.email.replace('mailto:', '') : '';
  const phone = (resume.links as any).phone ? (resume.links as any).phone as string : '';
  const items: string[] = [];
  if (email) items.push(`- **Email**: [${email}](mailto:${email})`);
  if (phone) items.push(`- **Phone**: [${phone}](tel:${phone.replace(/\s+/g, '')})`);
  if (resume.links.linkedin) items.push(`- **LinkedIn**: [${urlLabel(resume.links.linkedin)}](${resume.links.linkedin})`);
  if (resume.links.github) items.push(`- **GitHub**: [${urlLabel(resume.links.github)}](${resume.links.github})`);
  if (resume.links.portfolio) items.push(`- **Portfolio**: [${urlLabel(resume.links.portfolio)}](${resume.links.portfolio})`);
  if ((resume.links as any).twitter) items.push(`- **Twitter**: [${urlLabel((resume.links as any).twitter)}](${(resume.links as any).twitter})`);
  return `**Contact**\n${items.join('\n')}`;
}

function answerSkills() {
  const lines = resume.skills
    .map((c) => `- ${c.name}: ${c.items.slice(0, 8).join(", ")}`)
    .join("\n");
  return `Here’s a quick snapshot of my stack:\n${lines}`;
}

function answerEducation() {
  const lines = resume.education
    .map((e) => `- ${e.institution} — ${e.program} (${e.startDate}–${e.endDate})`)
    .join("\n");
  return `Education highlights:\n${lines}`;
}

function answerAchievements() {
  const lines = pickTop(resume.achievements, 5)
    .map((a) => `- ${a.title}${a.when ? ` (${a.when})` : ""}${a.details ? ` — ${a.details}` : ""}`)
    .join("\n");
  return `A few highlights:\n${lines}`;
}

function answerBlog() {
  const blogUrl = "/blog";
  const username = "rvimman";
  const email = "rvimmanrvimman@gmail.com";
  return `**Blog**\nYou can browse my latest posts here: [Blog](${blogUrl}).\n\n- Filter by **username**: \`${username}\`\n- Or by **email**: \`${email}\``;
}

function tokenize(s: string) {
  return normalize(s).split(/[^a-z0-9+.#]+/).filter(Boolean);
}

function projectMatchScore(query: string, p: any) {
  const q = tokenize(query);
  const fields = [p.title, p.description, ...(p.technologies || [])].join(" ");
  const t = tokenize(fields);
  const set = new Set(t);
  let score = 0;
  for (const w of q) if (set.has(w)) score++;
  // slight boost for exact title word
  for (const w of q) if (p.title.toLowerCase().includes(w)) score += 0.5;
  return score;
}

function answerProjects(query?: string) {
  const arr = [...projects];
  if (query && query.trim()) {
    arr.sort((a, b) => projectMatchScore(query, b) - projectMatchScore(query, a));
  }
  const top = pickTop(arr, 3);
  const lines = top.map((p) => `- ${p.title}: ${p.description} (Tech: ${p.technologies.slice(0, 6).join(", ")})${p.github ? ` — GitHub: ${p.github}` : ""}${p.live ? ` — Live: ${p.live}` : ""}`);
  return `Here are a few project highlights:${lines.length ? '\n' + lines.join('\n') : ''}`;
}

function answerExperience() {
  const top = pickTop(experiences, 2);
  if (top.length === 0) return "I don't have work experience listed yet, but I'm actively building projects and learning fast.";

  const parts: string[] = [];
  const first = top[0];
  const firstSkills = naturalJoin(first.skills.slice(0, 6));
  const firstDesc = first.description?.[0] ? ` Recently, ${first.description[0].replace(/\.$/, '')}.` : '';
  parts.push(`I'm currently working as ${first.role} at ${first.company} (${first.startDate}–${first.endDate}) in ${first.location}, focusing on ${firstSkills}.${firstDesc}`);

  if (top[1]) {
    const prev = top[1];
    const prevSkills = naturalJoin(prev.skills.slice(0, 6));
    const prevDesc = prev.description?.[0] ? ` Highlights include ${prev.description[0].replace(/\.$/, '')}.` : '';
    parts.push(`Before that, I was ${prev.role} with ${prev.company} (${prev.startDate}–${prev.endDate}) working ${prev.location === 'Remote' ? 'remotely' : `in ${prev.location}`} with ${prevSkills}.${prevDesc}`);
  }

  return parts.join(' ');
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { messages: Msg[] };
    if (!body?.messages || !Array.isArray(body.messages)) {
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const query = lastUserMessage(body.messages) || "";
    const rawLower = query.toLowerCase().trim();
    if (isGreeting(rawLower)) {
      const final = `**About**\n${answerAbout()}\n\nAsk me about **skills**, **projects**, **education**, or **contact**.`;
      return new Response(JSON.stringify({ reply: final }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    // Quick commands
    if (normalize(query) === "list faq" || /^(show|list)\s+faq/.test(normalize(query))) {
      const reply = listFAQ(12);
      return new Response(JSON.stringify({ reply }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Score intents early to decide precedence vs. low-confidence FAQ
    const intent = intentFrom(query);
    const intentScores = scoreIntents(query);
    const topIntentScore = intentScores.length ? intentScores[0].score : 0;

    // Try FAQ first (weighted), but only let low-confidence FAQ suggestions win
    // when there is no clear intent detected.
    const best = faqBestMatch(query);
    if (best.idx >= 0) {
      if (best.score >= 4) {
        const reply = answerFAQ(best.idx);
        const final = `${reply}`;
        return new Response(JSON.stringify({ reply: final }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } else if (best.score >= 1 && topIntentScore === 0) {
        // Low confidence: only suggest when no intent is detected
        const reply = `${didYouMean(query, 5)}\n\nIf none of these fit, ask me about **skills**, **projects**, **education**, or **contact**.`;
        return new Response(JSON.stringify({ reply }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    }
    // Compose multi-intent response when the query mentions 2 topics
    const multi = composeMultiIntent(query);
    if (multi) {
      const final = `${multi}`;
      return new Response(JSON.stringify({ reply: final }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // If no intent is detected at all, return a polite fallback
    if (topIntentScore === 0 && query.trim()) {
      const reply = answerNoData();
      return new Response(JSON.stringify({ reply }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    let reply = "";
    switch (intent) {
      case "name":
        reply = answerName();
        break;
      case "contact":
        reply = answerContact();
        break;
      case "skills":
        reply = answerSkills();
        break;
      case "experience":
        reply = answerExperience();
        break;
      case "projects":
        reply = answerProjects(query);
        break;
      case "blog":
        reply = answerBlog();
        break;
      case "education":
        reply = answerEducation();
        break;
      case "achievements":
        reply = answerAchievements();
        break;
      case "location":
        reply = answerLocation();
        break;
      case "availability":
        reply = answerAvailability();
        break;
      case "about":
      default:
        reply = answerAbout();
        break;
    }

    // Keep concise; add a follow-up prompt
    const final = `${reply}\n\nNeed details on skills, experience, projects, or contact?`;
    return new Response(JSON.stringify({ reply: final }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("/api/chat (no-AI) error", err);
    return new Response(JSON.stringify({ error: "Unexpected server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Test-only export of internals (used by unit tests)
export const __test__ = {
  intentFrom,
  scoreIntents,
  composeMultiIntent,
  faqBestMatch,
  faqTopMatches,
  didYouMean,
  normalize,
  isGreeting,
  tokenize,
  fuzzySim,
  levenshtein,
  answerFAQ,
};
