'use client';

import Link from 'next/link';
import DalleImage from './DalleImage';
import { DalleImage as DalleImageType } from '@/utils/dalleApi';

interface HeroSectionProps {
  heroImage: DalleImageType | null;
}

export default function HeroSection({ heroImage }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <DalleImage
          src={heroImage?.url || "/mainfoodimage.jpg"}
          alt="Delicious food background"
          fill
          className="object-cover"
          priority
          quality={90}
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

      {/* AI Generated Attribution */}
      {heroImage && (
        <div className="absolute bottom-4 right-4 text-white/70 text-sm z-10">
          AI Generated Image
        </div>
      )}
    </section>
  );
} 