import React, { useState } from 'react';
import { useImageCache } from '../hooks/useImageCache';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  blurDataURL?: string;
  priority?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  blurDataURL,
  priority = false,
  className = '',
  ...props
}) => {
  const { cachedUrl, isLoading } = useImageCache(src);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Blur placeholder */}
      {!imageLoaded && (
        <div 
          className="absolute inset-0 bg-white/5 animate-pulse"
          style={{
            backgroundImage: blurDataURL ? `url(${blurDataURL})` : undefined,
            backgroundSize: 'cover',
            filter: 'blur(20px)',
            transform: 'scale(1.1)'
          }}
        />
      )}
      
      {/* Actual image */}
      <img
        {...props}
        src={cachedUrl || src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={() => setImageLoaded(true)}
        className={`transition-opacity duration-500 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
