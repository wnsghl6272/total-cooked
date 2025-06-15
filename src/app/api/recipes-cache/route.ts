import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    // recipe_cache 테이블에서 모든 캐싱된 레시피 가져오기
    const { data: cachedRecipes, error } = await supabase
      .from('recipe_cache')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(20); // 최신 20개만

    if (error) {
      console.error('Error fetching cached recipes:', error);
      return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 });
    }

    // 레시피 데이터 파싱 및 변환
    const recipes = cachedRecipes?.map(cache => {
      try {
        const recipeData = typeof cache.recipe_data === 'string' 
          ? JSON.parse(cache.recipe_data) 
          : cache.recipe_data;

        return {
          id: cache.id,
          cacheKey: cache.cache_key,
          title: recipeData.title || cache.cache_key,
          description: recipeData.description || 'AI-generated recipe',
          prepTime: recipeData.prepTime || '30 mins',
          cookTime: recipeData.cookTime || '30 mins',
          servings: recipeData.servings || 4,
          updatedAt: cache.updated_at,
          slug: cache.cache_key.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        };
      } catch (error) {
        console.error('Error parsing recipe data:', error);
        return null;
      }
    }).filter(Boolean) || [];

    return NextResponse.json(recipes);
  } catch (error) {
    console.error('Error in recipes-cache API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 