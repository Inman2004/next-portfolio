export interface ResumeLinks {
  portfolio: string;
  github: string;
  linkedin: string;
  twitter?: string;
  email?: string;
  phone?: string;
}

export interface EducationItem {
  institution: string;
  program: string;
  location?: string;
  startDate: string;
  endDate: string | 'Present';
  highlights?: string[];
}

export interface SkillCategory {
  name: string;
  items: string[];
}

export interface AchievementItem {
  title: string;
  when?: string;
  details?: string;
  link?: string;
  impact?: string; // quantified impact if available
}

export interface ResumeData {
  name: string;
  headline: string;
  about: string;
  location: string;
  openTo: string[]; // roles/types
  links: ResumeLinks;
  skills: SkillCategory[];
  education: EducationItem[];
  achievements: AchievementItem[];
  languages: string[];
  availability: string; // e.g., Immediate, 2 weeks
}

export const resume: ResumeData = {
  name: 'Immanuvel B',
  headline: 'Junior Software Engineer • React/Next.js • Node.js • AI Integration',
  about:
    'Solutions-focused Software Engineer specializing in scalable web systems and AI integration. Proven in delivering secure, enterprise-ready applications with React/Node.js stacks. Skilled at translating business requirements into technical solutions.',
  location: 'Tirunelveli, TN, India',
  openTo: [
    'Full-time (Remote/Hybrid)',
    'Contract/Freelance'
  ],
  links: {
    portfolio: 'https://rvinmandev.vercel.app',
    github: 'https://github.com/Inman2004',
    linkedin: 'https://linkedin.com/in/rv3d',
    twitter: 'https://twitter.com/rvimman_',
    email: 'mailto:rvimman@gmail.com',
    phone: '+91 638-292-4427'
  },
  skills: [
    { name: 'Enterprise Backend', items: ['Node.js', 'Express', 'REST APIs', 'Python', 'MySQL'] },
    { name: 'Modern Frontend', items: ['React', 'Next.js', 'TypeScript', 'TailwindCSS'] },
    { name: 'Cloud/DevOps', items: ['GitHub Actions', 'Render', 'CI/CD', 'Postman'] },
    { name: 'AI Integration', items: ['TensorFlow', 'Data Analysis', 'Machine Learning'] },
    { name: 'Process', items: ['Jira', 'Agile Methodologies'] },
    { name: 'Soft Skills', items: ['Communication', 'Teamwork', 'Critical thinking', 'Time management', 'Problem solving', 'Adaptability'] }
  ],
  education: [
    {
      institution: 'PSN Institute of Technology and Science, Anna University',
      program: "Bachelor's degree — Computer Science and Engineering",
      startDate: '2021',
      endDate: '2025',
      highlights: ['Critical Debugger/Runner, PSN EC (2024)']
    },
    {
      institution: 'MSP Velayutha Lakshmithaiyammal Polytechnic College, Anna University',
      program: 'Diploma — Computer Engineering',
      startDate: '2020',
      endDate: '2022'
    }
  ],
  achievements: [
    { title: 'AI-Powered GRC Assistant', details: 'Developed policy engine flagging regulatory violations in contracts/emails; mapped 200+ GDPR/HIPAA clauses with Neo4j; simulated 40% reduction in downtime with Toyota production data; 65% faster compliance review in banking use cases', impact: 'Tech: React, Python, Llama 3, Neo4j, HIPAA/GDPR rules engine' },
    { title: 'Enterprise Document AI Assistant', details: 'OCR + RAG pipeline for invoices/contracts with 95% accuracy; integrated UiPath RPA bots to auto-fill SAP/Oracle; reduced manual data entry by 70%; added RBAC with Azure AD', impact: 'Tech: Next.js 14, FastAPI, LangChain, UiPath (RPA), SQLite' },
    { title: 'UI Specialist/Achievement', details: 'Growth School', when: '2023' },
    { title: 'Critical Debugger / Runner', details: 'PSN EC', when: '2024' },
    { title: 'Professional Development', details: 'Machine Learning A–Z: Python, R (Udemy, 2025); Prompt Engineering (Udemy, 2025)' }
  ],
  languages: ['English', 'Tamil'],
  availability: 'Immediate'
};
