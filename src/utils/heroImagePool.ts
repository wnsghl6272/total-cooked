import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { generateRandomFoodImage, DalleImage } from './dalleApi';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Pre-defined hero image prompts for variety
const HERO_IMAGE_PROMPTS = [
  'delicious gourmet food spread on elegant table',
  'fresh ingredients and cooking utensils in modern kitchen',
  'colorful healthy meal preparation scene',
  'professional chef cooking in restaurant kitchen',
  'beautiful food photography with natural lighting'
];

const HERO_POOL_SIZE = 5;
const CACHE_DURATION = 1000 * 60 * 60 * 24 * 30; // 30 days for hero images

interface HeroImagePool {
  images: DalleImage[];
  lastUpdated: string;
  currentIndex: number;
}

// Get current hero image pool from cache
export async function getHeroImagePool(): Promise<HeroImagePool | null> {
  try {
    // Try Supabase
    const { data, error } = await supabase
      .from('dalle_cache')
      .select('*')
      .eq('recipe_title', 'hero_image_pool')
      .single();

    if (!error && data) {
      const cacheAge = Date.now() - new Date(data.updated_at).getTime();
      if (cacheAge <= CACHE_DURATION) {
        try {
          const pool = typeof data.image_data === 'string'
            ? JSON.parse(data.image_data)
            : data.image_data;

          if (pool.images && pool.images.length === HERO_POOL_SIZE) {
            console.log('Hero image pool retrieved from Supabase');
            return pool as HeroImagePool;
          }
        } catch (error) {
          console.error('Error parsing Supabase hero pool:', error);
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting hero image pool:', error);
    return null;
  }
}

// Generate and cache a new hero image pool
export async function generateHeroImagePool(): Promise<HeroImagePool> {
  console.log('Generating new hero image pool...');
  const images: DalleImage[] = [];

  for (let i = 0; i < HERO_POOL_SIZE; i++) {
    try {
      const image = await generateRandomFoodImage(HERO_IMAGE_PROMPTS[i]);
      if (image) {
        images.push(image);
        console.log(`Generated hero image ${i + 1}/${HERO_POOL_SIZE}`);
      }
      // Add small delay to avoid rate limiting
      if (i < HERO_POOL_SIZE - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`Error generating hero image ${i + 1}:`, error);
    }
  }

  const pool: HeroImagePool = {
    images,
    lastUpdated: new Date().toISOString(),
    currentIndex: 0
  };

  // Cache the pool
  try {
    await supabase.from('dalle_cache').upsert({
      recipe_title: 'hero_image_pool',
      image_data: pool,
      updated_at: new Date().toISOString()
    });
    console.log('Hero image pool cached successfully');
  } catch (error) {
    console.error('Error caching hero image pool:', error);
  }

  return pool;
}

// Get next hero image from the pool (with rotation)
export async function getNextHeroImage(): Promise<DalleImage | null> {
  try {
    let pool = await getHeroImagePool();

    // If no pool exists or pool is incomplete, generate new one
    if (!pool || !pool.images || pool.images.length < HERO_POOL_SIZE) {
      console.log('Hero image pool not found or incomplete, generating new pool...');
      pool = await generateHeroImagePool();
    }

    if (pool.images.length === 0) {
      console.error('Failed to generate hero image pool');
      return null;
    }

    // Simply pick a random image from the pool (no need to track index)
    const randomIndex = Math.floor(Math.random() * pool.images.length);
    const selectedImage = pool.images[randomIndex];

    console.log(`Serving hero image ${randomIndex + 1}/${pool.images.length}`);
    return selectedImage;
  } catch (error) {
    console.error('Error getting next hero image:', error);
    return null;
  }
}

// Force refresh the hero image pool (for admin use)
export async function refreshHeroImagePool(): Promise<HeroImagePool> {
  console.log('Force refreshing hero image pool...');
  
  // Clear existing cache
  try {
    await supabase.from('dalle_cache').delete().eq('recipe_title', 'hero_image_pool');
  } catch (error) {
    console.error('Error clearing old hero pool cache:', error);
  }

  return await generateHeroImagePool();
}

// Check if hero image pool needs refresh (older than 30 days)
export async function shouldRefreshHeroPool(): Promise<boolean> {
  try {
    const pool = await getHeroImagePool();
    if (!pool) return true;

    const age = Date.now() - new Date(pool.lastUpdated).getTime();
    const maxAge = 1000 * 60 * 60 * 24 * 30; // 30 days

    return age > maxAge;
  } catch (error) {
    console.error('Error checking hero pool age:', error);
    return true;
  }
} 