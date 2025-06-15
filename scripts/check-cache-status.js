require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkCacheStatus() {
  console.log('🔍 Checking Cache Status (Supabase Only)...\n');

  try {
    console.log('📊 Supabase Cache Status:');
    
    // Check DALL-E cache table
    const { data: dalleCache, error: dalleError } = await supabase
      .from('dalle_cache')
      .select('recipe_title, created_at, updated_at')
      .order('updated_at', { ascending: false })
      .limit(10);

    if (dalleError) {
      console.log('❌ Error accessing dalle_cache:', dalleError.message);
    } else {
      console.log(`- Total DALL-E cache entries: ${dalleCache?.length || 0}`);
      if (dalleCache && dalleCache.length > 0) {
        console.log('- Recent entries:');
        dalleCache.forEach((entry, index) => {
          const age = Math.round((Date.now() - new Date(entry.updated_at).getTime()) / (1000 * 60));
          console.log(`  ${index + 1}. ${entry.recipe_title} (${age} minutes ago)`);
        });
      }
    }

    // Check recipe cache table
    const { data: recipeCache, error: recipeError } = await supabase
      .from('recipe_cache')
      .select('cache_key, created_at, updated_at')
      .order('updated_at', { ascending: false })
      .limit(10);

    if (recipeError) {
      console.log('❌ Error accessing recipe_cache:', recipeError.message);
    } else {
      console.log(`- Total recipe cache entries: ${recipeCache?.length || 0}`);
      if (recipeCache && recipeCache.length > 0) {
        console.log('- Recent recipe cache entries:');
        recipeCache.forEach((entry, index) => {
          const age = Math.round((Date.now() - new Date(entry.updated_at).getTime()) / (1000 * 60));
          console.log(`  ${index + 1}. ${entry.cache_key} (${age} minutes ago)`);
        });
      }
    }

    console.log('\n✅ Cache status check completed!');

  } catch (error) {
    console.error('❌ Error checking cache status:', error);
  }
}

// Test a specific recipe cache
async function testRecipeCache(recipeTitle) {
  console.log(`\n🧪 Testing cache for recipe: "${recipeTitle}"`);
  
  try {
    // Check Supabase DALL-E cache
    const { data: supabaseData, error } = await supabase
      .from('dalle_cache')
      .select('*')
      .eq('recipe_title', recipeTitle)
      .single();

    if (!error && supabaseData) {
      console.log('✅ Found in Supabase DALL-E cache');
      const age = Math.round((Date.now() - new Date(supabaseData.updated_at).getTime()) / (1000 * 60));
      console.log(`   - Age: ${age} minutes`);
      console.log(`   - Image data available: ${!!supabaseData.image_data}`);
      if (supabaseData.image_data && supabaseData.image_data.url) {
        console.log(`   - Image URL: ${supabaseData.image_data.url.substring(0, 50)}...`);
      }
    } else {
      console.log('❌ Not found in Supabase DALL-E cache');
    }

  } catch (error) {
    console.error('❌ Error testing recipe cache:', error);
  }
}

// Main execution
const command = process.argv[2];
const recipeTitle = process.argv[3];

if (command === 'test' && recipeTitle) {
  testRecipeCache(recipeTitle);
} else {
  checkCacheStatus();
} 