import { useState, useEffect } from 'react';

export const useVideoThumbnail = (videoSrc: string | undefined) => {
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!videoSrc) {
      setLoading(false);
      return;
    }

    let video: HTMLVideoElement | null = null;
    
    const generateThumbnail = async () => {
      try {
        video = document.createElement('video');
        video.crossOrigin = 'anonymous';
        video.preload = 'metadata';
        video.src = videoSrc;
        
        // Wait for video to load
        await new Promise<void>((resolve, reject) => {
          video!.onloadedmetadata = () => {
            video!.currentTime = 1; // Seek to 1 second
            resolve();
          };
          video!.onerror = () => reject(new Error('Failed to load video'));
        });

        // Wait for seek to complete
        await new Promise<void>((resolve) => {
          video!.onseeked = () => resolve();
        });

        // Create canvas and draw video frame
        const canvas = document.createElement('canvas');
        canvas.width = video!.videoWidth;
        canvas.height = video!.videoHeight;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context');
        
        ctx.drawImage(video!, 0, 0, canvas.width, canvas.height);
        
        // Convert to data URL
        const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
        setThumbnail(thumbnailUrl);
        setError(null);
      } catch (err) {
        console.error('Error generating thumbnail:', err);
        setError(err instanceof Error ? err : new Error('Failed to generate thumbnail'));
      } finally {
        setLoading(false);
        // Clean up
        if (video) {
          video.pause();
          video.src = '';
          video.load();
        }
      }
    };

    generateThumbnail();

    return () => {
      // Clean up on unmount
      if (video) {
        video.pause();
        video.src = '';
        video.load();
      }
    };
  }, [videoSrc]);

  return { thumbnail, loading, error };
};
