export type IntentKey =
  | "about"
  | "name"
  | "contact"
  | "skills"
  | "experience"
  | "projects"
  | "blog"
  | "education"
  | "achievements"
  | "location"
  | "availability";

export const intentSynonyms: Record<IntentKey, string[]> = {
  about: [
    "about",
    "summary",
    "overview",
    "introduce",
    "introduction",
    "introduce yourself",
    "self intro",
    "self introduction",
    "who are you",
    "tell me about yourself",
    "bio",
    "profile",
  ],
  name: ["name", "your name", "what is your name", "who are you"],
  contact: [
    "contact",
    "email",
    "phone",
    "reach",
    "linkedin",
    "github",
    "portfolio",
    "twitter",
  ],
  skills: ["skills", "tech", "stack", "technology", "skill set", "proficient in"],
  experience: ["experience", "work", "role", "company", "worked at", "work history"],
  projects: ["project", "projects", "built", "demo", "github", "repo"],
  blog: ["blog", "blogs", "articles", "posts", "writeups", "writings"],
  education: [
    "education",
    "degree",
    "college",
    "university",
    "diploma",
    "graduation",
    "studies",
    "study",
    "academics",
    "schooling",
  ],
  achievements: ["achievement", "achievements", "award", "awards", "cert", "course", "certification"],
  location: ["location", "based", "where", "relocate", "relocation"],
  availability: ["availability", "available", "join", "notice", "notice period", "start date"],
};
