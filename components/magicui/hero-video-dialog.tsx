"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Play, XIcon, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

type AnimationStyle =
  | "from-bottom"
  | "from-center"
  | "from-top"
  | "from-left"
  | "from-right"
  | "fade"
  | "top-in-bottom-out"
  | "left-in-right-out";

interface HeroVideoProps {
  animationStyle?: AnimationStyle;
  videoSrc: string;
  thumbnailSrc?: string;
  thumbnailAlt?: string;
  className?: string;
  autoGenerateThumbnail?: boolean;
}

const animationVariants = {
  "from-bottom": {
    initial: { y: "100%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "100%", opacity: 0 },
  },
  "from-center": {
    initial: { scale: 0.5, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.5, opacity: 0 },
  },
  "from-top": {
    initial: { y: "-100%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "-100%", opacity: 0 },
  },
  "from-left": {
    initial: { x: "-100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 },
  },
  "from-right": {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "100%", opacity: 0 },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  "top-in-bottom-out": {
    initial: { y: "-100%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "100%", opacity: 0 },
  },
  "left-in-right-out": {
    initial: { x: "-100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "100%", opacity: 0 },
  },
};

export default function HeroVideoDialog({
  animationStyle = "from-center",
  videoSrc,
  thumbnailSrc: propThumbnailSrc,
  thumbnailAlt = "Video thumbnail",
  className,
  autoGenerateThumbnail = true,
}: HeroVideoProps) {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [thumbnailSrc, setThumbnailSrc] = useState(propThumbnailSrc || '');
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
  const selectedAnimation = animationVariants[animationStyle];
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate thumbnail from video if needed
  useEffect(() => {
    if (!autoGenerateThumbnail || !videoSrc || propThumbnailSrc) return;

    const generateThumbnail = async () => {
      if (!videoRef.current) return;
      
      setIsGeneratingThumbnail(true);
      
      try {
        const video = videoRef.current;
        video.src = videoSrc;
        
        // Wait for video to load metadata
        await new Promise<void>((resolve) => {
          video.onloadedmetadata = () => resolve();
          video.onerror = () => {
            console.error('Error loading video for thumbnail generation');
            resolve();
          };
        });

        if (!video.duration) {
          console.error('Could not get video duration');
          return;
        }

        // Try to capture frames at different points in the video
        const capturePoints = [
          video.duration * 0.1,  // 10%
          video.duration * 0.25, // 25%
          video.duration * 0.5,  // 50%
          video.duration * 0.75, // 75%
          video.duration * 0.9,  // 90%
          Math.min(5, video.duration * 0.25), // First 5 seconds or 25%
          Math.min(10, video.duration * 0.5), // First 10 seconds or 50%
        ];

        // Remove duplicates and sort
        const uniquePoints = [...new Set(capturePoints)].sort((a, b) => a - b);

        // Try each capture point until we get a good frame
        for (const time of uniquePoints) {
          try {
            await new Promise<void>((resolve) => {
              video.currentTime = time;
              const onSeeked = () => {
                video.removeEventListener('seeked', onSeeked);
                resolve();
              };
              video.addEventListener('seeked', onSeeked);
            });

            if (canvasRef.current) {
              const canvas = canvasRef.current;
              const ctx = canvas.getContext('2d');
              if (!ctx) continue;

              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

              // Check if frame is interesting (not all black/white)
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const data = imageData.data;
              let brightness = 0;
              let totalPixels = 0;
              
              // Sample pixels (check every 10th pixel for performance)
              for (let i = 0; i < data.length; i += 40) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                brightness += 0.299 * r + 0.587 * g + 0.114 * b;
                totalPixels++;
              }
              
              const avgBrightness = brightness / totalPixels;
              
              // If frame is not too dark or too bright, use it
              if (avgBrightness > 20 && avgBrightness < 230) {
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                setThumbnailSrc(dataUrl);
                return;
              }
            }
          } catch (e) {
            console.warn(`Error capturing frame at ${time}s:`, e);
            continue;
          }
        }
        
        // If no good frame found, use the first frame as fallback
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            video.currentTime = 0;
            await new Promise(resolve => {
              video.onseeked = resolve;
            });
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            setThumbnailSrc(dataUrl);
          }
        }
      } catch (error) {
        console.error('Error generating thumbnail:', error);
      } finally {
        setIsGeneratingThumbnail(false);
      }
    };

    generateThumbnail();
  }, [videoSrc, autoGenerateThumbnail, propThumbnailSrc]);

  return (
    <div className={cn("relative", className)}>
      <div
        className="group relative cursor-pointer"
        onClick={() => setIsVideoOpen(true)}
      >
        {/* Hidden video element for thumbnail generation */}
        <video ref={videoRef} className="hidden" />
        <canvas ref={canvasRef} className="hidden" />
        
        {isGeneratingThumbnail ? (
          <div className="flex h-64 w-full items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : thumbnailSrc ? (
          <img
            src={thumbnailSrc}
            alt={thumbnailAlt}
            width={1920}
            height={1080}
            className="w-full rounded-md border shadow-lg transition-all duration-200 ease-out group-hover:brightness-[0.8]"
          />
        ) : (
          <div className="flex h-64 w-full items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800">
            <Play className="h-12 w-12 text-gray-400" />
          </div>
        )}
        <div className="absolute inset-0 flex scale-[0.9] items-center justify-center rounded-2xl transition-all duration-200 ease-out group-hover:scale-100">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 backdrop-blur-md">
            <div
              className={`relative flex size-10 scale-100 items-center justify-center rounded-full bg-gradient-to-b from-primary/30 to-primary shadow-md transition-all duration-200 ease-out group-hover:scale-[1.2]`}
            >
              <Play
                className="size-4 scale-100 fill-white text-white transition-transform duration-200 ease-out group-hover:scale-105"
                style={{
                  filter:
                    "drop-shadow(0 4px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06))",
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isVideoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setIsVideoOpen(false)}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md"
          >
            <motion.div
              {...selectedAnimation}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative mx-4 aspect-video w-full max-w-4xl md:mx-0"
            >
              <motion.button className="absolute -top-16 right-0 rounded-full bg-neutral-900/50 p-2 text-xl text-white ring-1 backdrop-blur-md dark:bg-neutral-100/50 dark:text-black">
                <XIcon className="size-5" />
              </motion.button>
              <div className="relative isolate z-[1] size-full overflow-hidden rounded-2xl border-2 border-white">
                <iframe
                  src={videoSrc}
                  className="size-full rounded-2xl"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                ></iframe>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
