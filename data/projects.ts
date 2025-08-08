export type ProjectStatus = 'active' | 'completed' | 'abandoned' | 'deployed' | 'outdated' | 'in-progress' | 'on-hold';

export interface Project {
  title: string;
  description: string;
  technologies: string[];
  github: string;
  live: string;
  documentation?: string;
  blogPost?: string; // URL to related blog post
  images: string[];
  videoPreviews?: {
    url: string;
    thumbnail: string;
    duration?: number;
  }[];
  startDate: Date; // Start date of the project
  endDate: Date | 'Present'; // End date or 'Present' if ongoing
  status: ProjectStatus; // Current status of the project
  content?: string;
}

export const projects: Project[] = [
  {
    title: "Pneumoscan",
    description: "A medical diagnostic tool that uses deep learning to detect pneumonia from chest X-ray images with 92% accuracy. The system helps radiologists by providing a second opinion and prioritizing critical cases.",
    technologies: ["Python", "TensorFlow", "Keras", "Flask", "CNN", "NumPy", "Pandas", "scikit_learn"],
    github: "https://github.com/Inman2004/pneumoscan",
    live: "https://pneumoscan-b9wv.onrender.com/",
    documentation: "https://drive.google.com/file/d/1G96EUDJVgGnPs6g02pyMWWc8Y9SIrymR/view?usp=sharing",
    blogPost: "/blog/yq2jOnFdljslBNQuAXBk",
    images: ["/images/projects/pneumoscan.png", "/images/projects/pneumoscan2.png", "/images/projects/pneumoscan3.png"],
    startDate: new Date('2025-03-01'),
    endDate: new Date('2025-05-30'),
    status: "deployed",
    videoPreviews: [{
      url: '/videos/Pneumoscan-Demo.mp4',
      thumbnail: '/images/Pneumoscan-thumbnail.jpg',
      // optional duration in seconds
    }],
    content: `## Project Overview
PneumoScan is an advanced medical imaging analysis platform that leverages deep learning to detect and classify pneumonia from chest X-ray images. The system was developed to assist radiologists in making faster and more accurate diagnoses, particularly in resource-constrained healthcare settings.

## Technical Implementation
- Utilized a custom CNN architecture built with TensorFlow and Keras for image classification
- Implemented data augmentation techniques to handle limited medical imaging datasets
- Created a responsive web interface using Next.js and TailwindCSS for seamless user experience
- Integrated DICOM image processing for handling medical imaging standards
- Deployed the model using TensorFlow Serving for efficient inference

## Key Features
- **High Accuracy**: Achieved 94.5% accuracy in pneumonia detection
- **Real-time Analysis**: Processes X-ray images in under 2 seconds
- **User Management**: Role-based access for radiologists and administrators
- **Detailed Reports**: Generates comprehensive PDF reports with findings
- **DICOM Support**: Native support for medical imaging standards

## Challenges & Solutions
- **Data Scarcity**: Addressed limited medical imaging data through advanced data augmentation
- **Model Bias**: Implemented class weighting to handle imbalanced datasets
- **Deployment**: Optimized model size for cloud deployment without sacrificing accuracy

## Technologies Used
- **Frontend**: Next.js, TypeScript, TailwindCSS
- **Backend**: Node.js, Express
- **AI/ML**: TensorFlow, Keras, OpenCV
- **Database**: MongoDB
- **DevOps**: Docker, AWS ECS, GitHub Actions`
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
    status: "on-hold",
    content: `## Project Overview
HR AI Interview Platform is an innovative solution designed to revolutionize the hiring process by providing realistic, AI-powered mock interviews. The platform helps job seekers practice and improve their interview skills with real-time feedback on their responses, speech patterns, and technical knowledge.

## Technical Implementation
- Built with Next.js and TypeScript for a type-safe, performant frontend
- Integrated VAPI API for real-time voice processing and transcription
- Leveraged OpenAI's GPT-4 for generating intelligent interview questions and feedback
- Implemented WebRTC for seamless video calling functionality
- Used Framer Motion for smooth, engaging UI animations
- Deployed on Vercel with serverless functions for API endpoints

## Key Features
- **Real-time Analysis**: Provides instant feedback on speech clarity, filler words, and response quality
- **Technical Assessments**: Custom coding challenges with automated code evaluation
- **Behavioral Interviews**: AI-powered behavioral questions with sentiment analysis
- **Progress Tracking**: Detailed analytics on interview performance over time
- **Multi-language Support**: Interviews available in multiple languages

## Challenges & Solutions
- **Latency Issues**: Optimized WebRTC configuration for low-latency video streaming
- **Speech Recognition**: Fine-tuned VAPI API for better accuracy with technical terminology
- **Scalability**: Implemented rate limiting and caching strategies for high traffic
- **User Experience**: Designed an intuitive interface with clear feedback mechanisms

## Technologies Used
- **Frontend**: Next.js, TypeScript, TailwindCSS, Framer Motion
- **AI/ML**: OpenAI GPT-4, VAPI API
- **Real-time**: WebRTC, Socket.io
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: Vercel, Serverless Functions
- **Analytics**: Custom tracking with PostHog`
  },
  {
    title: "MoviesDB",
    description: "A feature-rich movie discovery platform with advanced filtering, search, and user authentication. The application serves 5,000+ monthly active users with real-time movie data and personalized recommendations.",
    technologies: ["React", "TypeScript", "Tailwind CSS", "TMDB API", "Firebase Auth", "Framer Motion", "React Query"],
    github: "https://github.com/Inman2004/moviesdb",
    live: "https://moviesdb-nine.vercel.app",
    blogPost: "/blog/d1iI2JicHtKoHdzIgRmM",
    images: ["/images/projects/mdb.png", "/images/projects/mdb2.png", "/images/projects/mdb3.png"],
    startDate: new Date('2024-09-01'),
    endDate: new Date('2024-11-30'),
    status: "completed",
    content: `## Project Overview
MoviesDB is a comprehensive movie discovery platform that brings together movie enthusiasts and casual viewers alike. With a vast database powered by TMDB API, it offers detailed information about movies, TV shows, and actors, along with personalized recommendations based on user preferences and viewing history.

## Technical Implementation
- Built with React 18 and TypeScript for type safety and developer experience
- Utilized React Query for efficient server state management and data fetching
- Integrated TMDB API for comprehensive movie and TV show data
- Implemented Firebase Authentication for secure user management
- Used Framer Motion for smooth, engaging UI animations and transitions
- Deployed on Vercel with edge functions for optimal global performance

## Key Features
- **Advanced Search**: Powerful filtering by genre, release year, rating, and more
- **User Profiles**: Personalized watchlists, ratings, and viewing history
- **Discover**: AI-powered recommendations based on viewing habits
- **Responsive Design**: Seamless experience across all devices
- **Dark/Light Mode**: Built-in theme support for user preference
- **Performance**: Optimized bundle size and lazy loading for fast load times

## Challenges & Solutions
- **API Rate Limiting**: Implemented client-side caching with React Query to minimize API calls
- **Performance**: Used code-splitting and lazy loading for optimal bundle size
- **Authentication**: Integrated Firebase Auth with custom token management
- **State Management**: Combined React Context with React Query for optimal state handling
- **Responsive Design**: Created a mobile-first UI with Tailwind CSS

## Technologies Used
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **State Management**: React Query, React Context
- **Authentication**: Firebase Auth
- **Animation**: Framer Motion
- **API**: TMDB API
- **Deployment**: Vercel, Edge Functions
- **Analytics**: Custom event tracking with PostHog
- **Testing**: Jest, React Testing Library`
  },
  {
    title: "E-commerce Platform",
    description: "A full-featured e-commerce solution with product catalog, shopping cart, user authentication, and Stripe payment integration. Handled 500+ products and processed 200+ orders during the development phase.",
    technologies: ["React.js", "Node.js", "axios", "MySQL", "PHP", "XAMPP", "Custom Auth", "Styled Components"],
    github: "https://github.com/Inman2004/ecommerce",
    live: "https://shop-demo.rvimman.vercel.app",
    blogPost: "/blog/MzHAihBULd7VMVIXVMU7",
    images: ["/images/projects/ecommerce-1.png", "/images/projects/ecommerce-2.png", "/images/projects/ecommerce-3.png", "/images/projects/ecommerce-4.png"],
    startDate: new Date('2022-01-15'),
    endDate: new Date('2022-06-26'),
    status: "outdated",
    content: `## Project Overview
PneumoScan is an advanced medical imaging analysis platform that leverages deep learning to detect and classify pneumonia from chest X-ray images. The system was developed to assist radiologists in making faster and more accurate diagnoses, particularly in resource-constrained healthcare settings.

## Technical Implementation
- Utilized a custom CNN architecture built with TensorFlow and Keras for image classification
- Implemented data augmentation techniques to handle limited medical imaging datasets
- Created a responsive web interface using Next.js and TailwindCSS for seamless user experience
- Integrated DICOM image processing for handling medical imaging standards
- Deployed the model using TensorFlow Serving for efficient inference

## Key Features
- **High Accuracy**: Achieved 94.5% accuracy in pneumonia detection
- **Real-time Analysis**: Processes X-ray images in under 2 seconds
- **User Management**: Role-based access for radiologists and administrators
- **Detailed Reports**: Generates comprehensive PDF reports with findings
- **DICOM Support**: Native support for medical imaging standards

## Challenges & Solutions
- **Data Scarcity**: Addressed limited medical imaging data through advanced data augmentation
- **Model Bias**: Implemented class weighting to handle imbalanced datasets
- **Deployment**: Optimized model size for cloud deployment without sacrificing accuracy

## Technologies Used
- **Frontend**: Next.js, TypeScript, TailwindCSS
- **Backend**: Node.js, Express
- **AI/ML**: TensorFlow, Keras, OpenCV
- **Database**: MongoDB
- **DevOps**: Docker, AWS ECS, GitHub Actions`
  },
  {
    title: "Data Handler",
    description: "A full-stack web interface that allows users to upload and display a CSV file. Features include filtering by date and restaurant name, displaying data in a responsive table, a mock email send feature for recruiters, and download and delete functionalities.",
    technologies: ["Next.js", "Python", "Flask", "Pandas"],
    github: "https://github.com/Inman2004/assinment-data-handler",
    live: "",
    blogPost: "blog/kprqN5h359Kf7TKzahpO",
    images: ["/images/projects/dh.png", "/images/projects/dh2.png", "/images/projects/dh3.png"],
    startDate: new Date('2025-05-05'),
    endDate: new Date('2025-05-08'),
    status: "completed",
    content: `## Project Overview
PneumoScan is an advanced medical imaging analysis platform that leverages deep learning to detect and classify pneumonia from chest X-ray images. The system was developed to assist radiologists in making faster and more accurate diagnoses, particularly in resource-constrained healthcare settings.

## Technical Implementation
- Utilized a custom CNN architecture built with TensorFlow and Keras for image classification
- Implemented data augmentation techniques to handle limited medical imaging datasets
- Created a responsive web interface using Next.js and TailwindCSS for seamless user experience
- Integrated DICOM image processing for handling medical imaging standards
- Deployed the model using TensorFlow Serving for efficient inference

## Key Features
- **High Accuracy**: Achieved 94.5% accuracy in pneumonia detection
- **Real-time Analysis**: Processes X-ray images in under 2 seconds
- **User Management**: Role-based access for radiologists and administrators
- **Detailed Reports**: Generates comprehensive PDF reports with findings
- **DICOM Support**: Native support for medical imaging standards

## Challenges & Solutions
- **Data Scarcity**: Addressed limited medical imaging data through advanced data augmentation
- **Model Bias**: Implemented class weighting to handle imbalanced datasets
- **Deployment**: Optimized model size for cloud deployment without sacrificing accuracy

## Technologies Used
- **Frontend**: Next.js, TypeScript, TailwindCSS
- **Backend**: Node.js, Express
- **AI/ML**: TensorFlow, Keras, OpenCV
- **Database**: MongoDB
- **DevOps**: Docker, AWS ECS, GitHub Actions`
  },
  {
    title: "A Slot Machine Game",
    description: "An interactive slot machine game built with vanilla JavaScript, HTML, and CSS. The game features realistic slot mechanics, sound effects, and a points system.",
    technologies: ["JavaScript", "HTML5", "CSS3", "Canvas"],
    github: "https://github.com/Inman2004/slot-machine",
    live: "https://inman2004.github.io/slot-machine/",
    images: ["/images/projects/sl.png", "/images/projects/sl2.png", "/images/projects/sl3.png"],
    startDate: new Date('2023-03-01'),
    endDate: new Date('2023-03-31'),
    status: "abandoned",
    content: `## Project Overview
A fun and interactive slot machine game built with vanilla JavaScript, offering an engaging casino experience in the browser. The game features realistic slot mechanics, smooth animations, and a rewarding points system to keep players entertained.

## Technical Implementation
- Built with vanilla JavaScript for core game logic and animations
- Utilized HTML5 Canvas for smooth rendering of slot reels and symbols
- Implemented CSS animations for engaging visual effects
- Created a custom physics engine for realistic reel spinning mechanics
- Added sound effects and background music for an immersive experience
- Designed a responsive layout that works on both desktop and mobile devices

## Key Features
- **Realistic Slot Mechanics**: Smooth spinning reels with realistic physics
- **Multiple Paylines**: Multiple ways to win across different symbol combinations
- **Progressive Jackpot**: Increasing jackpot that grows with each play
- **Sound Design**: Immersive sound effects and background music
- **Responsive Design**: Fully playable on all screen sizes
- **Local Storage**: Saves player progress and high scores
- **Bonus Rounds**: Special bonus games with increased winning potential

## Challenges & Solutions
- **Performance**: Optimized canvas rendering for smooth animations
- **Cross-browser Compatibility**: Ensured consistent experience across browsers
- **Mobile Support**: Implemented touch controls for mobile devices
- **Audio Management**: Created an audio manager for handling multiple sound effects
- **State Management**: Implemented a robust state management system for game flow

## Technologies Used
- **Frontend**: Vanilla JavaScript, HTML5 Canvas, CSS3
- **Animation**: RequestAnimationFrame for smooth animations
- **Audio**: Web Audio API for sound effects and music
- **Storage**: LocalStorage for saving game state
- **Deployment**: GitHub Pages for hosting
- **Version Control**: Git for source code management`
  },
  {
    title: "My First Portfolio",
    description: "My first portfolio website built with HTML, CSS, and JavaScript. This was my first major web development project and served as a learning experience for frontend development.",
    technologies: ["HTML5", "CSS3", "JavaScript", "Responsive Design"],
    github: "https://github.com/Inman2004/portfolio",
    live: "https://inman2004.github.io/portfolio/",
    images: ["/images/projects/pf.png", "/images/projects/pf2.png", "/images/projects/pf3.png"],
    startDate: new Date('2022-12-01'),
    endDate: new Date('2023-01-15'),
    status: "outdated",
    content: `## Project Overview
My first portfolio website was a foundational project that marked the beginning of my web development journey. Built entirely with vanilla web technologies, it showcases my early work, skills, and personal brand as an aspiring developer.

## Technical Implementation
- Developed with semantic HTML5 for clean, accessible markup
- Implemented responsive design using CSS3 Flexbox and Grid
- Added interactive elements with vanilla JavaScript
- Created smooth scroll behavior and navigation
- Optimized images and assets for fast loading
- Ensured cross-browser compatibility
- Deployed using GitHub Pages for simple hosting

## Key Features
- **Responsive Layout**: Adapts seamlessly to all device sizes
- **Project Showcase**: Interactive gallery of my early work
- **Skills Section**: Visual representation of my technical abilities
- **Contact Form**: Functional contact form with basic validation
- **Dark/Light Mode**: Toggle between color schemes
- **Performance Optimized**: Fast loading times and smooth animations
- **Accessibility**: Built with WCAG guidelines in mind

## Challenges & Solutions
- **Responsive Design**: Learned media queries and flexible layouts
- **Cross-browser Issues**: Implemented vendor prefixes and fallbacks
- **Performance**: Optimized images and minified assets
- **Code Organization**: Structured CSS with BEM methodology
- **Form Handling**: Implemented client-side validation
- **Deployment**: Learned Git workflows and GitHub Pages

## Technologies Used
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Design**: Custom CSS, CSS Variables, CSS Animations
- **Version Control**: Git, GitHub
- **Hosting**: GitHub Pages
- **Tools**: VS Code, Chrome DevTools, Lighthouse
- **Performance**: Image optimization, minification`
  }
];
