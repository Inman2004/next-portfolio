'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Twitter, Linkedin, Link2, Facebook } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useEffect, useState } from 'react';

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  isCompact?: boolean;
}

export default function SocialShare({ url, title, description = '', isCompact = false }: SocialShareProps) {
  const [isClient, setIsClient] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [showShareOptions, setShowShareOptions] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setCurrentUrl(window.location.origin + (url.startsWith('/') ? url : `/${url}`));
  }, [url]);

  const shareData = {
    title,
    text: description,
    url: currentUrl,
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      setShowShareOptions(!showShareOptions);
    }
  };

  const shareOnTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareData.url)}`,
      '_blank',
      'noopener,noreferrer'
    );
    setShowShareOptions(false);
  };

  const shareOnLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}`,
      '_blank',
      'noopener,noreferrer'
    );
    setShowShareOptions(false);
  };

  const shareOnFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`,
      '_blank',
      'noopener,noreferrer'
    );
    setShowShareOptions(false);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareData.url);
      toast.success('Link copied to clipboard!');
      setShowShareOptions(false);
    } catch (err) {
      toast.error('Failed to copy link');
      console.error('Failed to copy:', err);
    }
  };

  const shareButtons = [
    { 
      icon: <Twitter className="w-4 h-4" />, 
      label: 'Share on Twitter', 
      onClick: shareOnTwitter,
      className: 'hover:bg-blue-500/20 hover:text-blue-400'
    },
    { 
      icon: <Linkedin className="w-4 h-4" />, 
      label: 'Share on LinkedIn', 
      onClick: shareOnLinkedIn,
      className: 'hover:bg-blue-600/20 hover:text-blue-500'
    },
    { 
      icon: <Facebook className="w-4 h-4" />, 
      label: 'Share on Facebook', 
      onClick: shareOnFacebook,
      className: 'hover:bg-blue-700/20 hover:text-blue-600'
    },
    { 
      icon: <Link2 className="w-4 h-4" />, 
      label: 'Copy link', 
      onClick: copyLink,
      className: 'hover:bg-gray-600/20 hover:text-gray-400'
    },
  ];

  // Check if Web Share API is available
  const canShare = isClient && navigator.share;

  if (!isClient) return null;

  if (isCompact) {
    return (
      <div className="relative">
        <motion.button
          onClick={handleShare}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 text-gray-300 dark:text-gray-800 hover:text-white dark:hover:text-gray-900 transition-colors relative bg-gray-800/50 dark:bg-gray-400/50 rounded-full"
          aria-label="Share this post"
          title="Share this post"
        >
          <Share2 className="w-5 h-5" />
        </motion.button>
        
        <AnimatePresence>
          {showShareOptions && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => setShowShareOptions(false)}
              />
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 z-50 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-300 px-2 py-2 mb-2 border-b border-gray-700">Share this post</p>
                  <div className="grid grid-cols-4 gap-2 p-2">
                    {shareButtons.map((button, index) => (
                      <motion.button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          button.onClick();
                        }}
                        className={`p-2.5 rounded-lg flex items-center justify-center ${button.className} bg-gray-700/50 hover:bg-gray-700/80 transition-colors`}
                        aria-label={button.label}
                        title={button.label}
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {button.icon}
                      </motion.button>
                    ))}
                  </div>
                  <div className="mt-3 p-2 bg-gray-700/30 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">Share link</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={currentUrl}
                        className="flex-1 text-xs bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onClick={(e) => e.currentTarget.select()}
                      />
                      <button
                        onClick={copyLink}
                        className="p-2 text-gray-300 hover:text-white hover:bg-gray-600/50 rounded-lg transition-colors"
                        title="Copy link"
                      >
                        <Link2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="mt-8 pt-6 border-t border-gray-700/50">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-gray-300">
          <Share2 className="w-5 h-5 text-blue-400" />
          <span className="font-medium">Share this post</span>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {canShare && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg hover:shadow-blue-500/30"
              aria-label="Share"
            >
              <Share2 className="w-4 h-4" />
              Share
            </motion.button>
          )}
          
          <div className="flex items-center gap-3 bg-gray-800/50 p-1.5 rounded-full">
            {shareButtons.map((button, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.15, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={button.onClick}
                className={`p-2 rounded-full text-gray-300 hover:text-white transition-all ${button.className} hover:shadow-lg`}
                aria-label={button.label}
                title={button.label}
              >
                {button.icon}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
