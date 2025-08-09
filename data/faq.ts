export type FAQItem = {
  id: number;
  question: string;
  answer: string;
  tags?: string[];
};

export const faq: FAQItem[] = [
  {
    id: 1,
    question: "Tell me about yourself.",
    answer:
      "I’m a final-year Computer Science student with hands-on experience in full-stack development, AI integration, and process automation. My focus is on building practical, scalable systems using modern technologies like React, Node.js, and Next.js. I prefer solving real-world problems over theoretical projects.",
    tags: ["about", "self", "intro", "background"],
  },
  {
    id: 2,
    question: "What are your main technical strengths?",
    answer:
      "I’m strong in building secure and scalable backend systems with Node.js and Express, and modern frontends with React and Next.js. I also have experience integrating AI models and RPA tools for automation.",
    tags: ["strengths", "skills", "backend", "frontend", "node", "react", "nextjs", "rpa", "ai"],
  },
  {
    id: 3,
    question: "What are your weaknesses?",
    answer:
      "I can be prone to procrastination, but I’ve learned to channel it into efficiency by finding faster, smarter ways to complete tasks without sacrificing quality.",
    tags: ["weaknesses", "areas of improvement"],
  },
  {
    id: 4,
    question: "Why do you want to work for our company?",
    answer:
      "I admire how your company balances innovation with practical business impact. I want to apply my skills to real-world challenges in an environment that encourages growth and experimentation.",
    tags: ["motivation", "company", "why us"],
  },
  {
    id: 5,
    question: "Can you explain your AI-Powered GRC Assistant project?",
    answer:
      "It’s a compliance automation tool that flags GDPR/HIPAA violations in documents using a policy engine and Neo4j knowledge graph. It reduced compliance review time by 65% in simulated banking cases.",
    tags: ["project", "grc", "compliance", "neo4j", "gdpr", "hipaa"],
  },
  {
    id: 6,
    question: "Tell me about your Enterprise Document AI Assistant project.",
    answer:
      "It processes contracts/invoices with OCR + RAG pipelines at 95% accuracy, and uses UiPath RPA bots to auto-fill SAP/Oracle systems. It reduced manual data entry by 70% in supply chain simulations.",
    tags: ["project", "ocr", "rag", "uipath", "sap", "oracle"],
  },
  {
    id: 7,
    question: "What was the most challenging part of your last project?",
    answer:
      "Integrating Azure AD for RBAC while keeping the OCR and RPA pipeline latency low. Balancing security and speed required careful API optimization.",
    tags: ["challenge", "rbac", "azure ad", "latency"],
  },
  {
    id: 8,
    question: "How do you keep up with technology trends?",
    answer:
      "I regularly read documentation, follow GitHub projects, and join developer communities. I also experiment with new frameworks in personal projects.",
    tags: ["learning", "trends", "communities"],
  },
  {
    id: 9,
    question: "Have you worked in a team before?",
    answer:
      "Yes, during both academic and freelance projects. I’ve collaborated with designers, backend developers, and automation specialists, using Git and Agile practices.",
    tags: ["teamwork", "agile", "collaboration"],
  },
  {
    id: 10,
    question: "How do you handle tight deadlines?",
    answer:
      "I prioritize tasks, break them into smaller goals, and focus on delivering a functional version early so there’s room for iteration.",
    tags: ["deadlines", "prioritization", "planning"],
  },
  {
    id: 11,
    question: "Do you prefer backend or frontend work?",
    answer:
      "I enjoy backend more because I like structuring systems and solving data flow challenges, but I’m comfortable with frontend when needed.",
    tags: ["preference", "backend", "frontend"],
  },
  {
    id: 12,
    question: "How do you approach debugging?",
    answer:
      "I start by reproducing the bug, then isolate the cause using logs, breakpoints, or API monitors, and fix it with minimal disruption to other parts of the code.",
    tags: ["debugging", "logs", "breakpoints"],
  },
  {
    id: 13,
    question: "What’s your experience with cloud deployment?",
    answer:
      "I’ve deployed projects using Render and integrated CI/CD with GitHub Actions for automated testing and deployment.",
    tags: ["cloud", "deployment", "render", "ci/cd"],
  },
  {
    id: 14,
    question: "Have you worked with APIs?",
    answer:
      "Yes, I’ve built REST APIs with Express and integrated third-party APIs like Azure AD and SAP connectors.",
    tags: ["api", "express", "azure", "sap"],
  },
  {
    id: 15,
    question: "How do you ensure code quality?",
    answer:
      "Writing modular, testable code, following naming conventions, and using tools like ESLint and Prettier.",
    tags: ["quality", "eslint", "prettier", "testing"],
  },
  {
    id: 16,
    question: "Describe a time you improved a process.",
    answer:
      "In my AI-powered document processing system, I added caching to avoid repeated OCR calls, cutting processing time by over 30%.",
    tags: ["process", "optimization", "caching"],
  },
  {
    id: 17,
    question: "What’s your approach to learning a new technology?",
    answer:
      "Start with official documentation, build a small project, then integrate it into a larger one for practical experience.",
    tags: ["learning", "technology"],
  },
  {
    id: 18,
    question: "How do you manage version control?",
    answer:
      "I use Git with feature branches, clear commit messages, and pull requests for reviews.",
    tags: ["git", "version control", "pull requests"],
  },
  {
    id: 19,
    question: "Tell me about a time you failed.",
    answer:
      "Early in my diploma, I underestimated the time for frontend integration. I learned to plan buffer time and involve frontend earlier in backend design.",
    tags: ["failure", "learning"],
  },
  {
    id: 20,
    question: "How do you deal with conflicts in a team?",
    answer:
      "I listen to both sides, focus on the shared goal, and suggest compromises backed by data or technical feasibility.",
    tags: ["conflict", "team", "communication"],
  },
  {
    id: 21,
    question: "Have you worked with databases?",
    answer:
      "Yes, MySQL for relational data and SQLite for lightweight applications. Also integrated Neo4j for graph-based compliance data.",
    tags: ["database", "mysql", "sqlite", "neo4j"],
  },
  {
    id: 22,
    question: "What’s your favorite project so far?",
    answer:
      "The AI-Powered GRC Assistant because it combined my interest in AI with real compliance challenges.",
    tags: ["favorite", "project", "grc"],
  },
  {
    id: 23,
    question: "Do you use Agile?",
    answer:
      "Yes, in academic and freelance projects. We did sprints, daily standups, and sprint reviews.",
    tags: ["agile", "sprints", "standups"],
  },
  {
    id: 24,
    question: "How do you handle feedback?",
    answer:
      "I see it as a growth opportunity and focus on implementing suggestions quickly.",
    tags: ["feedback", "growth"],
  },
  {
    id: 25,
    question: "Do you have experience with testing?",
    answer:
      "I’ve used Postman for API testing and Jest for unit tests in JavaScript.",
    tags: ["testing", "postman", "jest"],
  },
  {
    id: 26,
    question: "How do you approach security?",
    answer:
      "Input validation, authentication/authorization, HTTPS, and secure API handling.",
    tags: ["security", "auth", "https"],
  },
  {
    id: 27,
    question: "How do you prioritize tasks?",
    answer:
      "Based on impact, dependencies, and deadlines.",
    tags: ["prioritize", "planning"],
  },
  {
    id: 28,
    question: "Can you explain RPA?",
    answer:
      "Robotic Process Automation uses bots to automate repetitive digital tasks. I used UiPath to integrate AI outputs into SAP/Oracle workflows.",
    tags: ["rpa", "uipath", "automation"],
  },
  {
    id: 29,
    question: "Have you worked with TypeScript?",
    answer:
      "Yes, in Next.js projects for type safety and better maintainability.",
    tags: ["typescript", "nextjs"],
  },
  {
    id: 30,
    question: "How do you stay motivated?",
    answer:
      "By focusing on building things that solve real problems and seeing tangible results.",
    tags: ["motivation", "drive"],
  },
  {
    id: 31,
    question: "Do you prefer remote or office work?",
    answer:
      "Remote for focused coding, but I value in-person brainstorming sessions.",
    tags: ["remote", "office", "work preference"],
  },
  {
    id: 32,
    question: "Have you ever led a project?",
    answer:
      "Yes, I led frontend development for my diploma e-commerce project, coordinating UI/UX with backend APIs.",
    tags: ["lead", "leadership", "frontend"],
  },
  {
    id: 33,
    question: "How do you ensure scalability?",
    answer:
      "By using modular architecture, database indexing, and efficient API design.",
    tags: ["scalability", "architecture", "indexing"],
  },
  {
    id: 34,
    question: "Do you have AI/ML experience?",
    answer:
      "Yes, I’ve built models for document processing and integrated them into applications using TensorFlow and LangChain.",
    tags: ["ai", "ml", "tensorflow", "langchain"],
  },
  {
    id: 35,
    question: "What’s your approach to documentation?",
    answer:
      "Keep it concise but clear, covering setup, architecture, and key workflows.",
    tags: ["documentation", "docs"],
  },
  {
    id: 36,
    question: "How do you manage multiple projects?",
    answer:
      "By setting realistic timelines, tracking progress in Jira, and avoiding context-switching.",
    tags: ["projects", "jira", "time management"],
  },
  {
    id: 37,
    question: "What’s your preferred tech stack?",
    answer:
      "React/Next.js frontend, Node.js backend, MySQL/Neo4j databases, CI/CD, and AI integration.",
    tags: ["stack", "react", "nextjs", "node", "mysql", "neo4j", "ci/cd", "ai"],
  },
  {
    id: 38,
    question: "How do you approach performance optimization?",
    answer:
      "Identify bottlenecks with profiling tools, then fix the most impactful issues first.",
    tags: ["performance", "profiling", "optimization"],
  },
  {
    id: 39,
    question: "Have you faced production issues?",
    answer:
      "Yes, a CI/CD pipeline once failed due to dependency changes. I fixed it by locking versions and updating gradually.",
    tags: ["production", "incident", "cicd"],
  },
  {
    id: 40,
    question: "How do you balance speed and quality?",
    answer:
      "By delivering an MVP quickly, then refining based on tests and feedback.",
    tags: ["speed", "quality", "mvp"],
  },
  {
    id: 41,
    question: "How do you work under pressure?",
    answer:
      "I focus on the immediate priority, avoid multitasking, and keep communication open.",
    tags: ["pressure", "stress", "priorities"],
  },
  {
    id: 42,
    question: "Do you have leadership qualities?",
    answer:
      "I can coordinate tasks, mentor peers, and mediate conflicts while keeping the project on track.",
    tags: ["leadership", "mentoring", "coordination"],
  },
  {
    id: 43,
    question: "How do you handle new requirements mid-project?",
    answer:
      "Assess the impact, adjust priorities, and communicate trade-offs.",
    tags: ["requirements", "scope", "trade-offs"],
  },
  {
    id: 44,
    question: "How do you measure success in your work?",
    answer:
      "By whether the solution works reliably in real-world conditions, not just in demos.",
    tags: ["success", "metrics", "outcomes"],
  },
  {
    id: 45,
    question: "Do you follow coding standards?",
    answer:
      "Yes, using style guides, linters, and peer reviews.",
    tags: ["standards", "linters", "reviews"],
  },
  {
    id: 46,
    question: "What’s your experience with AI ethics?",
    answer:
      "I ensure data privacy, fairness, and compliance with regulations like GDPR.",
    tags: ["ethics", "privacy", "gdpr"],
  },
  {
    id: 47,
    question: "How do you deal with unclear requirements?",
    answer:
      "Ask clarifying questions, propose a draft solution, and confirm before proceeding.",
    tags: ["requirements", "clarity", "communication"],
  },
  {
    id: 48,
    question: "Have you worked with authentication?",
    answer:
      "Yes, JWT-based authentication and Azure AD OAuth.",
    tags: ["auth", "jwt", "oauth", "azure"],
  },
  {
    id: 49,
    question: "Do you enjoy problem-solving?",
    answer:
      "Yes, it’s the main reason I got into software engineering.",
    tags: ["problem solving", "motivation"],
  },
  {
    id: 50,
    question: "Why should we hire you?",
    answer:
      "I bring a balance of technical skill, adaptability, and a focus on building solutions that work in production, not just theory.",
    tags: ["hire", "value", "fit"],
  },
  {
    id: 51,
    question: "What is your expected CTC?",
    answer:
      "For a fresher role, I expect compensation in line with industry standards for my skill set, and I’m open to discussing specifics based on the role, responsibilities, and location.",
    tags: [
      "expected",
      "ctc",
      "salary",
      "expected salary",
      "salary expectation",
      "compensation",
      "pay",
      "package",
      "offer",
    ],
  },
  {
    id: 52,
    question: "Do you have a current CTC?",
    answer:
      "I’m a fresher and don’t have a current CTC. I’m open to discussing a fair compensation aligned with the role, responsibilities, and location.",
    tags: [
      "current",
      "present",
      "ctc",
      "current ctc",
      "present salary",
      "current salary",
      "in-hand",
      "package",
      "pay",
      "compensation",
    ],
  },
  {
    id: 53,
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
];
