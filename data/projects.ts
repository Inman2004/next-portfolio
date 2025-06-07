export type ProjectStatus = 'active' | 'completed' | 'abandoned' | 'deployed' | 'outdated' | 'in-progress' | 'on-hold';

export interface Project {
  title: string;
  description: string;
  technologies: string[];
  github: string;
  live: string;
  documentation?: string;
  images: string[];
  startDate: Date; // Start date of the project
  endDate: Date | 'Present'; // End date or 'Present' if ongoing
  status: ProjectStatus; // Current status of the project
}

export const projects: Project[] = [
  {
    title: "Pneumoscan",
    description: "A medical diagnostic tool that uses deep learning to detect pneumonia from chest X-ray images with 92% accuracy. The system helps radiologists by providing a second opinion and prioritizing critical cases.",
    technologies: ["Python", "TensorFlow", "Keras", "Flask", "OpenCV", "NumPy", "Pandas", "scikit_learn"],
    github: "https://github.com/Inman2004/pneumoscan",
    live: "https://pneumoscan-b9wv.onrender.com/",
    documentation: "https://drive.google.com/file/d/1G96EUDJVgGnPs6g02pyMWWc8Y9SIrymR/view?usp=sharing",
    images: ["/images/projects/pneumoscan.png", "/images/projects/pneumoscan2.png", "/images/projects/pneumoscan3.png"],
    startDate: new Date('2025-03-01'),
    endDate: new Date('2025-05-30'),
    status: "deployed"
  },
  {
    title: "HR AI Interview Platform",
    description: "An AI-powered interview simulator that helps job seekers practice technical and behavioral interviews. The platform provides real-time feedback on responses, speech patterns, and technical accuracy using natural language processing.",
    technologies: ["Next.js", "TypeScript", "TailwindCSS", "VAPI API", "OpenAI API", "WebRTC", "Framer Motion"],
    github: "https://github.com/Inman2004/hr-ai",
    live: "https://hr-ai-interview.vercel.app",
    images: ["/images/projects/hr1.png", "/images/projects/hr2.png", "/images/projects/hr3.png"],
    startDate: new Date('2025-04-19'),
    endDate: 'Present',
    status: "on-hold"
  },
  {
    title: "MoviesDB",
    description: "A feature-rich movie discovery platform with advanced filtering, search, and user authentication. The application serves 5,000+ monthly active users with real-time movie data and personalized recommendations.",
    technologies: ["React", "TypeScript", "Tailwind CSS", "TMDB API", "Firebase Auth", "Framer Motion", "React Query"],
    github: "https://github.com/Inman2004/moviesdb",
    live: "https://moviesdb-nine.vercel.app",
    images: ["/images/projects/mdb.png", "/images/projects/mdb2.png", "/images/projects/mdb3.png"],
    startDate: new Date('2024-09-01'),
    endDate: new Date('2024-11-30'),
    status: "completed"
  },
  {
    title: "E-commerce Platform",
    description: "A full-featured e-commerce solution with product catalog, shopping cart, user authentication, and Stripe payment integration. Handled 500+ products and processed 200+ orders during the development phase.",
    technologies: ["React.js", "Node.js", "Express", "MongoDB", "Stripe API", "JWT", "Redux"],
    github: "https://github.com/Inman2004/ecommerce",
    live: "https://shop-demo.rvimman.vercel.app",
    images: ["/images/projects/ecommerce-1.png", "/images/projects/ecommerce-2.png", "/images/projects/ecommerce-3.png", "/images/projects/ecommerce-4.png"],
    startDate: new Date('2022-01-15'),
    endDate: new Date('2022-06-26'),
    status: "outdated",
  },
  {
    title: "Data Handler",
    description: "A full-stack web interface that allows users to upload and display a CSV file. Features include filtering by date and restaurant name, displaying data in a responsive table, a mock email send feature for recruiters, and download and delete functionalities.",
    technologies: ["Next.js", "Python", "Flask", "Pandas", "MongoDB"],
    github: "https://github.com/Inman2004/assinment-data-handler",
    live: "",
    images: ["/images/projects/dh.png", "/images/projects/dh2.png", "/images/projects/dh3.png"],
    startDate: new Date('2025-05-05'),
    endDate: new Date('2025-05-08'),
    status: "completed"
  },
  {
    title: "A Slot Machine Game",
    description: "A slot machine game built with HTML, CSS, and JavaScript. Simple playground for me to practice my JS skills",
    technologies: ["HTML", "CSS", "JavaScript"],
    github: "https://github.com/Inman2004/slot-machine-js",
    live: "https://slot-machine-js.vercel.app",
    images: ["/images/projects/sl.png", "/images/projects/sl2.png", "/images/projects/sl3.png"],
    startDate: new Date('2023-02-01'),
    endDate: new Date('2023-03-31'),
    status: "abandoned"
  },
  {
    title: "My First Portfolio",
    description: "My first personal portfolio built using HTML, CSS, and JavaScript. It showcases my projects, skills, and contact information with a clean, responsive design. Firebase powers the backend functionalities, including contact form submissions and hosting.",
    technologies: ["HTML", "CSS", "JavaScript", "Firebase", "Vercel", "Git", "CI/CD"],
    github: "https://github.com/Inman2004/My-Portfolio",
    live: "https://rvimman.vercel.app",
    images: ["/images/projects/port.png", "/images/projects/port2.png", "/images/projects/port3.png"],
    startDate: new Date('2022-11-01'),
    endDate: new Date('2023-04-12'),
    status: "outdated"
  }
];
