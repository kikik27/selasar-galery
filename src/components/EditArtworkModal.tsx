import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Sparkles, Loader2 } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Artwork } from '../types';

interface EditArtworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  artwork: Artwork | null;
}

export const EditArtworkModal: React.FC<EditArtworkModalProps> = ({ isOpen, onClose, onSuccess, artwork }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    prompt: '',
    tags: '',
  });

  useEffect(() => {
    if (artwork) {
      setFormData({
        title: artwork.title,
        prompt: artwork.prompt,
        tags: artwork.tags?.join(', ') || '',
      });
    }
  }, [artwork]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artwork) return;
    setLoading(true);

    const tagsArray = formData.tags
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);

    try {
      const artRef = doc(db, 'artworks', artwork.id);
      await updateDoc(artRef, {
        title: formData.title,
        prompt: formData.prompt,
        tags: tagsArray,
      });
      onSuccess();
      onClose();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'artworks');
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
            className="relative w-full max-w-xl bg-dark-bg border border-white/10 rounded-card p-10 overflow-hidden max-h-[90vh] overflow-y-auto shadow-2xl shadow-primary/10"
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
              <h2 className="text-2xl font-bold">Edit Manifest</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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

              <button 
                disabled={loading}
                className="w-full py-4 bg-primary text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating Manifest...
                  </>
                ) : (
                  <>
                    Save Changes
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
