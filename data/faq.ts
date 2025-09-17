export type FAQItem = {
  id: number;
  question: string;
  answer: string;
  tags?: string[];
};

export const faq: FAQItem[] = [
  // Original FAQs
  {
    id: 1,
    question: "What are your main technical strengths?",
    answer:
      "I’m strong in building secure and scalable backend systems with Node.js and Express, and modern frontends with React and Next.js. I also have experience integrating AI models and RPA tools for automation.",
    tags: ["strengths", "skills", "backend", "frontend", "node", "react", "nextjs", "rpa", "ai"],
  },
  {
    id: 2,
    question: "What are your weaknesses?",
    answer:
      "I can be prone to procrastination, but I’ve learned to channel it into efficiency by finding faster, smarter ways to complete tasks without sacrificing quality.",
    tags: ["weaknesses", "areas of improvement"],
  },
  {
    id: 3,
    question: "Can you explain your AI-Powered GRC Assistant project?",
    answer:
      "It’s a compliance automation tool that flags GDPR/HIPAA violations in documents using a policy engine and Neo4j knowledge graph. It reduced compliance review time by 65% in simulated banking cases.",
    tags: ["project", "grc", "compliance", "neo4j", "gdpr", "hipaa"],
  },
  {
    id: 4,
    question: "Tell me about your Enterprise Document AI Assistant project.",
    answer:
      "It processes contracts/invoices with OCR + RAG pipelines at 95% accuracy, and uses UiPath RPA bots to auto-fill SAP/Oracle systems. It reduced manual data entry by 70% in supply chain simulations.",
    tags: ["project", "ocr", "rag", "uipath", "sap", "oracle"],
  },
  {
    id: 5,
    question: "What was the most challenging part of your last project?",
    answer:
      "Integrating Azure AD for RBAC while keeping the OCR and RPA pipeline latency low. Balancing security and speed required careful API optimization.",
    tags: ["challenge", "rbac", "azure ad", "latency"],
  },
  {
    id: 6,
    question: "How do you keep up with technology trends?",
    answer:
      "I regularly read documentation, follow GitHub projects, and join developer communities. I also experiment with new frameworks in personal projects.",
    tags: ["learning", "trends", "communities"],
  },
  {
    id: 7,
    question: "Have you worked in a team before?",
    answer:
      "Yes, during both academic and freelance projects. I’ve collaborated with designers, backend developers, and automation specialists, using Git and Agile practices.",
    tags: ["teamwork", "agile", "collaboration"],
  },
  {
    id: 8,
    question: "How do you handle tight deadlines?",
    answer:
      "I prioritize tasks, break them into smaller goals, and focus on delivering a functional version early so there’s room for iteration.",
    tags: ["deadlines", "prioritization", "planning"],
  },
  {
    id: 9,
    question: "Do you prefer backend or frontend work?",
    answer:
      "I enjoy backend more because I like structuring systems and solving data flow challenges, but I’m comfortable with frontend when needed.",
    tags: ["preference", "backend", "frontend"],
  },
  {
    id: 10,
    question: "How do you approach debugging?",
    answer:
      "I start by reproducing the bug, then isolate the cause using logs, breakpoints, or API monitors, and fix it with minimal disruption to other parts of the code.",
    tags: ["debugging", "logs", "breakpoints"],
  },
  {
    id: 11,
    question: "What’s your experience with cloud deployment?",
    answer:
      "I’ve deployed projects using Render and integrated CI/CD with GitHub Actions for automated testing and deployment.",
    tags: ["cloud", "deployment", "render", "ci/cd"],
  },
  {
    id: 12,
    question: "Have you worked with APIs?",
    answer:
      "Yes, I’ve built REST APIs with Express and integrated third-party APIs like Azure AD and SAP connectors.",
    tags: ["api", "express", "azure", "sap"],
  },
  {
    id: 13,
    question: "How do you ensure code quality?",
    answer:
      "Writing modular, testable code, following naming conventions, and using tools like ESLint and Prettier.",
    tags: ["quality", "eslint", "prettier", "testing"],
  },
  {
    id: 14,
    question: "Describe a time you improved a process.",
    answer:
      "In my AI-powered document processing system, I added caching to avoid repeated OCR calls, cutting processing time by over 30%.",
    tags: ["process", "optimization", "caching"],
  },
  {
    id: 15,
    question: "What’s your approach to learning a new technology?",
    answer:
      "Start with official documentation, build a small project, then integrate it into a larger one for practical experience.",
    tags: ["learning", "technology"],
  },
  {
    id: 16,
    question: "How do you manage version control?",
    answer:
      "I use Git with feature branches, clear commit messages, and pull requests for reviews.",
    tags: ["git", "version control", "pull requests"],
  },
  {
    id: 17,
    question: "Tell me about a time you failed.",
    answer:
      "Early in my diploma, I underestimated the time for frontend integration. I learned to plan buffer time and involve frontend earlier in backend design.",
    tags: ["failure", "learning"],
  },
  {
    id: 18,
    question: "How do you deal with conflicts in a team?",
    answer:
      "I listen to both sides, focus on the shared goal, and suggest compromises backed by data or technical feasibility.",
    tags: ["conflict", "team", "communication"],
  },
  {
    id: 19,
    question: "Have you worked with databases?",
    answer:
      "Yes, MySQL for relational data and SQLite for lightweight applications. Also integrated Neo4j for graph-based compliance data.",
    tags: ["database", "mysql", "sqlite", "neo4j"],
  },
  {
    id: 20,
    question: "What’s your favorite project so far?",
    answer:
      "The AI-Powered GRC Assistant because it combined my interest in AI with real compliance challenges.",
    tags: ["favorite", "project", "grc"],
  },
  {
    id: 21,
    question: "Do you use Agile?",
    answer:
      "Yes, in academic and freelance projects. We did sprints, daily standups, and sprint reviews.",
    tags: ["agile", "sprints", "standups"],
  },
  {
    id: 22,
    question: "How do you handle feedback?",
    answer:
      "I see it as a growth opportunity and focus on implementing suggestions quickly.",
    tags: ["feedback", "growth"],
  },
  {
    id: 23,
    question: "Do you have experience with testing?",
    answer:
      "I’ve used Postman for API testing and Jest for unit tests in JavaScript.",
    tags: ["testing", "postman", "jest"],
  },
  {
    id: 24,
    question: "How do you approach security?",
    answer:
      "Input validation, authentication/authorization, HTTPS, and secure API handling.",
    tags: ["security", "auth", "https"],
  },
  {
    id: 25,
    question: "How do you prioritize tasks?",
    answer:
      "Based on impact, dependencies, and deadlines.",
    tags: ["prioritize", "planning"],
  },
  {
    id: 26,
    question: "Can you explain RPA?",
    answer:
      "Robotic Process Automation uses bots to automate repetitive digital tasks. I used UiPath to integrate AI outputs into SAP/Oracle workflows.",
    tags: ["rpa", "uipath", "automation"],
  },
  {
    id: 27,
    question: "Have you worked with TypeScript?",
    answer:
      "Yes, in Next.js projects for type safety and better maintainability.",
    tags: ["typescript", "nextjs"],
  },
  {
    id: 28,
    question: "How do you stay motivated?",
    answer:
      "By focusing on building things that solve real problems and seeing tangible results.",
    tags: ["motivation", "drive"],
  },
  {
    id: 29,
    question: "Do you prefer remote or office work?",
    answer:
      "Remote for focused coding, but I value in-person brainstorming sessions.",
    tags: ["remote", "office", "work preference"],
  },
  {
    id: 30,
    question: "Have you ever led a project?",
    answer:
      "Yes, I led frontend development for my diploma e-commerce project, coordinating UI/UX with backend APIs.",
    tags: ["lead", "leadership", "frontend"],
  },
  {
    id: 31,
    question: "How do you ensure scalability?",
    answer:
      "By using modular architecture, database indexing, and efficient API design.",
    tags: ["scalability", "architecture", "indexing"],
  },
  {
    id: 32,
    question: "Do you have AI/ML experience?",
    answer:
      "Yes, I’ve built models for document processing and integrated them into applications using TensorFlow and LangChain.",
    tags: ["ai", "ml", "tensorflow", "langchain"],
  },
  {
    id: 33,
    question: "What’s your approach to documentation?",
    answer:
      "Keep it concise but clear, covering setup, architecture, and key workflows.",
    tags: ["documentation", "docs"],
  },
  {
    id: 34,
    question: "How do you manage multiple projects?",
    answer:
      "By setting realistic timelines, tracking progress in Jira, and avoiding context-switching.",
    tags: ["projects", "jira", "time management"],
  },
  {
    id: 35,
    question: "What’s your preferred tech stack?",
    answer:
      "React/Next.js frontend, Node.js backend, MySQL/Neo4j databases, CI/CD, and AI integration.",
    tags: ["stack", "react", "nextjs", "node", "mysql", "neo4j", "ci/cd", "ai"],
  },
  {
    id: 36,
    question: "How do you approach performance optimization?",
    answer:
      "Identify bottlenecks with profiling tools, then fix the most impactful issues first.",
    tags: ["performance", "profiling", "optimization"],
  },
  {
    id: 37,
    question: "Have you faced production issues?",
    answer:
      "Yes, a CI/CD pipeline once failed due to dependency changes. I fixed it by locking versions and updating gradually.",
    tags: ["production", "incident", "cicd"],
  },
  {
    id: 38,
    question: "How do you balance speed and quality?",
    answer:
      "By delivering an MVP quickly, then refining based on tests and feedback.",
    tags: ["speed", "quality", "mvp"],
  },
  {
    id: 39,
    question: "How do you work under pressure?",
    answer:
      "I focus on the immediate priority, avoid multitasking, and keep communication open.",
    tags: ["pressure", "stress", "priorities"],
  },
  {
    id: 40,
    question: "Do you have leadership qualities?",
    answer:
      "I can coordinate tasks, mentor peers, and mediate conflicts while keeping the project on track.",
    tags: ["leadership", "mentoring", "coordination"],
  },
  {
    id: 41,
    question: "How do you handle new requirements mid-project?",
    answer:
      "Assess the impact, adjust priorities, and communicate trade-offs.",
    tags: ["requirements", "scope", "trade-offs"],
  },
  {
    id: 42,
    question: "How do you measure success in your work?",
    answer:
      "By whether the solution works reliably in real-world conditions, not just in demos.",
    tags: ["success", "metrics", "outcomes"],
  },
  {
    id: 43,
    question: "Do you follow coding standards?",
    answer:
      "Yes, using style guides, linters, and peer reviews.",
    tags: ["standards", "linters", "reviews"],
  },
  {
    id: 44,
    question: "What’s your experience with AI ethics?",
    answer:
      "I ensure data privacy, fairness, and compliance with regulations like GDPR.",
    tags: ["ethics", "privacy", "gdpr"],
  },
  {
    id: 45,
    question: "How do you deal with unclear requirements?",
    answer:
      "Ask clarifying questions, propose a draft solution, and confirm before proceeding.",
    tags: ["requirements", "clarity", "communication"],
  },
  {
    id: 46,
    question: "Have you worked with authentication?",
    answer:
      "Yes, JWT-based authentication and Azure AD OAuth.",
    tags: ["auth", "jwt", "oauth", "azure"],
  },
  {
    id: 47,
    question: "Do you enjoy problem-solving?",
    answer:
      "Yes, it’s the main reason I got into software engineering.",
    tags: ["problem solving", "motivation"],
  },
  {
    id: 48,
    question: "How does this chatbot work?",
    answer:
      "This portfolio chatbot is fully deterministic and runs locally—no external AI agents. It uses:\n\n- Synonym-based intent detection (with fuzzy matching for typos)\n- Weighted FAQ matching (question/tags/answer overlap + fuzzy similarity)\n- Simple multi-intent composition for queries touching two topics\n- Markdown rendering in the UI, with colored skill badges\n\nIt only answers from my portfolio data and FAQ, keeping responses consistent and recruiter-focused.",
    tags: [
      "chatbot",
      "how it works",
      "nlp",
      "algorithm",
      "deterministic",
      "faq",
      "architecture",
    ],
  },
  // New FAQs
  {
    id: 49,
    question: "Tell me about yourself.",
    answer: "I’m Immanuvel, a Computer Science graduate and Junior Software Engineer. I build full-stack web systems with React and Node.js, and I’ve worked on AI-powered enterprise projects.",
    tags: ["about", "intro", "introduction", "who are you"],
  },
  {
    id: 50,
    question: "Walk me through your resume in brief.",
    answer: "I completed a diploma in Computer Engineering and a B.E. in Computer Science. I’ve built scalable MERN projects and recently worked on AI-powered assistants like Enterprise Document AI and GRC compliance automation.",
    tags: ["resume", "summary", "background", "experience"],
  },
  {
    id: 51,
    question: "Why did you choose to become a full-stack developer?",
    answer: "I like solving problems on both frontend and backend and enjoy building complete applications.",
    tags: ["career", "full-stack", "motivation"],
  },
  {
    id: 52,
    question: "Why do you want to work at our company?",
    answer: "Your focus on technology and impactful projects aligns with my skills and goals.",
    tags: ["motivation", "company", "why us"],
  },
  {
    id: 53,
    question: "What are your long-term career goals?",
    answer: "To grow into a senior full-stack engineer and contribute to enterprise-level solutions.",
    tags: ["career", "goals", "ambition"],
  },
  {
    id: 54,
    question: "How do you stay updated with the latest web technologies?",
    answer: "I follow official docs, contribute to projects, and learn through communities and courses.",
    tags: ["learning", "tech", "trends"],
  },
  {
    id: 55,
    question: "How do you handle working under tight deadlines?",
    answer: "I prioritize tasks, stay focused, and deliver step by step.",
    tags: ["deadlines", "pressure", "time management"],
  },
  {
    id: 56,
    question: "Have you ever had a conflict in a team? How did you resolve it?",
    answer: "Yes, I discussed calmly and focused on the solution, not the issue.",
    tags: ["conflict", "teamwork", "resolution"],
  },
  {
    id: 57,
    question: "Do you prefer working independently or in a team? Why?",
    answer: "Both, but teamwork allows better collaboration and learning.",
    tags: ["teamwork", "collaboration", "preference"],
  },
  {
    id: 58,
    question: "What are your biggest strengths as a developer?",
    answer: "Fast learning, problem-solving, and adaptability.",
    tags: ["strengths", "skills"],
  },
  {
    id: 59,
    question: "What is one weakness you’re currently working on improving?",
    answer: "Sometimes I delay tasks, so I’m improving time management.",
    tags: ["weakness", "improvement"],
  },
  {
    id: 60,
    question: "Tell me about a challenging project you worked on. How did you overcome obstacles?",
    answer: "In Document AI, integrating RPA with SAP was complex. I solved it by studying docs and testing small parts until it worked.",
    tags: ["challenge", "project", "problem solving", "document ai", "rpa", "sap"],
  },
  {
    id: 61,
    question: "Describe a time when you had to quickly learn a new technology for a project.",
    answer: "I learned Next.js in a few days to rebuild a project interface successfully.",
    tags: ["learning", "new technology", "next.js"],
  },
  {
    id: 62,
    question: "Have you ever missed a project deadline? What did you learn from it?",
    answer: "Yes, I learned to plan better and start tasks earlier.",
    tags: ["failure", "deadline", "learning"],
  },
  {
    id: 63,
    question: "Why should we hire you over other candidates?",
    answer: "I adapt quickly, deliver quality work, and bring experience in both full-stack and AI integration.",
    tags: ["hire", "value proposition"],
  },
  {
    id: 64,
    question: "What do you know about our company’s products/services?",
    answer: "I’ve researched and I know you deliver innovative software solutions. I admire how you use technology to solve customer problems.",
    tags: ["company knowledge", "research"],
  },
  {
    id: 65,
    question: "How comfortable are you working on both frontend and backend tasks?",
    answer: "Very comfortable, I’ve done both in all my major projects.",
    tags: ["full-stack", "frontend", "backend", "comfort level"],
  },
  {
    id: 66,
    question: "What is your expected salary?",
    answer: "I’m looking for a package in the range of 4 to 8 LPA, based on role and responsibilities.",
    tags: ["salary", "compensation", "expectation", "ctc"],
  },
  {
    id: 67,
    question: "Are you open to relocation or remote work?",
    answer: "Yes, I’m open to remote and relocation anywhere in India.",
    tags: ["relocation", "remote", "work preference"],
  },
  {
    id: 68,
    question: "When can you join if selected?",
    answer: "I’m available to join immediately.",
    tags: ["availability", "start date", "joining"],
  },
  {
    id: 69,
    question: "Can you explain one of your projects in simple terms to a non-technical person?",
    answer: "In my Document AI project, the system reads invoices like a human, extracts key details, and fills them into software automatically, saving time and reducing errors.",
    tags: ["project", "explanation", "non-technical", "document ai"],
  },
  {
    id: 70,
    question: "How do you prioritize tasks when working on multiple features at once?",
    answer: "I focus on urgent and high-impact tasks first, then handle the rest in order of priority.",
    tags: ["prioritization", "task management", "multiple features"],
  },
  {
    id: 71,
    question: "How do you ensure code quality in your projects?",
    answer: "I use clean coding practices, test often, and review code with tools like Postman and GitHub.",
    tags: ["code quality", "testing", "postman", "github"],
  },
  {
    id: 72,
    question: "What would you do if you were stuck on a technical problem for a long time?",
    answer: "I’d debug step by step, check docs, search trusted forums, and ask teammates if needed.",
    tags: ["problem solving", "debugging", "stuck"],
  },
  {
    id: 73,
    question: "How do you make sure your applications are secure?",
    answer: "I follow best practices like input validation, authentication, and secure API handling.",
    tags: ["security", "best practices", "authentication"],
  },
  {
    id: 74,
    question: "How do you handle feedback or criticism from your manager?",
    answer: "I take it positively, improve my work, and see it as a chance to grow.",
    tags: ["feedback", "criticism", "growth"],
  },
  {
    id: 75,
    question: "If the client suddenly changes requirements, how do you handle it?",
    answer: "I adapt quickly, recheck priorities, and update the work plan accordingly.",
    tags: ["changing requirements", "adaptability", "agile"],
  },
  {
    id: 76,
    question: "How do you test your applications before delivery?",
    answer: "I use manual testing, Postman for APIs, and sometimes automation with CI/CD pipelines.",
    tags: ["testing", "delivery", "manual testing", "postman", "ci/cd"],
  },
  {
    id: 77,
    question: "Can you work with legacy code or systems you didn’t build?",
    answer: "Yes, I can read and understand existing code, then improve or extend it as needed.",
    tags: ["legacy code", "maintainability"],
  },
  {
    id: 78,
    question: "How do you balance speed vs. quality in development?",
    answer: "I aim for clean code first, but if speed is critical, I deliver a working version and improve later.",
    tags: ["speed vs quality", "development process", "mvp"],
  },
  {
    id: 79,
    question: "How do you stay productive while working remotely?",
    answer: "I set a clear schedule, avoid distractions, and use tools like Jira and GitHub to stay on track.",
    tags: ["remote work", "productivity", "time management"],
  },
  {
    id: 80,
    question: "What’s the most important thing for you in a job — salary, learning, or stability?",
    answer: "Learning and growth first, with fair salary and stability.",
    tags: ["job preference", "motivation", "career values"],
  },
  {
    id: 81,
    question: "If you’re asked to use a tech you’ve never worked with before, what would you do?",
    answer: "I’d quickly learn from docs, build small demos, and then apply it to the project.",
    tags: ["learning", "new technology", "adaptability"],
  },
  {
    id: 82,
    question: "How do you handle pressure from tight deadlines or urgent bugs?",
    answer: "I stay calm, break down the problem, and solve step by step.",
    tags: ["pressure", "deadlines", "bug fixing"],
  },
  {
    id: 83,
    question: "What kind of company culture do you prefer?",
    answer: "Supportive, collaborative, and open to new ideas.",
    tags: ["company culture", "work environment", "preference"],
  },
];
