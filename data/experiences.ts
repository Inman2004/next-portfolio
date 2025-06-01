export interface ExperienceType {
  id: number;
  role: string;
  company: string;
  companyUrl?: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string[];
  skills: string[];
  logo?: string;
}

export const experiences: ExperienceType[] = [
  {
    id: 1,
    role: 'Full Stack Developer',
    company: 'Mann hospitality',
    companyUrl: 'https://mannhospitality.com/',
    location: 'Bengalore, India',
    startDate: 'TBD',
    endDate: 'Present',
    description: [
      'TBD',
      'TBD',
      'TBD',
    ],
    skills: ['Next.js', 'React', 'Node.js', 'TypeScript', 'TailwindCSS', 'MongoDB', 'Docker', 'Vercel', 'VPS', 'AWS', 'Python', 'Flask', 'CI/CD', 'FastAPI'],
  },
  {
    id: 2,
    role: 'Indie Web Developer',
    company: 'Self',
    location: 'Tamil Nadu, India',
    startDate: 'Jun 2022',
    endDate: 'Dec 2024',
    description: [
      'Developed and deployed web applications using modern technologies like Next.js, React, and Node.js,',
      'Collaborated with the team to implement new features and fix bugs',
      'Participated in code reviews and team meetings',
    ],
    skills: ['Next.js', 'React', 'Node.js', 'TypeScript', 'TailwindCSS', 'MongoDB', 'Docker', 'Vercel', 'VPS', 'AWS', 'Python', 'Flask', 'CI/CD', 'FastAPI'],
  },
  {
    id: 3,
    role: 'Open Source Contributor',
    company: 'GitHub',
    companyUrl: 'https://github.com/Inman2004',
    location: 'Remote',
    startDate: '2021',
    endDate: '2025',
    description: [
      'Contributed to various open source projects on GitHub',
      'Fixed bugs and implemented new features',
      'Documented code and improved project documentation',
    ],
    skills: ['Git', 'GitHub', 'Open Source', 'Documentation'],
  },
];
