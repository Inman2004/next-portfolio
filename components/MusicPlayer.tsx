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
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => {
      window.removeEventListener('resize', checkIfMobile);
      // Clean up all audio on unmount
      Object.values(audioRefs.current).forEach(audio => {
        if (audio) {
          audio.pause();
          audio.remove();
        }
      });
    };
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
      previewUrl: '/songs/Ride-it.mp3',
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
      title: 'emerald',
      artist: 'Yung kai',
      previewUrl: '/songs/emerald.mp3',
      imageUrl: '/images/songCover/emerald.jpg',
    }
    // Add more songs as needed
  ]);

  const audioRefs = useRef<{[key: string]: HTMLAudioElement | null}>({});
  const [activeSong, setActiveSong] = useState<string | null>(null);

  const toggleMute = async () => {
    const newMutedState = !isMuted;
    
    // If muting, stop all audio
    if (newMutedState) {
      if (activeSong && audioRefs.current[activeSong]) {
        try {
          await audioRefs.current[activeSong]?.pause();
          setActiveSong(null);
        } catch (e) {
          console.error('Error pausing audio:', e);
        }
      }
      setIsMuted(true);
      return;
    }
    
    // If unmuting, just enable hover but don't play any audio yet
    setIsMuted(false);
    setHoverEnabled(true);
    
    // Try to enable audio context without playing any song
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU' + 'A'.repeat(1000));
      await audio.play();
      audio.pause();
    } catch (e) {
      console.error('Could not enable audio:', e);
      setIsMuted(true);
    }
  };

  const handleTouchStart = (song: Song, e: React.TouchEvent) => {
    e.preventDefault();
    if (isMuted) return;
    setActiveTouchId(song.id);
    handleMouseEnter(song);
  };
  
  const handleTouchStartWrapper = (song: Song) => (e: React.TouchEvent) => {
    handleTouchStart(song, e);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    if (activeTouchId) {
      handleMouseLeave();
      setActiveTouchId(null);
    }
  };

  const handleMouseEnter = async (song: Song) => {
    if (isMuted || !hoverEnabled) return;
    
    // If clicking the same song that's already playing, pause it
    if (activeSong === song.id) {
      try {
        await audioRefs.current[activeSong]?.pause();
        setActiveSong(null);
        return;
      } catch (e) {
        console.error('Error pausing audio:', e);
      }
    }
    
    // Pause any currently playing audio
    if (activeSong && audioRefs.current[activeSong]) {
      try {
        await audioRefs.current[activeSong]?.pause();
      } catch (e) {
        console.error('Error pausing previous audio:', e);
      }
    }
    
    // Play the new audio
    const audio = audioRefs.current[song.id];
    if (audio) {
      try {
        audio.currentTime = 0;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          await playPromise;
          setActiveSong(song.id);
        }
      } catch (e) {
        console.error('Error playing audio:', e);
        setActiveSong(null);
      }
    }
  };

  const handleMouseLeave = async () => {
    // Don't stop on mobile - let the user control playback with taps
    if (isMobile) return;
    
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
    <div className="w-full">
      <div className="flex justify-end mb-4">
        <button
          onClick={toggleMute}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span>Unmute</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
              </svg>
              <span>Mute</span>
            </>
          )}
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {songs.map((song) => (
          <div 
            key={song.id} 
            className={`relative group rounded-lg overflow-hidden transition-all duration-200 transform hover:scale-[1.02] ${
              activeSong === song.id 
                ? 'ring-2 ring-indigo-500 dark:ring-indigo-400 shadow-md'
                : 'shadow-sm hover:shadow-md border border-zinc-100 dark:border-zinc-700'
            }`}
            onMouseEnter={() => handleMouseEnter(song)}
            onMouseLeave={handleMouseLeave}
            onTouchStart={isMobile ? handleTouchStartWrapper(song) : undefined}
            onTouchEnd={isMobile ? handleTouchEnd : undefined}
            onTouchCancel={isMobile ? handleTouchEnd : undefined}
            onClick={(e) => {
              if (isMobile) {
                e.preventDefault();
                handleMouseEnter(song);
              }
            }}
          >
            {/* Album Art */}
            <div className="relative aspect-square w-full bg-zinc-100 dark:bg-zinc-700/50">
              {song.imageUrl && (
                <img 
                  src={song.imageUrl} 
                  alt={`${song.title} cover`} 
                  className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
                />
              )}
              
              {/* Play/Pause Overlay */}
              <div className={`absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity duration-200 ${
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
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
            
            {/* Song Info */}
            <div className="p-3 bg-white dark:bg-zinc-800">
              <h3 className="font-medium text-sm text-zinc-900 dark:text-white truncate">{song.title}</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs">{song.artist}</p>
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
