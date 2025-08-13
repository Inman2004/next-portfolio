// import { Metadata } from 'next';
// import { motion } from 'framer-motion';
// import Image from 'next/image';
// import Link from 'next/link';
// import { Button } from '@/components/ui/button';
// import { ArrowRight, Download, MapPin, Calendar, Mail, Phone } from 'lucide-react';
// import { FaGithub, FaLinkedin, FaXTwitter } from 'react-icons/fa6';

// export const metadata: Metadata = {
//   title: 'About - Immanuvel',
//   description: 'Learn more about Immanuvel - Full-stack developer passionate about creating beautiful, functional web experiences.',
//   openGraph: {
//     title: 'About - Immanuvel',
//     description: 'Learn more about Immanuvel - Full-stack developer passionate about creating beautiful, functional web experiences.',
//     type: 'website',
//   },
// };

// const skills = [
//   { category: 'Frontend', items: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'] },
//   { category: 'Backend', items: ['Node.js', 'Python', 'Firebase', 'PostgreSQL', 'MongoDB'] },
//   { category: 'Tools & Others', items: ['Git', 'Docker', 'AWS', 'Figma', 'Three.js'] },
// ];

// const timeline = [
//   {
//     year: '2024',
//     title: 'Senior Full-Stack Developer',
//     company: 'Tech Innovations Inc.',
//     description: 'Leading development of scalable web applications and mentoring junior developers.',
//   },
//   {
//     year: '2023',
//     title: 'Full-Stack Developer',
//     company: 'Digital Solutions Ltd.',
//     description: 'Built responsive web applications using React, Node.js, and modern development practices.',
//   },
//   {
//     year: '2022',
//     title: 'Frontend Developer',
//     company: 'Creative Web Agency',
//     description: 'Specialized in creating engaging user interfaces and optimizing web performance.',
//   },
// ];

// export default function AboutPage() {
//   return (
//     <div className="min-h-screen bg-background">
//       {/* Hero Section */}
//       <section className="relative py-20 lg:py-32">
//         <div className="container mx-auto px-4">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8 }}
//             className="max-w-4xl mx-auto text-center"
//           >
//             <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 bg-clip-text text-transparent mb-6">
//               About Me
//             </h1>
//             <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
//               I'm a passionate full-stack developer with a keen eye for detail and a love for creating
//               beautiful, functional web experiences that make a difference.
//             </p>
//           </motion.div>
//         </div>
//       </section>

//       {/* Personal Info Section */}
//       <section className="py-16">
//         <div className="container mx-auto px-4">
//           <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
//             {/* Image */}
//             <motion.div
//               initial={{ opacity: 0, x: -50 }}
//               whileInView={{ opacity: 1, x: 0 }}
//               transition={{ duration: 0.8 }}
//               className="relative"
//             >
//               <div className="relative w-full max-w-md mx-auto">
//                 <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500/20 to-purple-600/20 p-1">
//                   <div className="w-full h-full rounded-2xl overflow-hidden">
//                     <Image
//                       src="/images/avatar1.png"
//                       alt="Immanuvel"
//                       width={400}
//                       height={400}
//                       className="w-full h-full object-cover"
//                       priority
//                     />
//                   </div>
//                 </div>
//                 {/* Floating elements */}
//                 <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-500/20 rounded-full blur-xl"></div>
//                 <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-purple-500/20 rounded-full blur-xl"></div>
//               </div>
//             </motion.div>

//             {/* Content */}
//             <motion.div
//               initial={{ opacity: 0, x: 50 }}
//               whileInView={{ opacity: 1, x: 0 }}
//               transition={{ duration: 0.8 }}
//               className="space-y-6"
//             >
//               <h2 className="text-3xl font-bold">Hi, I'm Immanuvel 👋</h2>
//               <div className="space-y-4 text-muted-foreground">
//                 <p>
//                   I am a passionate developer and designer with over 3 years of experience in creating 
//                   modern web applications. My journey started with a curiosity about how websites work, 
//                   and it has evolved into a career dedicated to building digital experiences that users love.
//                 </p>
//                 <p>
//                   With a strong foundation in both front-end and back-end development, I specialize in
//                   creating responsive, user-friendly applications using cutting-edge technologies like
//                   React, Next.js, and modern JavaScript frameworks.
//                 </p>
//                 <p>
//                   When I'm not coding, you can find me exploring new technologies, contributing to open-source
//                   projects, or sharing my knowledge through blog posts and community events.
//                 </p>
//               </div>

//               {/* Quick Info */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
//                 <div className="flex items-center gap-3">
//                   <MapPin className="w-5 h-5 text-blue-500" />
//                   <span className="text-sm">Based in Chennai, India</span>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <Calendar className="w-5 h-5 text-green-500" />
//                   <span className="text-sm">3+ Years Experience</span>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <Mail className="w-5 h-5 text-purple-500" />
//                   <span className="text-sm">Available for Projects</span>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <Phone className="w-5 h-5 text-orange-500" />
//                   <span className="text-sm">Open to Collaborate</span>
//                 </div>
//               </div>

//               {/* Action Buttons */}
//               <div className="flex flex-col sm:flex-row gap-4 pt-6">
//                 <Button className="group">
//                   <Download className="w-4 h-4 mr-2" />
//                   Download Resume
//                   <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
//                 </Button>
//                 <Button variant="outline" asChild>
//                   <Link href="/contact">
//                     Get In Touch
//                   </Link>
//                 </Button>
//               </div>

//               {/* Social Links */}
//               <div className="flex gap-4 pt-4">
//                 <Link
//                   href="https://github.com/rvimman"
//                   className="p-3 rounded-xl bg-accent/50 hover:bg-accent transition-colors"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                 >
//                   <FaGithub className="w-5 h-5" />
//                 </Link>
//                 <Link
//                   href="https://linkedin.com/in/rv3d"
//                   className="p-3 rounded-xl bg-accent/50 hover:bg-accent transition-colors"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                 >
//                   <FaLinkedin className="w-5 h-5" />
//                 </Link>
//                 <Link
//                   href="https://twitter.com/rvimman_"
//                   className="p-3 rounded-xl bg-accent/50 hover:bg-accent transition-colors"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                 >
//                   <FaXTwitter className="w-5 h-5" />
//                 </Link>
//               </div>
//             </motion.div>
//           </div>
//         </div>
//       </section>

//       {/* Skills Section */}
//       <section className="py-16 bg-accent/5">
//         <div className="container mx-auto px-4">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8 }}
//             className="max-w-4xl mx-auto text-center mb-12"
//           >
//             <h2 className="text-3xl md:text-4xl font-bold mb-4">Skills & Technologies</h2>
//             <p className="text-muted-foreground">
//               Technologies and tools I work with to bring ideas to life
//             </p>
//           </motion.div>

//           <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
//             {skills.map((skillGroup, index) => (
//               <motion.div
//                 key={skillGroup.category}
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.8, delay: index * 0.1 }}
//                 className="text-center"
//               >
//                 <h3 className="text-xl font-semibold mb-4">{skillGroup.category}</h3>
//                 <div className="space-y-2">
//                   {skillGroup.items.map((skill) => (
//                     <div
//                       key={skill}
//                       className="px-3 py-2 bg-background/50 rounded-lg border text-sm"
//                     >
//                       {skill}
//                     </div>
//                   ))}
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Experience Timeline */}
//       <section className="py-16">
//         <div className="container mx-auto px-4">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8 }}
//             className="max-w-4xl mx-auto text-center mb-12"
//           >
//             <h2 className="text-3xl md:text-4xl font-bold mb-4">Experience</h2>
//             <p className="text-muted-foreground">
//               My professional journey and career highlights
//             </p>
//           </motion.div>

//           <div className="max-w-3xl mx-auto">
//             {timeline.map((item, index) => (
//               <motion.div
//                 key={index}
//                 initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
//                 whileInView={{ opacity: 1, x: 0 }}
//                 transition={{ duration: 0.8, delay: index * 0.1 }}
//                 className="relative pl-8 pb-8 last:pb-0"
//               >
//                 {/* Timeline line */}
//                 {index !== timeline.length - 1 && (
//                   <div className="absolute left-4 top-8 w-0.5 h-full bg-border"></div>
//                 )}
                
//                 {/* Timeline dot */}
//                 <div className="absolute left-2 top-2 w-4 h-4 bg-primary rounded-full border-4 border-background"></div>
                
//                 {/* Content */}
//                 <div className="bg-card border rounded-lg p-6">
//                   <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
//                     <h3 className="text-lg font-semibold">{item.title}</h3>
//                     <span className="text-sm font-medium text-primary">{item.year}</span>
//                   </div>
//                   <p className="text-muted-foreground font-medium mb-2">{item.company}</p>
//                   <p className="text-sm text-muted-foreground">{item.description}</p>
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className="py-16 bg-accent/5">
//         <div className="container mx-auto px-4">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8 }}
//             className="max-w-2xl mx-auto text-center"
//           >
//             <h2 className="text-3xl font-bold mb-4">Let's Work Together</h2>
//             <p className="text-muted-foreground mb-8">
//               I'm always interested in new opportunities and exciting projects. 
//               Let's discuss how we can bring your ideas to life.
//             </p>
//             <div className="flex flex-col sm:flex-row gap-4 justify-center">
//               <Button asChild size="lg">
//                 <Link href="/contact">
//                   Start a Project
//                   <ArrowRight className="w-4 h-4 ml-2" />
//                 </Link>
//               </Button>
//               <Button variant="outline" size="lg" asChild>
//                 <Link href="/projects">
//                   View My Work
//                 </Link>
//               </Button>
//             </div>
//           </motion.div>
//         </div>
//       </section>
//     </div>
//   );
// }
