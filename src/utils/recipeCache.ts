import { createClient } from '@supabase/supabase-js';
import { RecipeData } from '@/types/supabase';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24시간 (레시피 캐시)

export interface RecipeCache {
  id: string;
  cache_key: string;
  recipe_data: RecipeData;
  created_at: string;
  updated_at: string;
}

export async function getCachedRecipe(cacheKey: string): Promise<RecipeData | null> {
  try {
    console.log('Checking Supabase cache for recipe:', cacheKey);
    
    const { data: cache, error } = await supabase
      .from('recipe_cache')
      .select('*')
      .eq('cache_key', cacheKey)
      .single();

    if (error) {
      if (error.code === '42P01') {
        // 테이블이 없는 경우 무시하고 계속 진행
        return null;
      }
      console.error('Error fetching from Supabase cache:', error);
      return null;
    }

    if (!cache) {
      return null;
    }

    // Check if cache is still valid
    const cacheAge = Date.now() - new Date(cache.updated_at).getTime();
    if (cacheAge > CACHE_DURATION) {
      // Cache is expired, delete it
      await supabase.from('recipe_cache').delete().eq('cache_key', cacheKey);
      return null;
    }

    console.log('Supabase cache hit for recipe:', cacheKey);
    return cache.recipe_data;
  } catch (error) {
    console.error('Error in getCachedRecipe:', error);
    return null;
  }
}

export async function setCachedRecipe(cacheKey: string, recipeData: RecipeData): Promise<void> {
  try {
    console.log('Storing recipe in Supabase cache:', cacheKey);
    
    await supabase
      .from('recipe_cache')
      .upsert({
        cache_key: cacheKey,
        recipe_data: recipeData,
        updated_at: new Date().toISOString()
      })
      .select();
  } catch (error) {
    console.error('Error in setCachedRecipe:', error);
  }
}

export async function clearExpiredCache(): Promise<void> {
  try {
    const expiryTime = new Date(Date.now() - CACHE_DURATION).toISOString();
    
    await supabase
      .from('recipe_cache')
      .delete()
      .lt('updated_at', expiryTime);
      
    console.log('Expired cache cleared from Supabase');
  } catch (error) {
    console.error('Error in clearExpiredCache:', error);
  }
} 