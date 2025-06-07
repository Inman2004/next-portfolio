'use client';

import { useState, useRef, useEffect } from 'react';

interface Song {
  id: string;
  title: string;
  artist: string;
  previewUrl: string;
  imageUrl: string;
}

export default function MusicPlayer() {
  const [isMuted, setIsMuted] = useState(true);
  const [hoverEnabled, setHoverEnabled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTouchId, setActiveTouchId] = useState<string | null>(null);

  // Mobile detection and setup
  useEffect(() => {
    const checkIfMobile = () => {
      const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
      
      // On mobile, we'll use touch events instead of hover
      if (isMobileDevice) {
        setHoverEnabled(true);
      }
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  const [songs, setSongs] = useState<Song[]>([
    {
      id: '1',
      title: 'Perfect',
      artist: 'Ed Sheeran',
      previewUrl: '/songs/Perfect.mp3',
      imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVGCzwwDog1BlzWxLaglpOkt0YlSw65QsxJA&s',
    },
    {
      id: '2',
      title: 'Ride It',
      artist: 'Lil Nas X',
      previewUrl: '/songs/Rideit.mp3',
      imageUrl: 'https://c.saavncdn.com/068/Ride-It-English-2013-500x500.jpg',
    },
    {
      id: '3',
      title: 'Dheema',
      artist: 'Anirudh',
      previewUrl: '/songs/Dheema.mp3',
      imageUrl: '/images/songCover/anirudh.png',
    },
    {
      id: '4',
      title: 'Blue',
      artist: 'Yung kai',
      previewUrl: '/songs/Blue.mp3',
      imageUrl: '/images/songCover/blue.jpg',
    }
    // Add more songs as needed
  ]);

  const audioRefs = useRef<{[key: string]: HTMLAudioElement | null}>({});
  const [activeSong, setActiveSong] = useState<string | null>(null);

  const toggleMute = async () => {
    if (isMuted) {
      try {
        // Try to play a silent audio to enable audio context
        const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU' + 'A'.repeat(1000));
        await audio.play();
        audio.pause();
        setHoverEnabled(true);
      } catch (e) {
        console.error('Could not enable audio:', e);
        return;
      }
    }
    setIsMuted(!isMuted);
  };

  const handleTouchStart = (song: Song) => {
    if (isMuted) return;
    setActiveTouchId(song.id);
    handleMouseEnter(song);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    if (activeTouchId) {
      handleMouseLeave();
      setActiveTouchId(null);
    }
  };

  const handleMouseEnter = async (song: Song) => {
    if (isMuted) return;
    // Pause any currently playing audio
    if (activeSong && audioRefs.current[activeSong]) {
      try {
        await audioRefs.current[activeSong]?.pause();
      } catch (e) {
        console.error('Error pausing audio:', e);
      }
    }
    
    // Play the new audio
    const audio = audioRefs.current[song.id];
    if (audio) {
      try {
        audio.currentTime = 0;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setActiveSong(song.id))
            .catch(e => console.error('Error playing audio:', e));
        }
      } catch (e) {
        console.error('Error preparing audio:', e);
      }
    }
  };

  const handleMouseLeave = async () => {
    if (activeSong && audioRefs.current[activeSong]) {
      try {
        await audioRefs.current[activeSong]?.pause();
        setActiveSong(null);
      } catch (e) {
        console.error('Error pausing audio on leave:', e);
      }
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 my-28">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 bg-clip-text text-transparent">Currently in vide with</h2>
        <button
          onClick={toggleMute}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span>Unmute</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
              </svg>
              <span>Mute</span>
            </>
          )}
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {songs.map((song) => (
          <div 
            key={song.id} 
            className={`relative group rounded-xl overflow-hidden shadow-lg transition-all duration-300 transform hover:scale-105 ${
              activeSong === song.id 
                ? 'ring-2 ring-purple-500 dark:ring-purple-400' 
                : 'hover:shadow-xl shadow-purple-600/50 blur-sm shadow-sm'
            }`}
            onMouseEnter={() => !isMobile && handleMouseEnter(song)}
            onMouseLeave={!isMobile ? handleMouseLeave : undefined}
            onTouchStart={() => isMobile && handleTouchStart(song)}
            onTouchEnd={isMobile ? handleTouchEnd : undefined}
            onTouchCancel={isMobile ? handleTouchEnd : undefined}
            onClick={(e) => {
              if (isMobile) {
                e.preventDefault();
                if (activeSong === song.id) {
                  handleMouseLeave();
                } else {
                  handleMouseEnter(song);
                }
              }
            }}
          >
            {/* Album Art */}
            <div className="relative aspect-square w-full bg-gray-200 dark:bg-gray-700">
              {song.imageUrl && (
                <img 
                  src={song.imageUrl} 
                  alt={`${song.title} cover`} 
                  className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
                />
              )}
              
              {/* Play/Pause Overlay */}
              <div className={`absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center transition-opacity duration-300 ${
                activeSong === song.id ? 'opacity-100' : isMobile ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
              }`}>
                {activeSong === song.id ? (
                  <div className="flex space-x-1 h-10">
                    <div className="w-1.5 h-4 bg-white/50 rounded-full animate-pulse"></div>
                    <div className="w-1.5 h-6 bg-white/50 rounded-full animate-pulse delay-75"></div>
                    <div className="w-1.5 h-8 bg-white/50 rounded-full animate-pulse delay-150"></div>
                    <div className="w-1.5 h-6 bg-white/50 rounded-full animate-pulse delay-200"></div>
                    <div className="w-1.5 h-4 bg-white/50 rounded-full animate-pulse delay-300"></div>
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
            
            {/* Song Info */}
            <div className="p-4 bg-white dark:bg-gray-800">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">{song.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{song.artist}</p>
            </div>
            
            <audio
              ref={(el) => {
                audioRefs.current[song.id] = el;
                if (el) {
                  el.addEventListener('ended', () => setActiveSong(null));
                }
              }}
              src={song.previewUrl}
              preload="none"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
