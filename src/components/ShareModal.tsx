import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Link as LinkIcon, Twitter, Facebook, ExternalLink, Check, Share2 } from 'lucide-react';
import { Artwork } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  artwork: Artwork | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, artwork }) => {
  const [copied, setCopied] = useState(false);

  if (!artwork) return null;

  const shareUrl = `${window.location.origin}/artwork/${artwork.id}`;
  
  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const platforms = [
    {
      name: 'X (Twitter)',
      icon: <Twitter className="w-5 h-5" />,
      url: `https://twitter.com/intent/tweet?text=Lihat mahakarya ini di Selasar: ${artwork.title}&url=${encodeURIComponent(shareUrl)}`,
      color: 'bg-black'
    },
    {
      name: 'Facebook',
      icon: <Facebook className="w-5 h-5" />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: 'bg-[#1877F2]'
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-dark-bg border border-white/10 rounded-[2.5rem] p-10 overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 right-0 p-6">
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
                <Share2 className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Share Manifest</h2>
              <p className="text-white/40 text-sm italic">Spread the vision across the digital frontier.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Direct Link</label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/60 truncate italic font-mono">
                    {shareUrl}
                  </div>
                  <button 
                    onClick={handleCopy}
                    className="px-6 bg-primary text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all whitespace-nowrap min-w-[100px]"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Social Transmissions</label>
                <div className="grid grid-cols-2 gap-4">
                  {platforms.map(platform => (
                    <a 
                      key={platform.name}
                      href={platform.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex flex-col items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-primary/30 transition-all group`}
                    >
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        {platform.icon}
                      </div>
                      <span className="text-xs font-bold text-white/60">{platform.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
