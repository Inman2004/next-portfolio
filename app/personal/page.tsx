'use client';

import { useState } from 'react';
import Image from 'next/image';
import { BookOpen, Music, Film, Code, Briefcase, ArrowRight, ChevronDown, ChevronUp, MapPin, Mail, HeartCrack, Languages, Video } from 'lucide-react';
import { Gamepad2, Utensils } from 'lucide-react';
import MusicPlayer from '@/components/MusicPlayer';
import { NeonGradientCard } from '@/components/magicui/neon-gradient-card';
import Footer from '@/components/Footer';
import HeroVideoDialog from '@/components/magicui/hero-video-dialog';

type TabType = 'about' | 'favorites' | 'studies' | 'music' | 'shows' | 'recording';

const Personel = () => {
  const [activeTab, setActiveTab] = useState<TabType>('about');
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({});

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const [loading, setLoading] = useState(false);

  const handleDownload = async (filename: string = 'Immanuvel_B_2025.pdf') => {
    setLoading(true);
    try {
      // Encode the filename for URL safety
      const encodedFilename = encodeURIComponent(filename);
      const response = await fetch(`/api/download?file=${encodedFilename}`);
      
      // Handle API errors
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to download file');
      }
      
      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get('content-disposition');
      let downloadFilename = filename;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i);
        if (filenameMatch && filenameMatch[1]) {
          downloadFilename = filenameMatch[1].replace(/['"]/g, '');
        }
      }
      
      // Create blob and download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = url;
      link.setAttribute('download', downloadFilename);
      link.style.display = 'none';
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Download error:', error);
      // Show error message to user
      alert(error instanceof Error ? error.message : 'Failed to download file');
    } finally {
      setLoading(false);
    }
  };

  const tabs: {id: TabType; icon: JSX.Element; label: string}[] = [
    { id: 'about', icon: <Briefcase size={18} />, label: 'About Me' },
    { id: 'recording', icon: <Video size={18} />, label: 'Recording' },
    { id: 'favorites', icon: <BookOpen size={18} />, label: 'Favorites' },
    { id: 'studies', icon: <Code size={18} />, label: 'Studies' },
    { id: 'music', icon: <Music size={18} />, label: 'Music' },
    { id: 'shows', icon: <Film size={18} />, label: 'Shows' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'about':
        return (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-indigo-500/20">
                <Image 
                  src="/images/crop.png" 
                  alt="Profile" 
                  fill 
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                  Immanuvel B
                </h2>
                <p className="text-zinc-600 dark:text-zinc-300 mt-2">
                  Web Developer & Tech Enthusiast
                </p>
                <p className="mt-4 text-zinc-700 dark:text-zinc-200">
                  Passionate about creating beautiful, functional web experiences.
                  Love learning new technologies and building cool stuff!
                </p>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-indigo-500">
                Quick Facts
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: <MapPin size={18} className="text-rose-500" />, label: 'Location', value: 'Tamil Nadu, India' },
                  { icon: <Mail size={18} className="text-indigo-500" />, label: 'Email', value: 'rvimman@gmail.com' },
                  { icon: <BookOpen size={18} className="text-blue-500" />, label: 'Education', value: 'B.E in Computer Science' },
                  { icon: <Music size={18} className="text-amber-500" />, label: 'Interests', value: 'Tech, Music, Games, Phycology' },
                  { icon: <Briefcase size={18} className="text-lime-500" />, label: 'Work Status', value: 'Unemployed' },
                  { icon: <Languages size={18} className="text-teal-500" />, label: 'Languages', value: 'English, Tamil' },
                ].map((item, index) => (
                  <div key={index} className="bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-sm border border-zinc-100 dark:border-zinc-700">
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">{item.label}</p>
                    </div>
                    <p className="font-medium text-zinc-700/80 dark:text-zinc-200/80">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => handleDownload('Immanuvel_B_latest.pdf')}
                disabled={loading}
                className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                  loading
                    ? 'bg-zinc-400 dark:bg-zinc-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Downloading...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg>
                    Download Resume
                  </>
                )}
              </button>
            </div>
          </div>
        );

      case 'recording':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-primary">Recording</h2>
            <p className="text-muted-foreground">Check out some of my latest recordings and performances.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  videoSrc: '/videos/PneumoScan Demo.mp4',
                  title: 'PneumoScan Demo',
                  thumbnailSrc: '/videos/PneumoScan Demo-Cover.jpg',
                  description: 'PneumoScan is a web application that uses CNN and machine learning to detect pneumonia in chest X-rays.',
                  autoGenerateThumbnail: false
                },
                // Add more videos
              ].map((item, index) => (
                <div key={index} className="group">
                  <div className="relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-md">
                    <HeroVideoDialog 
                      videoSrc={item.videoSrc}
                      thumbnailSrc={item.thumbnailSrc}
                      thumbnailAlt={item.title}
                      autoGenerateThumbnail={item.autoGenerateThumbnail}
                      className="aspect-video w-full"
                    />
                    <div className="p-4">
                      <h3 className="font-medium leading-tight">{item.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'favorites':
        return (
          <div className="space-y-6">
            {[ 
              { 
                id: 'books',
                title: 'Books',
                icon: <BookOpen size={18} className="text-indigo-500" />,
                items: ['Phychology of Money', 'The Alchemist', 'Terms and Conditions'] 
              },
              { 
                id: 'games',
                title: 'Games',
                icon: <Gamepad2 size={18} className="text-green-500" />,
                items: ['God of War 4', 'Red Dead Redemption 2', 'Death Stranding'] 
              },
              { 
                id: 'food',
                title: 'Food',
                icon: <Utensils size={18} className="text-amber-500" />,
                items: ['Non-veg', 'Spicy', 'All Deserts'] 
              },
            ].map((section, index) => (
              <div key={index} className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm overflow-hidden border border-zinc-100 dark:border-zinc-700">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full px-6 py-4 flex justify-between items-center text-left hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                >
                  <h3 className="text-lg text-primary font-medium flex items-center gap-2">
                    {section.icon}
                    <span>{section.title}</span>
                  </h3>
                  {expandedSections[section.id] ? (
                    <ChevronUp className="text-zinc-400" />
                  ) : (
                    <ChevronDown className="text-zinc-400" />
                  )}
                </button>
                {expandedSections[section.id] && (
                  <div className="px-6 pb-4 pt-2">
                    <ul className="space-y-2">
                      {section.items.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                          <ArrowRight className="w-4 h-4 text-indigo-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      case 'studies':
        return (
          <div className="space-y-6">
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500/20 via-indigo-500/50 to-transparent" />
              {[
                {
                  department: 'Computer Science and Engineering',
                  Degree: 'Bachelor of Engineering',
                  institution: 'Anna University',
                  year: '2022 - 2025',
                  description: 'Specialized in Machine Learning and AI',
                  website: 'https://www.annauniv.edu'
                },
                {
                  department: 'Computer Engineering',
                  Degree: 'Diploma',
                  institution: 'MSPVl Polytechnic college',
                  year: '2019 - 2022',
                  description: 'Web Development and Programming',
                  website: 'http://www.mspvl.com/'
                }
              ].map((edu, index) => (
                <div key={index} className="relative pl-16 pb-8">
                  <div className="absolute left-5 top-1 w-3 h-3 rounded-full bg-indigo-500 -tranzinc-x-1.5" />
                  <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm border border-zinc-100 dark:border-zinc-700">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">{edu.Degree}</h3>
                        <h5 className="text-sm font-medium text-zinc-500 mb-2">{edu.department}</h5>
                        <a href={edu.website} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:font-medium mt-2 block">{edu.institution}</a>
                      </div>
                      <span className="text-sm text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-700 px-3 py-1 rounded-full">
                        {edu.year}
                      </span>
                    </div>
                    <p className="mt-2 text-zinc-600 dark:text-zinc-300">{edu.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'music':
        return (
          <div className="space-y-6">
            <h3 className="text-xl text-primary font-semibold mb-4">My Music Player</h3>
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-100 dark:border-zinc-700 p-6">
              <MusicPlayer />
            </div>
          </div>
        );

      case 'shows':
        return (
            <div className="space-y-6">
            <h3 className="text-xl text-primary font-semibold mb-4">My Favorite Shows</h3>
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-100 dark:border-zinc-700 p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { 
                    title: 'Money Heist', 
                    type: 'TV Series', 
                    image: 'https://loyolamaroon.com/wp-content/uploads/2020/04/MoneyHeistPart4.jpg' 
                },
                { 
                    title: '96', 
                    type: 'Movie', 
                    image: 'https://resizing.flixster.com/Nz4TknBhR-qm3OBJVBHPySUH-n8=/fit-in/705x460/v2/https://resizing.flixster.com/-XZAfHZM39UwaGJIFWKAE8fS0ak=/v3/t/assets/p22986611_v_v7_aa.jpg' 
                },
                { 
                    title: 'Attack on Titan', 
                    type: 'Anime', 
                    image: 'https://m.media-amazon.com/images/M/MV5BZjliODY5MzQtMmViZC00MTZmLWFhMWMtMjMwM2I3OGY1MTRiXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg' 
                },
                { 
                    title: 'Bleach', 
                    type: 'Anime', 
                    image: 'https://static.wikia.nocookie.net/bleach/images/9/93/Bleach_Viz_DVD_Set_Twenty-Two_Cover.png/revision/latest?cb=20180216053904&path-prefix=en' 
                },
                { 
                    title: 'Pacific Rim', 
                    type: 'Movie', 
                    image: 'https://resizing.flixster.com/-XZAfHZM39UwaGJIFWKAE8fS0ak=/v3/t/assets/p9360990_p_v12_at.jpg' 
                },
                { 
                    title: 'One Piece', 
                    type: 'Anime', 
                    image: 'https://images.justwatch.com/poster/310515848/s718/one-piece.jpg' 
                },
              ].map((show, index) => (
                <div key={index} className="aspect-[4/5] rounded-lg overflow-hidden relative group cursor-pointer">
                  <Image 
                    src={show.image}
                    width={500}
                    height={500} 
                    alt={show.title} 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t dark:from-zinc-800/80 from-zinc-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <div>
                      <h4 className="font-medium dark:text-white text-black">{show.title}</h4>
                      <p className="text-sm dark:text-zinc-300 text-zinc-600">{show.type}</p>
                    </div>
                  </div>
                  <div className="w-full h-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                    <Film className="w-8 h-8 text-zinc-400" />
                  </div>
                </div>
              ))}
            </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
    <div className="max-w-full mx-auto my-12 py-12 px-4 sm:px-6 lg:px-8 ml-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
          Personal Space
        </h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-300">
          Get to know me beyond the code
        </p>
      </div>
      
      <NeonGradientCard 
        className="w-full"
        borderSize={2}
        borderRadius={20}
        neonColors={{
          firstColor: "#8b5cf6", // indigo-500
          secondColor: "#6366f1" // indigo-600
        }}
      >
        <div className="bg-white dark:bg-zinc-800 rounded-xl overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Sidebar */}
            <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-zinc-100 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-8">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-4 border-indigo-500/20">
                    <Image 
                        fill 
                        className="object-cover" 
                        sizes="(max-width: 768px) 100vw, 33vw" 
                        src="/images/crop.png" 
                        alt="Profile" 
                    />
                  </div>
                  <div>
                    <h2 className="font-semibold">rvimman</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Personal Space</p>
                  </div>
                </div>
                <nav className="space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                          : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 md:p-8">
              {renderContent()}
            </div>
          </div>
        </div>
      </NeonGradientCard>
    </div>
   
 <Footer />
 </>
  );
};

export default Personel;