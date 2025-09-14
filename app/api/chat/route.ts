import { NextRequest } from "next/server";
import { experiences } from "@/data/experiences";
import { projects } from "@/data/projects";
import { resume } from "@/data/resume";
import { faq } from "@/data/faq";
import { intentSynonyms } from "@/data/intentSynonyms";
import { getRelevantContext, generateRAGPrompt, getDataFreshnessInfo } from "@/lib/rag";
import { HfInference } from "@huggingface/inference";

export const runtime = "nodejs";

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

async function generateHuggingFaceResponse(prompt: string): Promise<string> {
  try {
    const model = "google/gemma-2-2b-it";
    const response = await hf.chatCompletion({
      model,
      messages: [{ role: "user", content: prompt }],
      parameters: {
        max_new_tokens: 512,
        temperature: 0.7,
        top_p: 0.95,
        repetition_penalty: 1.2,
      },
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Hugging Face API error:", error);
    // Try a smaller model as a fallback
    try {
      const model = "HuggingFaceH4/zephyr-7b-beta";
      const response = await hf.chatCompletion({
        model,
        messages: [{ role: "user", content: prompt }],
        parameters: {
          max_new_tokens: 512,
          temperature: 0.7,
          top_p: 0.95,
          repetition_penalty: 1.2,
        },
      });
      return response.choices[0].message.content;
    } catch (fallbackError) {
      console.error("Hugging Face fallback API. This is likely due to a problem with the Hugging Face API, or the API key.", fallbackError);
      return ""; // Return empty string to trigger the rule-based fallback
    }
  }
}

type Msg = { role: "user" | "assistant" | "system"; content: string };

// Response cache for common queries
const responseCache = new Map<string, { response: string, timestamp: number }>();
const RESPONSE_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function getResponseCacheKey(query: string): string {
  return query.toLowerCase().trim();
}

function isResponseCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < RESPONSE_CACHE_TTL;
}

function getCachedResponse(query: string): string | null {
  const cacheKey = getResponseCacheKey(query);
  const cached = responseCache.get(cacheKey);
  
  if (cached && isResponseCacheValid(cached.timestamp)) {
    return cached.response;
  }
  
  return null;
}

function cacheResponse(query: string, response: string): void {
  const cacheKey = getResponseCacheKey(query);
  responseCache.set(cacheKey, {
    response,
    timestamp: Date.now()
  });
  
  // Clean up old cache entries (keep only last 50)
  if (responseCache.size > 50) {
    const entries = Array.from(responseCache.entries());
    entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
    entries.slice(50).forEach(([key]) => responseCache.delete(key));
  }
}

function respond(reply: string, source?: string, cacheHit?: boolean) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (process.env.NODE_ENV !== "production") {
    if (source) headers["X-AI-Source"] = source;
    if (cacheHit !== undefined) headers["X-Cache-Hit"] = cacheHit.toString();
    
    // Add data freshness info in development
    const freshnessInfo = getDataFreshnessInfo();
    if (freshnessInfo) {
      headers["X-Data-Freshness"] = JSON.stringify({
        lastUpdate: new Date(freshnessInfo.timestamp).toISOString(),
        dataSources: Object.keys(freshnessInfo).filter(key => key !== 'timestamp')
      });
    }
  }
  return new Response(JSON.stringify({ reply }), { status: 200, headers });
}

// RAG-based response system
async function generateRAGReply(query: string): Promise<string> {
  try {
    // Check cache first
    const cached = getCachedResponse(query);
    if (cached) {
      return cached;
    }
    
    // Get relevant context from vector database
    const context = getRelevantContext(query, 3);
    
    // Generate RAG prompt
    const prompt = generateRAGPrompt(query, context);
    
    // Generate response
    let response = await generateHuggingFaceResponse(prompt);

    // If Hugging Face fails, fall back to the rule-based system
    if (!response) {
      response = generateContextualResponse(query, context);
    }
    
    // Cache the response
    cacheResponse(query, response);
    
    return response;
  } catch (error) {
    console.error("RAG error:", error);
    return generateSmartReply(query, "");
  }
}

// Smart rule-based response system (fallback)
function generateSmartReply(query: string, context: string): string {
  const q = query.toLowerCase();
  
  // Self-introduction questions
  if (/(introduce yourself|self intro|self introduction|explain yourself|about yourself|who are you)/i.test(q)) {
    return `Hi! I'm ${resume.name}, ${resume.headline}. ${resume.about} I'm based in ${resume.location} and speak ${resume.languages.join(' and ')}.`;
  }
  
  // Language/confidence questions
  if (/(english|language|languages|fluency|proficiency|confident)/i.test(q)) {
    return `I communicate comfortably in ${resume.languages.join(' and ')}, with English being my primary language for technical communication and documentation.`;
  }
  
  // Success/work measurement questions
  if (/(measure|success|impact|metric|kpi|effectiveness|how do you know|how do you measure)/i.test(q)) {
    return `I measure success by whether solutions work reliably in real-world conditions, not just in demos. I focus on user value, measurable impact, and practical outcomes.`;
  }
  
  // Strengths/weaknesses
  if (/(strength|strong|good at|excel|weakness|improve|grow)/i.test(q)) {
    if (q.includes('weakness') || q.includes('improve')) {
      return `I'm always learning and improving. I focus on staying current with technology trends and expanding my expertise in areas like cloud architecture and advanced AI integration.`;
    } else {
      return `My key strengths include ${resume.skills.slice(0,3).map(s => s.name.toLowerCase()).join(', ')}, and I'm particularly good at translating business requirements into scalable technical solutions.`;
    }
  }
  
  // Technology trends
  if (/(trend|technology|latest|new tech|keep up|current)/i.test(q)) {
    return `I stay current through continuous learning, following industry blogs, participating in tech communities, and working on projects that push my technical boundaries.`;
  }
  
  // Why work for company
  if (/(why|company|work for|join|motivation)/i.test(q)) {
    return `I'm excited about opportunities to work on challenging problems, learn from experienced teams, and contribute to impactful projects that make a real difference.`;
  }
  
  // Location queries
  if (/(location|where|based|city|country|india|tirunelveli)/i.test(q)) {
    return `I'm based in ${resume.location}. I'm open to ${resume.openTo.join(' and ')} opportunities.`;
  }
  
  // Default: use context to generate a helpful response
  return `Based on my background, I can help you understand my ${resume.skills.map(s => s.name.toLowerCase()).join(', ')}, experience, and projects. What would you like to know more about?`;
}

// Helper function to format project info with better structure and clickable links
function formatProjectInfo(info: string): string {
  return info
    .replace(/Technologies: /g, '\n\n**🛠️ Technologies:** ')
    .replace(/GitHub: /g, '\n\n**📁 GitHub:** ')
    .replace(/Live: /g, '\n\n**🌐 Live Demo:** ')
    .replace(/\. /g, '.\n\n')
    .replace(/(https?:\/\/[^\s]+)/g, '[$1]($1)'); // Make URLs clickable
}

// Generate contextual response based on retrieved documents
function generateContextualResponse(query: string, context: string): string {
  const q = query.toLowerCase();
  
  // If context is the fallback message, use smart reply
  if (context.includes("No specific information found")) {
    return generateSmartReply(query, context);
  }
  
  // Extract key information from context and clean it up
  const lines = context.split('\n\n');
  const cleanedInfo = lines
    .filter(line => line.trim().length > 0)
    .map(line => {
      const content = line.split('\n')[1] || line; // Get content after title
      // Clean up FAQ format (remove "Question:" and "Answer:" prefixes)
      return content
        .replace(/^Question:\s*/i, '')
        .replace(/^Answer:\s*/i, '')
        .replace(/^Skills:\s*/i, '')
        .replace(/^Technologies:\s*/i, '');
    })
    .filter(content => content.trim().length > 0);
  
  // Generate formatted response based on query type
  if (/(location|where|based|city|country|india|tirunelveli|remote|hybrid|onsite|work location|preferred location)/i.test(q)) {
    // For location questions, give a direct, clear answer
    return `**📍 Location & Work Preferences:**\n\nI'm based in **${resume.location}** and I'm open to:\n\n• **🌍 Remote** opportunities\n• **🏢 Hybrid** arrangements\n• **✈️ Relocation** for the right role\n\nI'm flexible with work arrangements and can work effectively in any of these modes.`;
  }
  
  if (/(course|courses|education|degree|college|university|diploma|certification|cert|udemy|learning|study)/i.test(q)) {
    // For education questions, give a structured answer
    if (cleanedInfo.length === 1) {
      return `**🎓 Education:**\n\n${cleanedInfo[0]}`;
    } else {
      const formatted = cleanedInfo.map(info => `• ${info}`).join('\n\n');
      return `**🎓 Educational Background:**\n\n${formatted}`;
    }
  }
  
  if (/(salary|ctc|compensation|pay|package|expected|negotiable|benefits)/i.test(q)) {
    // For salary questions, give a clear, professional answer
    return `**💰 Salary Expectations:**\n\nI'm a fresher and don't have a current CTC. I'm open to discussing fair compensation aligned with the role, responsibilities, and location. For fresher roles, I expect compensation in line with industry standards for my skill set.`;
  }
  
  if (/(project|built|developed|created|grc|document|ai|assistant|automation)/i.test(q)) {
    // For project questions, give detailed, structured answers
    if (/(e.?commerce|shop|store|retail)/i.test(q)) {
      // For e-commerce specific questions
      if (cleanedInfo.length === 1) {
        return `**🛒 E-commerce Project:**\n\n${formatProjectInfo(cleanedInfo[0])}`;
      } else {
        const formatted = cleanedInfo.map(info => `• ${formatProjectInfo(info)}`).join('\n\n');
        return `**🛒 E-commerce Projects:**\n\n${formatted}`;
      }
    }
    
    if (/(ai|ml|machine.?learning|deep.?learning|neural|gpt|llm)/i.test(q)) {
      // For AI-specific questions
      if (cleanedInfo.length === 1) {
        return `**🤖 AI Project:**\n\n${formatProjectInfo(cleanedInfo[0])}`;
      } else {
        const formatted = cleanedInfo.map(info => `• ${formatProjectInfo(info)}`).join('\n\n');
        return `**🤖 AI Projects:**\n\n${formatted}`;
      }
    }
    
    // For general project questions
    if (cleanedInfo.length === 1) {
      return `**🚀 Project:**\n\n${formatProjectInfo(cleanedInfo[0])}`;
    } else {
      const formatted = cleanedInfo.map(info => `• ${formatProjectInfo(info)}`).join('\n\n');
      return `**🚀 Key Projects:**\n\n${formatted}`;
    }
  }
  
  if (/(tech|technology|stack|framework|library|tool|skill)/i.test(q)) {
    // For technology questions, give prioritized, structured answers
    if (cleanedInfo.length === 1) {
      return `**⚡ Technology:**\n\n${cleanedInfo[0]}`;
    } else {
      const formatted = cleanedInfo.map(info => `• ${info}`).join('\n\n');
      return `**⚡ Technology Stack:**\n\n${formatted}`;
    }
  }
  
  // For specific technology questions (React, Node.js, etc.)
  if (/(react|next|typescript|node|python|mysql|express)/i.test(q)) {
    const specificTech = q.match(/(react|next|typescript|node|python|mysql|express)/i)?.[0]?.toLowerCase();
    if (specificTech) {
      // Find relevant skills and projects
      const relevantSkills = resume.skills.filter(skill => 
        skill.items.some(item => item.toLowerCase().includes(specificTech))
      );
      
      const relevantProjects = projects.filter(proj => 
        proj.technologies.some(tech => tech.toLowerCase().includes(specificTech))
      );
      
      let response = `**⚡ ${specificTech.charAt(0).toUpperCase() + specificTech.slice(1)} Experience:**\n\n`;
      
      if (relevantSkills.length > 0) {
        const skillItems = relevantSkills.flatMap(skill => 
          skill.items.filter(item => item.toLowerCase().includes(specificTech))
        );
        response += `**🛠️ Skills:** ${skillItems.join(', ')}\n\n`;
      }
      
      if (relevantProjects.length > 0) {
        response += `**🚀 Projects using ${specificTech}:**\n`;
        relevantProjects.forEach(proj => {
          const techList = proj.technologies.filter(tech => 
            tech.toLowerCase().includes(specificTech)
          ).join(', ');
          response += `• **${proj.title}** - ${proj.description}\n`;
          response += `  _Technologies: ${techList}_\n\n`;
        });
      }
      
      return response;
    }
  }
  
  if (/(name|who|identity|yourself)/i.test(q)) {
    // For name/identity questions, give concise personal info
    if (cleanedInfo.length === 1) {
      return `**👋 ${cleanedInfo[0]}**`;
    } else {
      const formatted = cleanedInfo.map(info => `• ${info}`).join('\n\n');
      return `**👋 About Me:**\n\n${formatted}`;
    }
  }
  
  // For contact information questions
  if (/(contact|email|phone|linkedin|github|portfolio|reach|get in touch)/i.test(q)) {
    return `**📞 Contact Information:**\n\n**📧 Email:** ${resume.links.email}\n**📱 Phone:** ${resume.links.phone}\n**💼 LinkedIn:** ${resume.links.linkedin}\n**🐙 GitHub:** ${resume.links.github}\n**🌐 Portfolio:** ${resume.links.portfolio}`;
  }
  
  if (/(latest|recent|new|last|current)/i.test(q) && /(project|work|built|developed)/i.test(q)) {
    // For latest project questions, give focused project info
    if (cleanedInfo.length === 1) {
      return `**🆕 Latest Project:**\n\n${formatProjectInfo(cleanedInfo[0])}`;
    } else {
      const formatted = cleanedInfo.map(info => `• ${formatProjectInfo(info)}`).join('\n\n');
      return `**🆕 Recent Projects:**\n\n${formatted}`;
    }
  }
  
  if (/(e.?commerce|shop|store|retail|shopping|buy|sell)/i.test(q)) {
    // For e-commerce specific questions
    if (cleanedInfo.length === 1) {
      return `**🛒 ${formatProjectInfo(cleanedInfo[0])}**`;
    } else {
      const formatted = cleanedInfo.map(info => `• ${formatProjectInfo(info)}`).join('\n\n');
      return `**🛒 E-commerce Project:**\n\n${formatted}`;
    }
  }
  
  if (/(experience|work|job|role|company)/i.test(q)) {
    if (cleanedInfo.length === 1) {
      return `**💼 Experience:**\n\n${cleanedInfo[0]}`;
    } else {
      const formatted = cleanedInfo.map(info => `• ${info}`).join('\n\n');
      return `**💼 Work Experience:**\n\n${formatted}`;
    }
  }
  
  if (/(ai|ml|machine learning|artificial intelligence|model|tensorflow|langchain)/i.test(q)) {
    const aiInfo = cleanedInfo.find(info => 
      /ai|ml|machine learning|artificial intelligence|tensorflow|langchain/i.test(info)
    );
    if (aiInfo) {
      return `**🤖 AI Experience:**\n\n${aiInfo}`;
    }
  }
  
  if (/(skill|technology|tech|stack|framework)/i.test(q)) {
    const skillInfo = cleanedInfo.find(info => 
      /react|next|node|typescript|python|ai|ml/i.test(info)
    );
    if (skillInfo) {
      return `**⚡ My Key Strengths:**\n\n• ${skillInfo}`;
    }
  }
  
  if (/(project|work|built|developed|created)/i.test(q)) {
    const projectInfo = cleanedInfo.find(info => 
      /project|built|developed|created|application/i.test(info)
    );
    if (projectInfo) {
      return `**🚀 Project:**\n\n${formatProjectInfo(projectInfo)}`;
    }
  }
  
  // Default: format multiple pieces of info clearly
  if (cleanedInfo.length === 1) {
    return `**📋 Information:**\n\n${cleanedInfo[0]}`;
  } else {
    const formatted = cleanedInfo.map(info => `• ${info}`).join('\n\n');
    return `**📋 Here's what I can tell you:**\n\n${formatted}`;
  }
}







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
  return /^(hi|hello|hey|greetings|hi there|hello there|yo|sup|good\s+(?:morning|afternoon|evening)|who\s+are\s+you|introduce\s+yourself|tell\s+me\s+about\s+yourself)/i.test(t);
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
    
    // Handle greetings first
    if (isGreeting(rawLower)) {
      const final = `Hi! I'm ${resume.name}, ${resume.headline}. ${resume.about} I'm based in ${resume.location} and speak ${resume.languages.join(' and ')}.\n\nAsk me about **skills**, **projects**, **experience**, **education**, or **contact**.`;
      return new Response(JSON.stringify({ reply: final }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    // Quick commands that should bypass AI
    if (normalize(query) === "list faq" || /^(show|list)\s+faq/.test(normalize(query))) {
      const reply = listFAQ(12);
      return new Response(JSON.stringify({ reply }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // RAG-based reply system for all queries
    if (query.trim()) {
      const ragReply = await generateRAGReply(query);
      if (ragReply) {
        return respond(ragReply, "rag-system", false);
      }
    }

    // Fallback to original intent-based system if RAG fails
    const intent = intentFrom(query);
    const intentScores = scoreIntents(query);
    const topIntentScore = intentScores.length ? intentScores[0].score : 0;

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
        const reply = `${didYouMean(query, 5)}\n\nIf none of these fit, ask me about **skills**, **projects**, **education**, or **contact**.`;
        return new Response(JSON.stringify({ reply }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    const multi = composeMultiIntent(query);
    if (multi) {
      const final = `${multi}`;
      return new Response(JSON.stringify({ reply: final }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

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
