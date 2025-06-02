export interface Project {
  title: string;
  description: string;
  technologies: string[];
  github: string;
  live: string;
  images: string[];
}

export const projects: Project[] = [
  {
    title: "Pneumoscan",
    description: "Automated Pneumonia Screening via X-Ray Imaging and Deep Neural Networks, This project proposes an AI system to detect pneumonia using CNNs and chest X-rays.",
    technologies: ["HTML", "CSS", "JavaScript", "Python", "Flask", "Pandas", "Tensorflow", "Keras"],
    github: "https://github.com/Inman2004/pneumoscan",
    live: "https://pneumoscan-b9wv.onrender.com/",
    images: ["/images/projects/pneumoscan.png", "/images/projects/pneumoscan2.png", "/images/projects/pneumoscan3.png"]
  },
  {
    title: "HR AI",
    description: "A mock interview platform powered by VAPI voice agent",
    technologies: ["Next.js", "React", "TailwindCSS", "TypeScript", "Framer Motion", "VAPI API"],
    github: "https://github.com/Inman2004/hr-ai",
    live: "https://Mocker.vercel-app",
    images: ["/images/projects/hr1.png", "/images/projects/hr2.png", "/images/projects/hr3.png"]
  },
  {
    title: "MoviesDB",
    description: "A modern, responsive React application for browsing movies, powered by TMDB API. Built with React, TypeScript, and Tailwind CSS.",
    technologies: ["React", "TypeScript", "Tailwind CSS", "TMDB API", "Framer Motion"],
    github: "https://github.com/Inman2004/moviesdb",
    live: "https://moviesdb-nine.vercel.app",
    images: ["/images/projects/mdb.png", "/images/projects/mdb2.png", "/images/projects/mdb3.png"]
  },
  {
    title: "E-commerce Platform",
    description: "A modern e-commerce platform with advanced filtering, search, and payment integration.",
    technologies: ["React.js", "PHP", "MySql", "Styled Components"],
    github: "https://github.com/Inman2004/ecommerce",
    live: "",
    images: ["/images/projects/ecommerce-1.png", "/images/projects/ecommerce-2.png", "/images/projects/ecommerce-3.png", "/images/projects/ecommerce-4.png"]
  },
  {
    title: "Data Handler",
    description: "A full-stack web interface that allows users to upload and display a CSV file. Features include filtering by date and restaurant name, displaying data in a responsive table, a mock email send feature for recruiters, and download and delete functionalities.",
    technologies: ["Next.js", "Python", "Flask", "Pandas", "MongoDB"],
    github: "https://github.com/Inman2004/assinment-data-handler",
    live: "",
    images: ["/images/projects/dh.png", "/images/projects/dh2.png", "/images/projects/dh3.png"]
  },
  {
    title: "A Slot Machine Game",
    description: "A slot machine game built with HTML, CSS, and JavaScript. Simple playground for me to practice my JS skills",
    technologies: ["HTML", "CSS", "JavaScript"],
    github: "https://github.com/Inman2004/slot-machine-js",
    live: "https://slot-machine-js.vercel.app",
    images: ["/images/projects/sl.png", "/images/projects/sl2.png", "/images/projects/sl3.png"]
  },
  {
    title: "My First Portfolio",
    description: "My first personal portfolio built using HTML, CSS, and JavaScript. It showcases my projects, skills, and contact information with a clean, responsive design. Firebase powers the backend functionalities, including contact form submissions and hosting.",
    technologies: ["HTML", "CSS", "JavaScript", "Firebase", "Vercel", "Git", "CI/CD"],
    github: "https://github.com/Inman2004/My-Portfolio",
    live: "https://rvimman.vercel.app",
    images: ["/images/projects/port.png", "/images/projects/port2.png", "/images/projects/port3.png"]
  }
];
