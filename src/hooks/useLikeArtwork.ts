import { useState, useEffect } from 'react';
import { doc, updateDoc, increment, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../components/AuthContext';

export function useLikeArtwork(artworkId: string) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user || !artworkId) return;
    
    const likeDoc = doc(db, 'artworks', artworkId, 'likes', user.uid);
    return onSnapshot(likeDoc, (snap) => setIsLiked(snap.exists()));
  }, [user, artworkId]);

  const toggleLike = async () => {
    if (!user || !artworkId || isLoading) return;
    
    setIsLoading(true);
    const artworkRef = doc(db, 'artworks', artworkId);
    const likeRef = doc(db, 'artworks', artworkId, 'likes', user.uid);

    try {
      if (isLiked) {
        await deleteDoc(likeRef);
        await updateDoc(artworkRef, { likesCount: increment(-1) });
      } else {
        await setDoc(likeRef, { userId: user.uid, createdAt: new Date() });
        await updateDoc(artworkRef, { likesCount: increment(1) });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'artworks');
    } finally {
      setIsLoading(false);
    }
  };

  return { isLiked, isLoading, toggleLike };
}
