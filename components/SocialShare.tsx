'use client';

import { motion as m } from 'framer-motion';
import { Share2, Twitter, Linkedin, Link2, Facebook, MessageSquare, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useEffect, useState, useMemo } from 'react';
import { SITE_CONFIG } from '@/config/site';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SiWhatsapp, SiX } from 'react-icons/si';

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  isCompact?: boolean;
}

export default function SocialShare({ url, title, description = '', isCompact = false }: SocialShareProps) {
  const [currentUrl, setCurrentUrl] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const baseUrl = window.location.origin;
      const cleanUrl = url.startsWith('/') ? url : `/${url}`;
      setCurrentUrl(`${baseUrl}${cleanUrl}`);
    }
  }, [url]);
  
  const shareData = useMemo(() => ({
    title: title ? `${title} - ${SITE_CONFIG.name}` : SITE_CONFIG.name,
    text: description || '',
    url: currentUrl,
    quote: description || '',
    hashtag: SITE_CONFIG.name.replace(/\s+/g, ''),
  }), [title, description, currentUrl]);

  const shareOnPlatform = (platform: string) => {
    if (!isClient || !currentUrl) return;
    
    const text = [title, description, currentUrl].filter(Boolean).join('\n\n');
    let shareUrl = '';
    
    try {
      switch (platform) {
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
          break;
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}&quote=${encodeURIComponent(description || '')}`;
          break;
        case 'linkedin':
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;
          break;
        case 'whatsapp':
          shareUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
          break;
        default:
          return;
      }
    
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
      setIsOpen(false);
    } catch (err) {
      console.error('Error sharing:', err);
      toast.error('Failed to share. Please try again.');
    }
  };

  const handleNativeShare = async () => {
    if (!isClient) return;
    
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(currentUrl);
        toast.success('Link copied to clipboard!');
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = currentUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast.success('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
      toast.error('Failed to share. Please try again.');
    } finally {
      setIsOpen(false);
    }
  };

  const shareButtons = [
    {
      name: 'Twitter',
      icon: <SiX className="w-6 h-6" />,
      onClick: () => shareOnPlatform('twitter'),
      label: 'Twitter',
      className: 'h-12 w-12 rounded-full hover:bg-zinc-500 dark:hover:bg-zinc-900'
    },
    {
      name: 'Facebook',
      icon: <Facebook className="w-6 h-6" />,
      onClick: () => shareOnPlatform('facebook'),
      label: 'Facebook',
      className: 'h-12 w-12 rounded-full hover:bg-blue-500 dark:hover:bg-blue-700'
    },
    {
      name: 'LinkedIn',
      icon: <Linkedin className="w-6 h-6" />,
      onClick: () => shareOnPlatform('linkedin'),
      label: 'LinkedIn',
      className: 'h-12 w-12 rounded-full hover:bg-blue-500 dark:hover:bg-blue-500'
    },
    {
      name: 'WhatsApp',
      icon: <SiWhatsapp className="w-6 h-6" />,
      onClick: () => shareOnPlatform('whatsapp'),
      label: 'WhatsApp',
      className: 'h-12 w-12 rounded-full hover:bg-green-500 dark:hover:bg-green-700'
    },
    {
      name: 'Copy Link',
      icon: <Link2 className="w-6 h-6" />,
      onClick: async () => {
        await navigator.clipboard.writeText(currentUrl);
        toast.success('Link copied to clipboard!');
        setIsOpen(false);
      },
      label: 'Copy link',
      className: 'h-12 w-12 rounded-full hover:bg-zinc-500 dark:hover:bg-zinc-700'
    }
  ];

  const canShare = isClient && typeof navigator !== 'undefined' && navigator.share;

  if (!isClient) return null;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <m.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 flex items-center gap-2 text-zinc-800 dark:text-zinc-300 hover:text-blue-500 transition-colors relative rounded-full"
            aria-label="Share this post"
            title="Share this post"
          >
            <Share2 className="w-5 h-5" />
            <span>Share</span>
            <span className="sr-only">Share this post</span>
          </m.button>
        </DialogTrigger>
            
            <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-800 p-6 rounded-lg">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-zinc-900 dark:text-white">
                  Share to
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="flex items-center justify-center gap-6">
                  {shareButtons.map((button) => (
                    <Button
                      key={button.name}
                      onClick={button.onClick}
                      variant="ghost"
                      size="icon"
                      className={`h-12 w-12 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 ${button.className}`}
                      aria-label={`Share on ${button.label}`}
                      title={`Share on ${button.label}`}
                    >
                      {button.icon}
                    </Button>
                  ))}
                </div>
                
                {canShare && (
                  <Button
                    onClick={handleNativeShare}
                    className="w-full gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>More share option</span>
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
  );
}