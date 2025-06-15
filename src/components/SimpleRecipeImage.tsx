'use client';

import Image from 'next/image';
import { useState } from 'react';

interface SimpleRecipeImageProps {
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
  '/mainfoodimage.jpg',
  '/food1.jpg' // Duplicate to have 5 images
];

export default function SimpleRecipeImage({
  recipeTitle,
  className = '',
  fill = false,
  priority = false,
  sizes
}: SimpleRecipeImageProps) {
  const [imageSrc] = useState(() => {
    // Pick a random static image for instant display
    const randomIndex = Math.floor(Math.random() * STATIC_RECIPE_IMAGES.length);
    return STATIC_RECIPE_IMAGES[randomIndex];
  });

  const handleError = () => {
    console.log('Image failed to load');
  };

  return (
    <Image
      src={imageSrc}
      alt={`${recipeTitle} recipe image`}
      fill={fill}
      className={className}
      priority={priority}
      quality={75}
      sizes={sizes}
      onError={handleError}
      onLoad={() => {
        console.log('Recipe image loaded successfully');
      }}
    />
  );
} 