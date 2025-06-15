'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { DalleImage as DalleImageType } from '@/utils/dalleApi';

interface OptimizedHeroSectionProps {
  heroImage?: DalleImageType | null;
}

// Static fallback images for instant loading
const STATIC_HERO_IMAGES = [
  '/food1.jpg',
  '/food2.png', 
  '/food3.jpg',
  '/mainfoodimage.jpg',
  '/food1.jpg' // Duplicate to have 5 images
];

export default function OptimizedHeroSection({ heroImage }: OptimizedHeroSectionProps) {
  const [currentImage, setCurrentImage] = useState(() => {
    // Pick a random static image for instant display
    const randomIndex = Math.floor(Math.random() * STATIC_HERO_IMAGES.length);
    return STATIC_HERO_IMAGES[randomIndex];
  });
  const [isAIImageLoaded, setIsAIImageLoaded] = useState(false);

  useEffect(() => {
    // Load AI image from hero pool in background
    const loadAIImage = async () => {
      try {
        const response = await fetch('/api/hero-pool');
        const data = await response.json();
        
        if (data.success && data.pool && data.pool.imageUrls && data.pool.imageUrls.length > 0) {
          // Pick a random image from the pool
          const randomIndex = Math.floor(Math.random() * data.pool.imageUrls.length);
          const aiImageUrl = data.pool.imageUrls[randomIndex];
          
          // Preload the AI image
          const img = new window.Image();
          img.onload = () => {
            setCurrentImage(aiImageUrl);
            setIsAIImageLoaded(true);
          };
          img.onerror = () => {
            console.log('AI image failed to load, keeping static image');
          };
          img.src = aiImageUrl;
        }
      } catch (error) {
        console.log('Failed to load AI image, keeping static image:', error);
      }
    };

    // Load AI image after component mounts (non-blocking)
    loadAIImage();
  }, []);

  // Also handle prop-based hero image if provided
  useEffect(() => {
    if (heroImage?.url) {
      const img = new window.Image();
      img.onload = () => {
        setCurrentImage(heroImage.url);
        setIsAIImageLoaded(true);
      };
      img.onerror = () => {
        console.log('Prop AI image failed to load, keeping current image');
      };
      img.src = heroImage.url;
    }
  }, [heroImage]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={currentImage}
          alt="Delicious food background"
          fill
          className="object-cover transition-opacity duration-1000"
          priority
          quality={90}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
          Transform Your
          <span className="block text-grapefruit drop-shadow-lg">Ingredients</span>
          into Magic
        </h1>
        
        <p className="text-lg sm:text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
          Upload a photo of your ingredients and let our AI chef create personalized, delicious recipes just for you.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            href="/cook" 
            className="bg-grapefruit hover:bg-grapefruit/90 text-white font-semibold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Start Cooking 🍳
          </Link>
          <a 
            href="#how-it-works"
            className="border-2 border-white text-white hover:bg-white hover:text-black font-semibold py-4 px-8 rounded-full text-lg transition-all duration-300"
          >
            How It Works
          </a>
        </div>
      </div>

      {/* Attribution */}
      <div className="absolute bottom-4 right-4 text-white/70 text-sm z-10">
        {isAIImageLoaded ? 'AI Generated Image' : 'Stock Image'}
      </div>
    </section>
  );
} 