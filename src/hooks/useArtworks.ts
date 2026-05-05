import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, QueryConstraint } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Artwork } from '../types';

interface UseArtworksOptions {
  limitCount?: number;
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
  filterFn?: (artwork: Artwork) => boolean;
}

export function useArtworks(options: UseArtworksOptions = {}) {
  const {
    limitCount = 20,
    orderByField = 'createdAt',
    orderDirection = 'desc',
    filterFn
  } = options;

  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const constraints: QueryConstraint[] = [
      orderBy(orderByField, orderDirection),
      limit(limitCount)
    ];

    const q = query(collection(db, 'artworks'), ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Artwork));

        if (filterFn) {
          data = data.filter(filterFn);
        }

        setArtworks(data);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching artworks:', err);
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [limitCount, orderByField, orderDirection, filterFn]);

  return { artworks, loading, error };
}
