import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Image as ImageIcon, Loader2, Save, Camera } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import imageCompression from 'browser-image-compression';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile } from '../types';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedProfile: UserProfile) => void;
  profile: UserProfile | null;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, onSuccess, profile }) => {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        bio: profile.bio || '',
      });
      setImagePreview(profile.avatarUrl || null);
    }
  }, [profile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadToImgBB = async (file: File): Promise<string> => {
    const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
    
    if (!apiKey) {
      throw new Error('ImgBB API key is missing. Please add VITE_IMGBB_API_KEY to your .env file.');
    }

    // Compress avatar image - smaller since it's just a profile pic
    const options = {
      maxSizeMB: 0.5,           // Max 500KB for avatars
      maxWidthOrHeight: 512,    // 512px is more than enough for profile pics
      useWebWorker: true,
      initialQuality: 0.8       // 80% quality (avatars don't need max quality)
    };
    
    let fileToUpload = file;
    try {
      if (file.size > 0.5 * 1024 * 1024) {
        fileToUpload = await imageCompression(file, options);
      }
    } catch (error) {
      console.warn("Image compression failed, uploading original:", error);
    }

    const formData = new FormData();
    formData.append('image', fileToUpload);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image to ImgBB');
    }

    const data = await response.json();
    return data.data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);

    try {
      let avatarUrl = profile.avatarUrl;

      // 1. Upload new avatar to ImgBB if selected
      if (imageFile) {
        avatarUrl = await uploadToImgBB(imageFile);
      }

      // 2. Update Firestore profile
      const updates: any = {
        username: formData.username,
        bio: formData.bio,
        avatarUrl: avatarUrl,
      };

      await updateDoc(doc(db, 'users', profile.uid), updates);
      
      const updatedProfile = {
        ...profile,
        ...updates,
      };

      onSuccess(updatedProfile);
      onClose();
    } catch (error) {
      console.error('Update error:', error);
      alert(error instanceof Error ? error.message : 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
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
            className="relative w-full max-w-lg bg-dark-bg border border-white/10 rounded-card p-10 overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 right-0 p-6">
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Refine Identity</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="flex flex-col items-center">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group cursor-pointer"
                >
                  <div className="w-32 h-32 rounded-full border-2 border-primary/20 overflow-hidden bg-white/5 flex items-center justify-center">
                    {imagePreview ? (
                      <img src={imagePreview} className="w-full h-full object-cover" alt="Avatar" />
                    ) : (
                      <User className="w-12 h-12 text-white/20" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden" 
                    accept="image/*"
                  />
                </div>
                <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Synchronize Visual Link</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40">Pseudonym / Alias</label>
                  <input 
                    required
                    type="text" 
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-sm outline-none focus:border-primary/50"
                    placeholder="Enter your creative moniker"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40">Artist Manifesto (Bio)</label>
                  <textarea 
                    rows={4}
                    value={formData.bio}
                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-sm outline-none focus:border-primary/50 resize-none"
                    placeholder="Briefly describe your process or vision..."
                  />
                </div>
              </div>

              <button 
                disabled={loading}
                className="w-full py-4 bg-primary text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Syncing Patterns...
                  </>
                ) : (
                  <>
                    Update Identity
                    <Save className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
