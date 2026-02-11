
import React, { useState } from 'react';
import { generateCardDataUri } from '../utils/helpers';

interface ImageLoaderProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackText?: string;
  skeletonClassName?: string;
}

export const ImageLoader: React.FC<ImageLoaderProps> = ({ 
  src, 
  alt, 
  className, 
  fallbackText = 'IMAGE', 
  skeletonClassName = 'bg-gray-200 animate-pulse',
  ...props 
}) => {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  const handleLoad = () => {
    setStatus('loaded');
  };

  const handleError = () => {
    setStatus('error');
  };

  // Add a cache buster parameter to src if it's an API call or mutable resource
  // For static assets, we usually don't need it, but the user's legacy code used ?v=1
  // We'll keep the src clean here and let the parent handle cache busting if needed.
  
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Skeleton / Loading State */}
      {status === 'loading' && (
        <div className={`absolute inset-0 z-10 ${skeletonClassName}`} />
      )}

      {/* Actual Image */}
      {status !== 'error' && (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-contain transition-opacity duration-500 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      )}

      {/* Fallback */}
      {status === 'error' && (
        <img 
          src={generateCardDataUri(fallbackText)}
          alt="Fallback"
          className="w-full h-full object-contain p-2 opacity-80"
        />
      )}
    </div>
  );
};
