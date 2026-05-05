import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Send, Sparkles, Image as ImageIcon, Loader2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from './AuthContext';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    prompt: '',
    tags: '',
  });

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

    const formData = new FormData();
    formData.append('image', file);

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
    if (!user || !imageFile) return;
    setLoading(true);

    const tagsArray = formData.tags
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);

    try {
      // 1. Upload Image to ImgBB
      setUploadProgress(30);
      const imageUrl = await uploadToImgBB(imageFile);
      setUploadProgress(70);

      // 2. Add Document to Firestore
      await addDoc(collection(db, 'artworks'), {
        title: formData.title,
        prompt: formData.prompt,
        imageUrl: imageUrl,
        tags: tagsArray,
        artistId: user.uid,
        artistName: user.displayName || 'Anon Artist',
        likesCount: 0,
        copyCount: 0,
        createdAt: serverTimestamp(),
      });
      
      setUploadProgress(100);
      onSuccess();
      onClose();
      
      // Reset form
      setFormData({ title: '', prompt: '', tags: '' });
      setImageFile(null);
      setImagePreview(null);
      setUploadProgress(0);
    } catch (error) {
      console.error('Upload error:', error);
      alert(error instanceof Error ? error.message : 'Failed to upload artwork. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
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
            className="relative w-full max-w-xl bg-dark-bg border border-white/10 rounded-card p-10 overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            <div className="absolute top-0 right-0 p-6">
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Publish Masterpiece</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40 leading-relaxed">Artwork Vision</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-video bg-white/5 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer overflow-hidden p-4 group"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden" 
                    accept="image/*"
                  />
                  {imagePreview ? (
                    <img src={imagePreview} className="w-full h-full object-contain rounded-lg" alt="Preview" />
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6 text-white/40" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold">Transmit Visual Multiworld</p>
                        <p className="text-[10px] text-white/20 uppercase tracking-widest mt-1">PNG, JPG, WEBP (MAX 5MB)</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40 leading-relaxed">Artwork Title</label>
                <input 
                  required
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Celestial Voyager" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-sm outline-none focus:border-primary/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40 leading-relaxed">Tags (Optional)</label>
                <input 
                  type="text" 
                  value={formData.tags}
                  onChange={e => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g. abstract, cyberpunk, oil painting" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-sm outline-none focus:border-primary/50"
                />
                <p className="text-[10px] text-white/20 italic">Separate with commas</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40 leading-relaxed">Prompt Details</label>
                <textarea 
                  required
                  rows={4}
                  value={formData.prompt}
                  onChange={e => setFormData({ ...formData, prompt: e.target.value })}
                  placeholder="Describe your prompt logic..." 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-sm outline-none focus:border-primary/50 resize-none"
                />
              </div>

              {loading && uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-white/40">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      className="h-full bg-primary"
                    />
                  </div>
                </div>
              )}

              <button 
                disabled={loading || !imageFile}
                className="w-full py-4 bg-primary text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Bending Reality...
                  </>
                ) : (
                  <>
                    Publish to Gallery
                    <Send className="w-4 h-4" />
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
