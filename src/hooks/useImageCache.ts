import { useState, useEffect } from 'react';

interface ImageCacheEntry {
  url: string;
  dataUrl: string;
  timestamp: number;
}

const CACHE_NAME = 'selasar-image-cache';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

// Convert Blob to Base64 Data URL
const blobToDataURL = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

class ImageCacheManager {
  private memoryCache: Map<string, string> = new Map();
  
  async get(url: string): Promise<string | null> {
    if (this.memoryCache.has(url)) {
      return this.memoryCache.get(url)!;
    }

    try {
      const db = await this.openDB();
      const tx = db.transaction('images', 'readonly');
      const store = tx.objectStore('images');
      const entry = await this.promisifyRequest<ImageCacheEntry>(store.get(url));
      
      if (entry) {
        if (Date.now() - entry.timestamp < CACHE_EXPIRY) {
          this.memoryCache.set(url, entry.dataUrl);
          return entry.dataUrl;
        } else {
          await this.remove(url);
        }
      }
    } catch (e) {
      console.warn('IndexedDB cache read failed:', e);
    }
    return null;
  }

  async set(url: string, dataUrl: string): Promise<void> {
    this.memoryCache.set(url, dataUrl);

    try {
      const db = await this.openDB();
      const tx = db.transaction('images', 'readwrite');
      const store = tx.objectStore('images');
      
      const entry: ImageCacheEntry = {
        url,
        dataUrl,
        timestamp: Date.now()
      };
      
      await this.promisifyRequest(store.put(entry));
    } catch (e) {
      console.warn('IndexedDB cache write failed:', e);
    }
  }

  async remove(url: string): Promise<void> {
    this.memoryCache.delete(url);
    
    try {
      const db = await this.openDB();
      const tx = db.transaction('images', 'readwrite');
      const store = tx.objectStore('images');
      await this.promisifyRequest(store.delete(url));
    } catch (e) {
      console.warn('IndexedDB cache delete failed:', e);
    }
  }

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(CACHE_NAME, 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('images')) {
          db.createObjectStore('images', { keyPath: 'url' });
        }
      };
    });
  }

  private promisifyRequest<T>(request: IDBRequest): Promise<T> {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

const cacheManager = new ImageCacheManager();

export function useImageCache(url: string | undefined) {
  const [cachedUrl, setCachedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!url) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function loadImage() {
      try {
        setIsLoading(true);
        setError(null);

        // Check cache first
        const cached = await cacheManager.get(url);
        if (cached && isMounted) {
          setCachedUrl(cached);
          setIsLoading(false);
          return;
        }

        // Fetch image if not cached
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch image');
        
        const blob = await response.blob();
        
        // Convert Blob to Base64 to avoid object URL lifetime issues (which causes flickering/cancels)
        const dataUrl = await blobToDataURL(blob);

        if (isMounted) {
          setCachedUrl(dataUrl);
          setIsLoading(false);
          
          // Cache in memory and IndexedDB (async, doesn't block UI)
          cacheManager.set(url, dataUrl);
        }
      } catch (e) {
        if (isMounted) {
          console.warn(`Failed to cache image ${url}, falling back to direct URL:`, e);
          setError(e instanceof Error ? e : new Error('Unknown error'));
          setIsLoading(false);
          // Fallback to original URL
          setCachedUrl(url);
        }
      }
    }

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [url]);

  return { cachedUrl: cachedUrl || url, isLoading, error };
}

export { cacheManager };