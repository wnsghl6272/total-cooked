'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';


console.log('🔗 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing');
console.log('🔑 Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface RecipeCache {
  id: string;
  cache_key: string;
  recipe_data: {
    title?: string;
    description?: string;
    prepTime?: string;
    cookTime?: string;
    ingredients?: { name: string; amount: string; unit: string }[];
    // Support for old format
    [key: string]: unknown;
  };
  created_at: string;
}

interface RecipeWithImage extends RecipeCache {
  imageUrl?: string;
  imageLoading: boolean;
}

export default function RecipesBlogPage() {
  const [recipes, setRecipes] = useState<RecipeWithImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecipes() {
      const startTime = Date.now();
      console.log('🚀 Starting fetchRecipes...');
      
      try {
        console.log('🔍 Fetching recipes from Supabase...');
        
        // Timeout 설정 (10초)
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Supabase request timeout')), 10000)
        );

        const supabasePromise = supabase
          .from('recipe_cache')
          .select('*');

        const result = await Promise.race([supabasePromise, timeoutPromise]) as { data: RecipeCache[] | null; error: Error | null };
        const { data, error } = result;

        if (error) {
          console.error('❌ Error fetching recipes:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
          setRecipes([]);
          return;
        }

        const fetchTime = Date.now() - startTime;
        console.log(`✅ Fetched ${data?.length || 0} recipes in ${fetchTime}ms`);

        if (!data || data.length === 0) {
          console.log('📭 No recipes found in database');
          setRecipes([]);
          return;
        }

        // Shuffle recipes randomly
        const shuffledData = data.sort(() => Math.random() - 0.5);
        
        const recipesWithImageState = shuffledData.map((recipe: RecipeCache) => ({
          ...recipe,
          imageLoading: false,
          imageUrl: '',
        }));

        console.log('📋 Setting recipes state...');
        setRecipes(recipesWithImageState);

        // Load cached images for each recipe from dalle_cache table
        console.log(`📊 Starting to load ${recipesWithImageState.length} recipe images...`);
        
        recipesWithImageState.forEach(async (recipe: RecipeWithImage, index: number) => {
          try {
            const recipeTitle = extractRecipeTitle(recipe.cache_key);
            console.log(`🖼️ [${index + 1}/${recipesWithImageState.length}] Looking for cached image for: "${recipeTitle}" (cache_key: ${recipe.cache_key})`);
            
            // Try exact match first
            let { data: cachedImage, error } = await supabase
              .from('dalle_cache')
              .select('*')
              .eq('recipe_title', recipeTitle)
              .single();
            
            console.log(`🔍 Exact match result:`, { found: !!cachedImage, error: error?.message });

            // If exact match fails, try variations
            if (error && error.code === 'PGRST116') {
              console.log(`🔍 Trying alternative matches for: ${recipeTitle}`);
              
              // Try with different capitalizations
              const variations = [
                recipeTitle.toLowerCase(),
                recipeTitle.toUpperCase(),
                recipeTitle.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' '),
                recipeTitle + ' ',  // with trailing space
                recipeTitle.trim(), // trimmed
              ];

              for (const variation of variations) {
                const { data: varData, error: varError } = await supabase
                  .from('dalle_cache')
                  .select('*')
                  .eq('recipe_title', variation)
                  .single();
                
                if (!varError && varData) {
                  console.log(`✅ Found match with variation: "${variation}"`);
                  cachedImage = varData;
                  error = null;
                  break;
                }
              }
            }

            let imageUrl = '';
            if (!error && cachedImage) {
              console.log(`✅ Found cached image for: ${recipeTitle}`);
              try {
                let imageData;
                if (typeof cachedImage.image_data === 'string') {
                  imageData = JSON.parse(cachedImage.image_data);
                } else {
                  imageData = cachedImage.image_data;
                }
                
                // Handle different image data formats
                if (imageData?.url) {
                  imageUrl = imageData.url;
                } else if (imageData?.urls?.regular) {
                  // Handle Unsplash format
                  imageUrl = imageData.urls.regular;
                } else if (Array.isArray(imageData) && imageData.length > 0) {
                  // Handle array format
                  imageUrl = imageData[0]?.url || imageData[0]?.urls?.regular || '';
                }
                
                if (imageUrl) {
                  console.log(`📸 Image URL: ${imageUrl.substring(0, 50)}...`);
                } else {
                  console.log(`⚠️ Image data found but no valid URL extracted:`, imageData);
                }
              } catch (parseError) {
                console.error('Error parsing cached image data:', parseError, cachedImage.image_data);
              }
            } else {
              console.log(`❌ No cached image found for: ${recipeTitle}`, error);
              // 캐시된 이미지가 없으면 빈 문자열 유지 (기본 그라데이션 표시)
            }

            // 캐시된 이미지가 있을 때만 업데이트
            if (imageUrl) {
              setRecipes(prev => prev.map((r, i) => 
                i === index ? { ...r, imageUrl } : r
              ));
            }
            console.log(`✅ Image loaded for recipe ${index + 1}/${recipesWithImageState.length}`);
                      } catch (error) {
              console.error('Error loading cached image for recipe:', extractRecipeTitle(recipe.cache_key), error);
              // 오류 발생 시에도 기본 이미지 유지
            }
        });
      } catch (error) {
        console.error('❌ Fatal error in fetchRecipes:', error);
        setRecipes([]); // 에러 발생 시 빈 배열로 설정
      } finally {
        const totalTime = Date.now() - startTime;
        console.log(`🏁 fetchRecipes completed in ${totalTime}ms`);
        setLoading(false);
      }
    }

    fetchRecipes();
  }, []);



  // Extract recipe title from cache_key
  const extractRecipeTitle = (cacheKey: string) => {
    return cacheKey
      .replace(/^recipe_/, '') // Remove recipe_ prefix
      .replace(/-$/, '') // Remove trailing dash
      .replace(/- $/, '') // Remove trailing dash with space
      .trim() // Remove any extra whitespace
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Discover Delicious Recipes
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore our collection of AI-generated recipes, complete with detailed instructions and cooking tips.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-grapefruit"></div>
            </div>
          ) : recipes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600">No recipes found. Start cooking to see recipes here!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recipes.map((recipe) => (
                <Link
                  key={recipe.id}
                  href={`/recipe/ai/${encodeURIComponent(recipe.cache_key)}`}
                  className="block bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-100 cursor-pointer"
                >
                  <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                    <div className="w-full h-48 relative">
                      {recipe.imageUrl ? (
                        <div 
                          className="w-full h-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${recipe.imageUrl})` }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-grapefruit to-grapefruit-dark flex items-center justify-center">
                          <div className="text-white text-center">
                            <svg className="w-12 h-12 mx-auto mb-2 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm opacity-80">Recipe Image</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      {extractRecipeTitle(recipe.cache_key)}
                    </h2>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {recipe.recipe_data.description || 'AI-generated recipe with detailed instructions and ingredients'}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        {recipe.recipe_data.prepTime && (
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {recipe.recipe_data.prepTime}
                          </span>
                        )}
                        {recipe.recipe_data.cookTime && (
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
                            </svg>
                            {recipe.recipe_data.cookTime}
                          </span>
                        )}
                      </div>
                      {recipe.recipe_data.ingredients && (
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {recipe.recipe_data.ingredients.length} ingredients
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
} 