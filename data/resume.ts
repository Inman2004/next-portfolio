export interface ResumeLinks {
  portfolio: string;
  github: string;
  linkedin: string;
  twitter?: string;
  email?: string;
  phone?: string;
  discord?: string;
  medium?: string;
  devto?: string;
  youtube?: string;
  website?: string;
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

export interface WorkExperienceItem {
  company: string;
  role: string;
  location?: string;
  startDate: string;
  endDate: string | 'Present';
  description: string[];
  technologies: string[];
  achievements: string[];
  companySize?: string;
  employmentType?: 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Freelance';
}

export interface CertificationItem {
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  skills: string[];
}

export interface AwardItem {
  title: string;
  issuer: string;
  date: string;
  description?: string;
  link?: string;
}

export interface PublicationItem {
  title: string;
  publisher: string;
  publishDate: string;
  description?: string;
  link?: string;
  type: 'article' | 'blog' | 'book' | 'paper' | 'tutorial' | 'documentation';
}

export interface SpeakingItem {
  title: string;
  event: string;
  date: string;
  location?: string;
  description?: string;
  recording?: string;
  slides?: string;
  audience?: string;
}

export interface OpenSourceItem {
  project: string;
  role: string;
  repository: string;
  description: string;
  technologies: string[];
  contributions: string[];
  stars?: number;
  forks?: number;
}

export interface VolunteerItem {
  organization: string;
  role: string;
  startDate: string;
  endDate?: string;
  description: string;
  skills: string[];
  cause?: string;
}

export interface MembershipItem {
  organization: string;
  role?: string;
  joinDate: string;
  endDate?: string;
  benefits: string[];
  membershipId?: string;
}

export interface ReferenceItem {
  name: string;
  role: string;
  company: string;
  email: string;
  phone?: string;
  relationship: string;
  referenceAvailable: boolean;
}

export interface InterestItem {
  category: string;
  interests: string[];
  description?: string;
}

export interface CareerGoal {
  shortTerm: string[];
  longTerm: string[];
  industries: string[];
  preferredRoles: string[];
  preferredLocations: string[];
}

export interface SkillWithLevel {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  yearsOfExperience?: number;
  lastUsed?: string;
}

export interface ToolItem {
  category: string;
  tools: string[];
  proficiency?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
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

  // New comprehensive fields
  workExperience?: WorkExperienceItem[];
  certifications?: CertificationItem[];
  awards?: AwardItem[];
  publications?: PublicationItem[];
  speakingEngagements?: SpeakingItem[];
  openSourceContributions?: OpenSourceItem[];
  volunteerExperience?: VolunteerItem[];
  professionalMemberships?: MembershipItem[];
  references?: ReferenceItem[];
  interests?: InterestItem[];
  careerGoals?: CareerGoal;
  skillsWithLevels?: SkillWithLevel[];
  tools?: ToolItem[];

  // Additional preferences and info
  salaryExpectations?: {
    currency: string;
    min?: number;
    max?: number;
    negotiable: boolean;
    additionalBenefits?: string[];
  };
  workPreferences?: {
    workEnvironment: 'Remote' | 'Hybrid' | 'Office' | 'Flexible';
    travelAvailability: 'None' | 'Occasional' | 'Frequent';
    relocation: boolean;
    hoursPerWeek?: number;
    timezone?: string;
  };
  securityClearance?: string;
  portfolioHighlights?: {
    featuredProjects: string[];
    keyAchievements: string[];
    technologies: string[];
  };
  testimonials?: {
    name: string;
    role: string;
    company: string;
    testimonial: string;
    linkedIn?: string;
  }[];
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
    linkedin: 'https://linkedin.com/in/rvimman',
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
  availability: 'Immediate',
  workExperience: [
    {
      company: 'Tech Startup Inc.',
      role: 'Junior Software Engineer',
      location: 'Remote',
      startDate: '2024-01',
      endDate: 'Present',
      description: [
        'Developed and maintained React/Next.js applications',
        'Collaborated with senior developers on feature implementation',
        'Participated in code reviews and agile development processes'
      ],
      technologies: ['React', 'Next.js', 'TypeScript', 'Node.js'],
      achievements: [
        'Improved application performance by 25%',
        'Implemented automated testing reducing bugs by 40%'
      ],
      employmentType: 'Full-time'
    }
  ],
  certifications: [
    {
      name: 'AWS Certified Cloud Practitioner',
      issuer: 'Amazon Web Services',
      issueDate: '2024-06',
      expiryDate: '2027-06',
      credentialId: 'AWS-CP-123456',
      credentialUrl: 'https://aws.amazon.com/education/awseducate/',
      skills: ['Cloud Computing', 'AWS', 'Infrastructure']
    },
    {
      name: 'Google IT Support Professional Certificate',
      issuer: 'Google',
      issueDate: '2024-03',
      credentialUrl: 'https://www.coursera.org/professional-certificates/google-it-support',
      skills: ['IT Support', 'Networking', 'Security']
    }
  ],
  awards: [
    {
      title: 'Best Newcomer Developer',
      issuer: 'Tech Startup Inc.',
      date: '2024-12',
      description: 'Recognized for outstanding performance and quick learning curve in the first year'
    },
    {
      title: 'Innovation Award',
      issuer: 'College Tech Fest',
      date: '2023-03',
      description: 'Won first place for AI-powered project presentation'
    }
  ],
  publications: [
    {
      title: 'Building Scalable React Applications: Best Practices',
      publisher: 'Medium',
      publishDate: '2024-08',
      description: 'Comprehensive guide on React performance optimization and best practices',
      link: 'https://medium.com/@yourusername/building-scalable-react-applications',
      type: 'blog'
    }
  ],
  speakingEngagements: [
    {
      title: 'Getting Started with Next.js: A Beginner\'s Guide',
      event: 'Local Dev Meetup',
      date: '2024-09',
      location: 'Chennai, India',
      description: 'Presented on modern web development with Next.js',
      slides: 'https://slides.com/yourusername/nextjs-guide',
      audience: 'Developers and students'
    }
  ],
  openSourceContributions: [
    {
      project: 'React Query Builder',
      role: 'Contributor',
      repository: 'https://github.com/example/react-query-builder',
      description: 'Advanced query builder component for React applications',
      technologies: ['React', 'TypeScript', 'JavaScript'],
      contributions: [
        'Added new filter types',
        'Improved performance by 30%',
        'Fixed accessibility issues'
      ],
      stars: 1250,
      forks: 89
    }
  ],
  volunteerExperience: [
    {
      organization: 'Code for Good',
      role: 'Mentor',
      startDate: '2024-01',
      description: 'Teaching programming fundamentals to underprivileged students',
      skills: ['Teaching', 'JavaScript', 'React'],
      cause: 'Education'
    }
  ],
  professionalMemberships: [
    {
      organization: 'React Developers Community',
      role: 'Member',
      joinDate: '2023-06',
      benefits: [
        'Access to exclusive webinars',
        'Networking opportunities',
        'Career development resources'
      ]
    }
  ],
  references: [
    {
      name: 'John Smith',
      role: 'Senior Software Engineer',
      company: 'Tech Startup Inc.',
      email: 'john.smith@techstartup.com',
      phone: '+1-555-0123',
      relationship: 'Direct supervisor',
      referenceAvailable: true
    }
  ],
  interests: [
    {
      category: 'Technology',
      interests: ['Artificial Intelligence', 'Machine Learning', 'Open Source'],
      description: 'Passionate about cutting-edge technologies and their applications'
    },
    {
      category: 'Creative',
      interests: ['Photography', 'Music Production', 'Writing'],
      description: 'Enjoy creative outlets that complement technical work'
    }
  ],
  careerGoals: {
    shortTerm: [
      'Gain expertise in cloud architecture',
      'Lead a small development team',
      'Obtain AWS Solutions Architect certification'
    ],
    longTerm: [
      'Become a technical lead or architect',
      'Start a tech consultancy',
      'Contribute to open source projects significantly'
    ],
    industries: ['Technology', 'Healthcare', 'Education', 'Fintech'],
    preferredRoles: ['Senior Developer', 'Tech Lead', 'Solutions Architect'],
    preferredLocations: ['Remote', 'Bangalore', 'Chennai', 'Hyderabad']
  },
  skillsWithLevels: [
    {
      name: 'React',
      level: 'Advanced',
      yearsOfExperience: 3,
      lastUsed: 'Currently using'
    },
    {
      name: 'TypeScript',
      level: 'Intermediate',
      yearsOfExperience: 2,
      lastUsed: 'Currently using'
    },
    {
      name: 'Python',
      level: 'Intermediate',
      yearsOfExperience: 2,
      lastUsed: '2024'
    }
  ],
  tools: [
    {
      category: 'Development',
      tools: ['VS Code', 'Git', 'GitHub', 'Postman'],
      proficiency: 'Expert'
    },
    {
      category: 'Design',
      tools: ['Figma', 'Adobe XD', 'Canva'],
      proficiency: 'Intermediate'
    },
    {
      category: 'Project Management',
      tools: ['Jira', 'Trello', 'Notion'],
      proficiency: 'Advanced'
    }
  ],
  salaryExpectations: {
    currency: 'INR',
    min: 600000,
    max: 1200000,
    negotiable: true,
    additionalBenefits: [
      'Health Insurance',
      'Remote Work Allowance',
      'Learning & Development Budget',
      'Flexible Hours'
    ]
  },
  workPreferences: {
    workEnvironment: 'Remote',
    travelAvailability: 'Occasional',
    relocation: false,
    hoursPerWeek: 40,
    timezone: 'IST (UTC+5:30)'
  },
  securityClearance: 'None',
  portfolioHighlights: {
    featuredProjects: [
      'Pneumoscan - Medical AI Diagnostic Tool',
      'HR AI Interview Platform',
      'MoviesDB - Movie Discovery Platform'
    ],
    keyAchievements: [
      '92% accuracy in medical image classification',
      'Built scalable React applications',
      'Led development of AI-powered interview system'
    ],
    technologies: [
      'React', 'Next.js', 'TypeScript', 'Python',
      'TensorFlow', 'Node.js', 'MongoDB'
    ]
  },
  testimonials: [
    {
      name: 'Sarah Johnson',
      role: 'Product Manager',
      company: 'Tech Startup Inc.',
      testimonial: 'Immanuvel is an exceptional developer who consistently delivers high-quality code and innovative solutions. His ability to learn quickly and adapt to new technologies makes him a valuable team member.',
      linkedIn: 'https://linkedin.com/in/sarah-johnson'
    }
  ]
};
