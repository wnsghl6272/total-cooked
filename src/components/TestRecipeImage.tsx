'use client';

import Image from 'next/image';
import { useState } from 'react';

interface TestRecipeImageProps {
  recipeTitle: string;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
}

// Static fallback images for recipes (using local images)
const STATIC_RECIPE_IMAGES = [
  '/food1.jpg',
  '/food2.png',
  '/food3.jpg',
  '/mainfoodimage.jpg'
];

export default function TestRecipeImage({
  recipeTitle,
  className = '',
  fill = false,
  priority = false,
  sizes
}: TestRecipeImageProps) {
  const [imageSrc] = useState(() => {
    // Pick a random static image for instant display
    const randomIndex = Math.floor(Math.random() * STATIC_RECIPE_IMAGES.length);
    return STATIC_RECIPE_IMAGES[randomIndex];
  });

  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    console.log('❌ Image failed to load:', imageSrc);
    if (!hasError) {
      setHasError(true);
      // Try fallback image
      console.log('🔄 Trying fallback image...');
    }
  };

  const handleLoad = () => {
    console.log('✅ Image loaded successfully:', imageSrc);
  };

  return (
    <div className="relative">
      <Image
        src={imageSrc}
        alt={`${recipeTitle} recipe image`}
        fill={fill}
        className={className}
        priority={priority}
        quality={75}
        sizes={sizes}
        onError={handleError}
        onLoad={handleLoad}
      />
      
      {/* Test indicator */}
      <div className="absolute top-2 left-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
        🧪 Test Image
      </div>
      
      {/* Error indicator */}
      {hasError && (
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
          ❌ Error
        </div>
      )}
    </div>
  );
} 