'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Head from 'next/head';
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface AIRecipe {
  title: string;
  description: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  ingredients: {
    name: string;
    amount: string;
    unit: string;
  }[];
  instructions: {
    step: number;
    text: string;
  }[];
  nutritionFacts: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  tips: string[];
  image: string;
}

export default function AIRecipeDetailPage() {
  const params = useParams();
  const [recipe, setRecipe] = useState<AIRecipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions' | 'tips'>('ingredients');
  const [heroImage, setHeroImage] = useState('');
  const [galleryImages, setGalleryImages] = useState(['', '']);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        console.log('Fetching recipe from cache for slug:', params.slug);
        
        // 1. 먼저 Supabase 캐시에서 레시피 데이터 찾기
        const decodedSlug = decodeURIComponent(params.slug as string);
        console.log('🔍 Looking for cache_key:', decodedSlug);
        
        const { data: cachedRecipe, error: cacheError } = await supabase
          .from('recipe_cache')
          .select('*')
          .eq('cache_key', decodedSlug)
          .single();

        if (!cacheError && cachedRecipe) {
          console.log('✅ Found cached recipe:', decodedSlug);
          const recipeData = cachedRecipe.recipe_data;
          
          // 레시피 제목 추출 (cache_key에서)
          const recipeTitle = decodedSlug
            .replace(/^recipe_/, '')
            .replace(/-$/, '') // Remove trailing dash
            .replace(/- $/, '') // Remove trailing dash with space
            .trim() // Remove any extra whitespace
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

          const formattedRecipe = {
            title: recipeTitle,
            description: recipeData.description || 'AI-generated recipe',
            prepTime: recipeData.prepTime || '30 mins',
            cookTime: recipeData.cookTime || '30 mins',
            servings: recipeData.servings || 4,
            ingredients: recipeData.ingredients || [],
            instructions: recipeData.instructions || [],
            nutritionFacts: recipeData.nutritionFacts || {
              calories: 0,
              protein: 0,
              carbs: 0,
              fat: 0
            },
            tips: recipeData.tips || [],
            image: ''
          };

          setRecipe(formattedRecipe);
          
          // 2. DALL-E 캐시에서 이미지 찾기
          loadCachedImages(recipeTitle);
        } else {
          console.log('❌ No cached recipe found, creating new one');
          // 캐시에 없으면 새로 생성 (기존 로직)
          const response = await fetch(`/api/ai-recipes/${params.slug}`);
          const data = await response.json();
          console.log('New recipe data:', data);
          setRecipe(data);
          
          // 새 레시피의 이미지 생성
          loadDalleImages(data.title);
        }
      } catch (error) {
        console.error('Error fetching recipe:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchRecipe();
    }
  }, [params.slug]);

  const loadCachedImages = useCallback(async (recipeTitle: string) => {
    try {
      console.log(`🖼️ Loading cached images for: ${recipeTitle}`);
      
      // 1. Main recipe image 로드
      const { data: mainImage, error: mainError } = await supabase
        .from('dalle_cache')
        .select('*')
        .eq('recipe_title', recipeTitle)
        .single();

      let mainImageUrl = '';
      if (!mainError && mainImage) {
        console.log('✅ Found cached main image');
        try {
          const imageData = typeof mainImage.image_data === 'string'
            ? JSON.parse(mainImage.image_data)
            : mainImage.image_data;
          
          if (imageData?.url) {
            mainImageUrl = imageData.url;
            setHeroImage(imageData.url);
            console.log('✅ Main image loaded');
          }
        } catch (parseError) {
          console.error('Error parsing main image data:', parseError);
        }
      } else {
        console.log('❌ No cached main image found');
      }

      // 2. Variation image 로드 (recipeTitle + " 2")
      const variationTitle = `${recipeTitle} 2`;
      const { data: variationImage, error: variationError } = await supabase
        .from('dalle_cache')
        .select('*')
        .eq('recipe_title', variationTitle)
        .single();

      let variationImageUrl = '';
      if (!variationError && variationImage) {
        console.log('✅ Found cached variation image');
        try {
          const imageData = typeof variationImage.image_data === 'string'
            ? JSON.parse(variationImage.image_data)
            : variationImage.image_data;
          
          if (imageData?.url) {
            variationImageUrl = imageData.url;
            console.log('✅ Variation image loaded');
          }
        } catch (parseError) {
          console.error('Error parsing variation image data:', parseError);
        }
      } else {
        console.log('❌ No cached variation image found');
      }

      // 3. Gallery images 설정
      setGalleryImages([
        mainImageUrl || '', 
        variationImageUrl || ''
      ]);

      // 4. 캐시된 이미지가 없으면 새로 생성
      if (!mainImageUrl && !variationImageUrl) {
        console.log('❌ No cached images found, generating new ones');
        loadDalleImages(recipeTitle);
      } else {
        console.log(`✅ Loaded cached images: Main(${!!mainImageUrl}) Variation(${!!variationImageUrl})`);
      }
    } catch (error) {
      console.error('Error loading cached images:', error);
      loadDalleImages(recipeTitle);
    }
  }, []);

  const loadDalleImages = async (recipeTitle: string) => {
    try {
      console.log('🎨 Starting DALL-E image generation...');
      
      // 첫 번째 이미지 (메인 레시피 이미지)
      console.log(`🎨 Loading main DALL-E image for: ${recipeTitle}`);
      const mainResponse = await fetch(`/api/dalle?query=${encodeURIComponent(recipeTitle)}&count=1`);
      
             if (mainResponse.ok) {
         const mainImages = await mainResponse.json();
         if (mainImages && Array.isArray(mainImages) && mainImages.length > 0 && mainImages[0]?.urls?.regular) {
           const imageUrl = mainImages[0].urls.regular;
           setHeroImage(imageUrl);
           setGalleryImages(prev => [imageUrl, prev[1]]);
           console.log('✅ Main image updated');
           
           // 2초 후 variation 이미지 로드 (간단한 프롬프트로 캐싱 보장)
           setTimeout(async () => {
             try {
               console.log(`🎨 Loading variation image...`);
               const variationQuery = `${recipeTitle} 2`;
               const variationResponse = await fetch(`/api/dalle?query=${encodeURIComponent(variationQuery)}&count=1`);
               
               if (variationResponse.ok) {
                 const variationImages = await variationResponse.json();
                 if (variationImages && Array.isArray(variationImages) && variationImages.length > 0 && variationImages[0]?.urls?.regular) {
                   setGalleryImages(prev => [prev[0], variationImages[0].urls.regular]);
                   console.log('✅ Variation image updated');
                 }
               } else {
                 console.log(`❌ Variation API failed: ${variationResponse.status}`);
               }
             } catch (error) {
               console.error('❌ Error loading variation:', error);
             } finally {
               console.log('✅ Variation image generation completed');
             }
           }, 2000);
         }
       } else {
         console.log(`❌ Main DALL-E API failed: ${mainResponse.status}`);
       }
      
    } catch (error) {
      console.error('❌ Error loading main DALL-E image:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        {/* Hero Section Skeleton */}
        <div className="relative w-full bg-gray-300 animate-pulse" style={{ height: '60vh' }}>
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="h-16 bg-gray-400 rounded-lg mb-6 w-3/4"></div>
              <div className="h-6 bg-gray-400 rounded-lg mb-4 w-2/3"></div>
              <div className="flex gap-6">
                <div className="h-5 bg-gray-400 rounded w-32"></div>
                <div className="h-5 bg-gray-400 rounded w-28"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Recipe Images Gallery Skeleton */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="h-8 bg-gray-300 rounded-lg mb-6 w-48 animate-pulse"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="relative w-full pb-[56.25%] rounded-lg overflow-hidden bg-gray-300 animate-pulse"></div>
              <div className="relative w-full pb-[56.25%] rounded-lg overflow-hidden bg-gray-300 animate-pulse"></div>
            </div>
          </div>

          {/* Tabs Skeleton */}
          <div className="flex border-b border-gray-200 mb-8">
            <div className="h-10 bg-gray-300 rounded-t-lg w-24 mr-4 animate-pulse"></div>
            <div className="h-10 bg-gray-300 rounded-t-lg w-28 mr-4 animate-pulse"></div>
            <div className="h-10 bg-gray-300 rounded-t-lg w-20 animate-pulse"></div>
          </div>

          {/* Content Area Skeleton */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="h-7 bg-gray-300 rounded-lg mb-4 w-64 animate-pulse"></div>
                <div className="space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center">
                      <div className="h-4 bg-gray-300 rounded w-20 mr-4 animate-pulse"></div>
                      <div className="h-4 bg-gray-300 rounded flex-1 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Skeleton */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="h-6 bg-gray-300 rounded-lg mb-4 w-24 animate-pulse"></div>
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i}>
                      <div className="h-4 bg-gray-300 rounded w-32 mb-2 animate-pulse"></div>
                      <div className="h-6 bg-gray-300 rounded w-20 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-24 text-center">
          <h1 className="text-2xl text-gray-600">Recipe not found</h1>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{recipe.title} - AI Chef Recipe</title>
        <meta name="description" content={recipe.description} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        {/* Hero Section with Main Recipe Image */}
        <div className="relative w-full bg-gray-900" style={{ height: '60vh' }}>
          {heroImage ? (
            <Image
              src={heroImage}
              alt={recipe.title}
              fill
              className="object-cover"
              priority
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-lg">Generating AI recipe image...</p>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-sm">{recipe.title}</h1>
              <p className="text-lg text-white/90 max-w-2xl leading-relaxed mb-8">{recipe.description}</p>
              <div className="flex items-center gap-6 text-white/90">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{recipe.prepTime} prep · {recipe.cookTime} cook</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Serves {recipe.servings}</span>
                </div>
              </div>
            </div>
          </div>
          {/* Image Attribution */}
          <div className="absolute bottom-4 right-4 text-white/70 text-sm z-10">
            AI Generated Image
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Recipe Images Gallery */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-6">Recipe Gallery</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Main recipe image */}
              <div className="relative group">
                <div className="relative w-full pb-[56.25%] rounded-lg overflow-hidden bg-gray-200">
                  {galleryImages[0] ? (
                    <Image
                      src={galleryImages[0]}
                      alt={recipe.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-sm">Loading...</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <div className="text-white text-sm">
                      Main Recipe Image
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    AI Generated
                  </div>
                </div>
              </div>
              
              {/* Variation image */}
              <div className="relative group">
                <div className="relative w-full pb-[56.25%] rounded-lg overflow-hidden bg-gray-200">
                  {galleryImages[1] ? (
                    <Image
                      src={galleryImages[1]}
                      alt={`${recipe.title} variation`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-sm">Loading...</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <div className="text-white text-sm">
                      Recipe Variation
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    AI Generated
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-8">
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'ingredients'
                  ? 'border-b-2 border-grapefruit text-grapefruit'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('ingredients')}
            >
              Ingredients
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'instructions'
                  ? 'border-b-2 border-grapefruit text-grapefruit'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('instructions')}
            >
              Instructions
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'tips'
                  ? 'border-b-2 border-grapefruit text-grapefruit'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('tips')}
            >
              Chef's Tips
            </button>
          </div>

          {/* Tab Content */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="bg-white rounded-xl shadow-sm p-6">
                {activeTab === 'ingredients' && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold mb-4">Ingredients for {recipe.servings} servings</h2>
                    <ul className="space-y-3">
                      {recipe.ingredients.map((ingredient, index) => (
                        <li key={index} className="flex items-center">
                          <span className="w-24 text-gray-600">{ingredient.amount} {ingredient.unit}</span>
                          <span className="flex-1">{ingredient.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeTab === 'instructions' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold mb-4">Cooking Instructions</h2>
                    {recipe.instructions.map((instruction) => (
                      <div key={instruction.step} className="flex">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-grapefruit text-white flex items-center justify-center font-medium">
                          {instruction.step}
                        </div>
                        <p className="ml-4 text-gray-700">{instruction.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'tips' && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold mb-4">Chef's Tips</h2>
                    <ul className="space-y-3">
                      {recipe.tips.map((tip, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-6 h-6 rounded-full bg-grapefruit/10 text-grapefruit flex items-center justify-center font-medium mr-3 mt-0.5">
                            {index + 1}
                          </span>
                          <span className="flex-1 text-gray-700">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-semibold mb-4">Quick Info</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Preparation Time</h3>
                    <p className="mt-1 text-lg">{recipe.prepTime}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Cooking Time</h3>
                    <p className="mt-1 text-lg">{recipe.cookTime}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Servings</h3>
                    <p className="mt-1 text-lg">{recipe.servings}</p>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Nutrition Facts</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Calories</p>
                        <p className="font-medium">{recipe.nutritionFacts.calories}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Protein</p>
                        <p className="font-medium">{recipe.nutritionFacts.protein}g</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Carbs</p>
                        <p className="font-medium">{recipe.nutritionFacts.carbs}g</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Fat</p>
                        <p className="font-medium">{recipe.nutritionFacts.fat}g</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 