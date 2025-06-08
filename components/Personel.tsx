// 'use client';

// import { useState } from 'react';
// import Image from 'next/image';
// import { BookOpen, Music, Film, Code, Briefcase, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
// import { Gamepad2, Utensils } from 'lucide-react';
// import MusicPlayer from './MusicPlayer';
// import { NeonGradientCard } from './magicui/neon-gradient-card';

// type TabType = 'about' | 'favorites' | 'studies' | 'music' | 'shows';

// const Personel = () => {
//   const [activeTab, setActiveTab] = useState<TabType>('about');
//   const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({});

//   const toggleSection = (sectionKey: string) => {
//     setExpandedSections(prev => ({
//       ...prev,
//       [sectionKey]: !prev[sectionKey]
//     }));
//   };

//   // Helper function to get section key
//   const getSectionKey = (index: number) => `section-${index}`;

//   const tabs: {id: TabType; icon: JSX.Element; label: string}[] = [
//     { id: 'about', icon: <Briefcase size={18} />, label: 'About Me' },
//     { id: 'favorites', icon: <BookOpen size={18} />, label: 'Favorites' },
//     { id: 'studies', icon: <Code size={18} />, label: 'Studies' },
//     { id: 'music', icon: <Music size={18} />, label: 'Music' },
//     { id: 'shows', icon: <Film size={18} />, label: 'Shows' },
//   ];

//   const renderContent = () => {
//     switch (activeTab) {
//       case 'about':
//         return (
//           <div className="space-y-6">
//             <div className="flex flex-col md:flex-row items-center gap-6">
//               <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-indigo-500/20">
//                 <Image 
//                   src="/images/avatar1.png" 
//                   alt="Profile" 
//                   fill 
//                   className="object-cover"
//                   sizes="(max-width: 768px) 100vw, 33vw"
//                 />
//               </div>
//               <div className="text-center md:text-left">
//                 <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
//                   Rv Imman
//                 </h2>
//                 <p className="text-gray-600 dark:text-gray-300 mt-2">
//                   Web Developer & Tech Enthusiast
//                 </p>
//                 <p className="mt-4 text-gray-700 dark:text-gray-200">
//                   Passionate about creating beautiful, functional web experiences.
//                   Love learning new technologies and building cool stuff!
//                 </p>
//               </div>
//             </div>
            
//             <div className="mt-8">
//               <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-indigo-500">
//                 Quick Facts
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {[
//                   { label: 'Location', value: 'Tamil Nadu, India' },
//                   { label: 'Email', value: 'rvimman@gmail.com' },
//                   { label: 'Education', value: 'B.E in Computer Science' },
//                   { label: 'Interests', value: 'Tech, Music, Travel' },
//                 ].map((item, index) => (
//                   <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
//                     <p className="text-sm text-gray-500 dark:text-gray-400">{item.label}</p>
//                     <p className="font-medium">{item.value}</p>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         );

//       case 'favorites':
//         return (
//           <div className="space-y-6">
//             {[ 
//               { 
//                 id: 'books',
//                 title: 'Books',
//                 icon: <BookOpen size={18} className="text-indigo-500" />,
//                 items: ['Phychology of Money', 'The Alchemist', 'Terms and Conditions'] 
//               },
//               { 
//                 id: 'games',
//                 title: 'Games',
//                 icon: <Gamepad2 size={18} className="text-green-500" />,
//                 items: ['God of War', 'Red Dead Redemption 2', 'Death Stranding'] 
//               },
//               { 
//                 id: 'food',
//                 title: 'Food',
//                 icon: <Utensils size={18} className="text-amber-500" />,
//                 items: ['Biryani', 'Dosa', 'Parotta'] 
//               },
//             ].map((section, index) => (
//               <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
//                 <button
//                   onClick={() => toggleSection(section.id)}
//                   className="w-full px-6 py-4 flex justify-between items-center text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
//                 >
//                   <h3 className="text-lg font-medium flex items-center gap-2">
//                     {section.icon}
//                     <span>{section.title}</span>
//                   </h3>
//                   {expandedSections[section.id] ? (
//                     <ChevronUp className="text-gray-400" />
//                   ) : (
//                     <ChevronDown className="text-gray-400" />
//                   )}
//                 </button>
//                 {expandedSections[section.id] && (
//                   <div className="px-6 pb-4 pt-2">
//                     <ul className="space-y-2">
//                       {section.items.map((item, i) => (
//                         <li key={i} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
//                           <ArrowRight className="w-4 h-4 text-indigo-500" />
//                           {item}
//                         </li>
//                       ))}
//                     </ul>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         );

//       case 'studies':
//         return (
//           <div className="space-y-6">
//             <div className="relative">
//               <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500/20 via-indigo-500/50 to-transparent" />
//               {[
//                 {
//                   title: 'B.E in Computer Science',
//                   institution: 'Anna University',
//                   year: '2022 - 2025',
//                   description: 'Specialized in Machine Learning and AI'
//                 },
//                 {
//                   title: 'Diploma in Computer Science',
//                   institution: 'Anna University',
//                   year: '2019 - 2022',
//                   description: 'Web Development and Programming'
//                 }
//               ].map((edu, index) => (
//                 <div key={index} className="relative pl-16 pb-8">
//                   <div className="absolute left-5 top-1 w-3 h-3 rounded-full bg-indigo-500 -translate-x-1.5" />
//                   <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
//                     <div className="flex justify-between items-start">
//                       <div>
//                         <h3 className="text-lg font-semibold">{edu.title}</h3>
//                         <p className="text-indigo-500">{edu.institution}</p>
//                       </div>
//                       <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
//                         {edu.year}
//                       </span>
//                     </div>
//                     <p className="mt-2 text-gray-600 dark:text-gray-300">{edu.description}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         );

//       case 'music':
//         return (
//           <div className="space-y-6">
//             <h3 className="text-xl font-semibold mb-4">My Music Player</h3>
//             <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6">
//               <MusicPlayer />
//             </div>
//           </div>
//         );

//       case 'shows':
//         return (
//           <div className="space-y-6">
//             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//               {[
//                 { 
//                     title: 'Stranger Things', 
//                     type: 'TV Series', 
//                     image: 'https://m.media-amazon.com/images/M/MV5BMjg2NmM0MTEtYWY2Yy00NmFlLTllNTMtMjVkZjEwMGVlNzdjXkEyXkFqcGc@._V1_.jpg' 
//                 },
//                 { 
//                     title: '96', 
//                     type: 'Movie', 
//                     image: 'https://resizing.flixster.com/Nz4TknBhR-qm3OBJVBHPySUH-n8=/fit-in/705x460/v2/https://resizing.flixster.com/-XZAfHZM39UwaGJIFWKAE8fS0ak=/v3/t/assets/p22986611_v_v7_aa.jpg' 
//                 },
//                 { 
//                     title: 'Attack on Titan', 
//                     type: 'Anime', 
//                     image: 'https://m.media-amazon.com/images/M/MV5BZjliODY5MzQtMmViZC00MTZmLWFhMWMtMjMwM2I3OGY1MTRiXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg' 
//                 },
//                 { 
//                     title: 'Modern Family', 
//                     type: 'TV Series', 
//                     image: 'https://www.peacocktv.com/dam/growth/assets/Library/ModernFamily/modern-family-description-image.jpg?downsize=1200:*&image-quality=7&output-format=webp&output-quality=70' 
//                 },
//                 { 
//                     title: 'Pacific Rim', 
//                     type: 'Movie', 
//                     image: 'https://resizing.flixster.com/-XZAfHZM39UwaGJIFWKAE8fS0ak=/v3/t/assets/p9360990_p_v12_at.jpg' 
//                 },
//                 { 
//                     title: 'One Piece', 
//                     type: 'Anime', 
//                     image: 'https://images.justwatch.com/poster/310515848/s718/one-piece.jpg' 
//                 },
//               ].map((show, index) => (
//                 <div key={index} className="aspect-[2/3] rounded-lg overflow-hidden relative group cursor-pointer">
//                   <Image 
//                     src={show.image}
//                     width={500}
//                     height={500} 
//                     alt={show.title} 
//                     className="w-full h-full object-cover" 
//                   />
//                   <div className="absolute inset-0 bg-gradient-to-t dark:from-gray-800/80 from-gray-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
//                     <div>
//                       <h4 className="font-medium dark:text-white text-black">{show.title}</h4>
//                       <p className="text-sm dark:text-gray-300 text-gray-600">{show.type}</p>
//                     </div>
//                   </div>
//                   <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
//                     <Film className="w-8 h-8 text-gray-400" />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         );

//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="max-w-5xl mx-auto my-12 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="text-center mb-12">
//         <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
//           Personal Space
//         </h1>
//         <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
//           Get to know me beyond the code
//         </p>
//       </div>
      
//       <NeonGradientCard 
//         className="w-full"
//         borderSize={2}
//         borderRadius={20}
//         neonColors={{
//           firstColor: "#8b5cf6", // indigo-500
//           secondColor: "#6366f1" // indigo-600
//         }}
//       >
//         <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
//           <div className="flex flex-col md:flex-row">
//             {/* Sidebar */}
//             <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
//               <div className="p-6">
//                 <div className="flex items-center gap-3 mb-8">
//                   <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
//                     <Briefcase size={24} />
//                   </div>
//                   <div>
//                     <h2 className="font-semibold">Your Name</h2>
//                     <p className="text-sm text-gray-500 dark:text-gray-400">Personal Space</p>
//                   </div>
//                 </div>
//                 <nav className="space-y-1">
//                   {tabs.map((tab) => (
//                     <button
//                       key={tab.id}
//                       onClick={() => setActiveTab(tab.id)}
//                       className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
//                         activeTab === tab.id
//                           ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
//                           : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
//                       }`}
//                     >
//                       {tab.icon}
//                       {tab.label}
//                     </button>
//                   ))}
//                 </nav>
//               </div>
//             </div>

//             {/* Main Content */}
//             <div className="flex-1 p-6 md:p-8">
//               {renderContent()}
//             </div>
//           </div>
//         </div>
//       </NeonGradientCard>
//     </div>

//   );
// };

// export default Personel;