import { useState } from 'react';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useCopyPrompt() {
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const copyPrompt = async (artworkId: string, prompt: string) => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      // Increment copy count
      await updateDoc(doc(db, 'artworks', artworkId), { 
        copyCount: increment(1) 
      });
    } catch (e) {
      console.error('Failed to copy prompt:', e);
    } finally {
      setIsLoading(false);
    }
  };

  return { copied, isLoading, copyPrompt };
}
