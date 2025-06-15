'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

interface OptimizedRecipeImageProps {
  recipeTitle: string;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  onError?: () => void;
}

// Static fallback images for recipes (using local images)
const STATIC_RECIPE_IMAGES = [
  '/food1.jpg',
  '/food2.png',
  '/food3.jpg',
  '/mainfoodimage.jpg',
  '/food1.jpg' // Duplicate to have 5 images
];

export default function OptimizedRecipeImage({
  recipeTitle,
  className = '',
  fill = false,
  priority = false,
  sizes,
  onError
}: OptimizedRecipeImageProps) {
  const [imageSrc, setImageSrc] = useState(() => {
    // Pick a random static image for instant display
    const randomIndex = Math.floor(Math.random() * STATIC_RECIPE_IMAGES.length);
    return STATIC_RECIPE_IMAGES[randomIndex];
  });
  const [hasError, setHasError] = useState(false);
  const [isAIImageLoaded, setIsAIImageLoaded] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  useEffect(() => {
    // Load AI image in background
    const loadAIImage = async () => {
      try {
        setIsLoadingAI(true);
        console.log(`🎨 Starting AI image load for: "${recipeTitle}"`);
        console.log(`📡 Making request to: /api/dalle?query=${encodeURIComponent(recipeTitle)}&count=1`);
        
        const response = await fetch(`/api/dalle?query=${encodeURIComponent(recipeTitle)}&count=1`);
        console.log(`📥 Response status: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
          console.log(`❌ API response not ok: ${response.status} ${response.statusText}`);
          const errorText = await response.text();
          console.log(`❌ Error response:`, errorText);
          setIsLoadingAI(false);
          return;
        }
        
        const data = await response.json();
        console.log('🔍 Full API Response:', data);
        
        if (data && Array.isArray(data) && data.length > 0 && data[0].urls?.regular) {
          const aiImageUrl = data[0].urls.regular;
          console.log(`✅ AI image URL received: ${aiImageUrl.substring(0, 50)}...`);
          
          // Preload the AI image
          const img = new window.Image();
          img.onload = () => {
            console.log(`🖼️ AI image loaded successfully for: ${recipeTitle}`);
            setImageSrc(aiImageUrl);
            setIsAIImageLoaded(true);
            setIsLoadingAI(false);
          };
          img.onerror = () => {
            console.log(`❌ AI image failed to load for: ${recipeTitle}, keeping static image`);
            setIsLoadingAI(false);
          };
          img.src = aiImageUrl;
        } else {
          console.log(`⚠️ No AI image data received for: ${recipeTitle}`, data);
          setIsLoadingAI(false);
        }
      } catch (error) {
        console.error(`❌ Failed to load AI image for: "${recipeTitle}"`, error);
        console.error(`❌ Error details:`, error instanceof Error ? error.message : String(error));
        setIsLoadingAI(false);
      }
    };

    // Load AI image after a short delay to not block initial render
    const timer = setTimeout(loadAIImage, 500);
    return () => clearTimeout(timer);
  }, [recipeTitle]);

  const handleError = () => {
    if (!hasError) {
      console.log('Image failed to load, using fallback');
      const randomIndex = Math.floor(Math.random() * STATIC_RECIPE_IMAGES.length);
      setImageSrc(STATIC_RECIPE_IMAGES[randomIndex]);
      setHasError(true);
      setIsLoadingAI(false);
      if (onError) onError();
    }
  };

  return (
    <div className="relative w-full h-full">
      {fill ? (
        <Image
          src={imageSrc}
          alt={`${recipeTitle} recipe image`}
          fill
          className={className}
          priority={priority}
          quality={75}
          sizes={sizes}
          onError={handleError}
          onLoad={() => {
            console.log(`Recipe image loaded: ${isAIImageLoaded ? 'AI' : 'Static'} - ${imageSrc.substring(0, 50)}...`);
          }}
          unoptimized={imageSrc.includes('blob.core.windows.net')}
        />
      ) : (
        <Image
          src={imageSrc}
          alt={`${recipeTitle} recipe image`}
          width={800}
          height={600}
          className={className}
          priority={priority}
          quality={75}
          onError={handleError}
          onLoad={() => {
            console.log(`Recipe image loaded: ${isAIImageLoaded ? 'AI' : 'Static'} - ${imageSrc.substring(0, 50)}...`);
          }}
          unoptimized={imageSrc.includes('blob.core.windows.net')}
        />
      )}
      
      {/* Loading indicator - only show when actively loading AI image */}
      {isLoadingAI && !isAIImageLoaded && (
        <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
          <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Loading AI...</span>
        </div>
      )}
      
      {/* AI Generated badge */}
      {isAIImageLoaded && (
        <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
          ✨ AI Generated
        </div>
      )}
      
      {/* Static image indicator */}
      {!isAIImageLoaded && !isLoadingAI && (
        <div className="absolute top-2 left-2 bg-gray-500 text-white text-xs px-2 py-1 rounded-full">
          📷 Static
        </div>
      )}
    </div>
  );
} 