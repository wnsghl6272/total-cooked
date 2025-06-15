'use client';

import { useState, KeyboardEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import IngredientInput from '@/components/IngredientInput';
import ImageUpload from '@/components/ImageUpload';
import { useRecipeSearch } from '@/hooks/useRecipeSearch';
import { saveScrollPosition, restoreScrollPosition } from '@/utils/scrollPosition';
import { useAuth } from '@/contexts/AuthContext';
import Head from 'next/head';

export default function CookPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  // Get initial ingredients from URL
  const initialIngredients = searchParams.get('ingredients')?.split(',').filter(Boolean) || [];
  
  const [inputValue, setInputValue] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [searchedIngredients, setSearchedIngredients] = useState<string[]>(initialIngredients);
  const [searchCount, setSearchCount] = useState(0);

  // Use React Query for data fetching
  const { data, isLoading } = useRecipeSearch(searchedIngredients);
  const aiSuggestions = data?.aiSuggestions || [];

  // Load search count from localStorage
  useEffect(() => {
    const count = localStorage.getItem('recipeSearchCount');
    if (count) {
      setSearchCount(parseInt(count));
    }
  }, []);

  // Restore scroll position on mount
  useEffect(() => {
    if (initialIngredients.length > 0) {
      restoreScrollPosition();
    }
  }, [initialIngredients.length]);

  const updateSearchParams = (ingredients: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    if (ingredients.length > 0) {
      params.set('ingredients', ingredients.join(','));
    } else {
      params.delete('ingredients');
    }
    // Save scroll position before navigation
    saveScrollPosition();
    router.push(`/cook?${params.toString()}`);
  };

  const handleAddIngredient = (ingredient: string) => {
    if (ingredient.trim() && !ingredients.includes(ingredient.trim())) {
      setIngredients([...ingredients, ingredient.trim()]);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      handleAddIngredient(inputValue);
    }
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const clearIngredients = () => {
    setIngredients([]);
    setSearchedIngredients([]);
    updateSearchParams([]);
  };

  const handleIngredientsFromImage = async (detectedIngredients: string[]) => {
    setIngredients([...new Set([...ingredients, ...detectedIngredients])]);
  };

  const searchRecipes = async (searchIngredients: string[] = ingredients) => {
    if (searchIngredients.length === 0) return;

    if (!user && searchCount >= 1) {
      router.push('/auth/signin?redirect=/cook');
      return;
    }

    setSearchedIngredients([...searchIngredients]);
    updateSearchParams(searchIngredients);
    setIngredients([]);

    if (!user) {
      const newCount = searchCount + 1;
      setSearchCount(newCount);
      localStorage.setItem('recipeSearchCount', newCount.toString());
    }
  };

  return (
    <main className="min-h-screen bg-grapefruit-light/20">
      <Head>
        <title>AI Chef - Your Personal Recipe Creator</title>
        <meta name="description" content="Get personalized recipe suggestions from our AI Chef based on your ingredients." />
        <meta name="keywords" content="AI chef, cooking, recipes, ingredients, food, personalized recipes" />
        <meta property="og:title" content="AI Chef - Your Personal Recipe Creator" />
        <meta property="og:description" content="Get personalized recipe suggestions from our AI Chef based on your ingredients." />
        <meta property="og:image" content="/path/to/your/image.jpg" />
        <meta property="og:url" content="https://yourwebsite.com/cook" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI Chef - Your Personal Recipe Creator" />
        <meta name="twitter:description" content="Get personalized recipe suggestions from our AI Chef based on your ingredients." />
        <meta name="twitter:image" content="/path/to/your/image.jpg" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "AI Chef - Your Personal Recipe Creator",
            "description": "Get personalized recipe suggestions from our AI Chef based on your ingredients.",
            "url": "https://yourwebsite.com/cook",
            "image": "/path/to/your/image.jpg"
          })}
        </script>
        <link rel="canonical" href="https://yourwebsite.com/cook" />
      </Head>
      <Navbar />
      
      <div className="pt-24 px-4 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Input Section */}
          <div className="space-y-6">
            <IngredientInput
              inputValue={inputValue}
              setInputValue={setInputValue}
              ingredients={ingredients}
              handleAddIngredient={handleAddIngredient}
              handleKeyPress={handleKeyPress}
              handleRemoveIngredient={handleRemoveIngredient}
              searchRecipes={() => searchRecipes()}
              isLoading={isLoading}
              clearIngredients={clearIngredients}
            />

            {/* Image Upload */}
            <ImageUpload onIngredientsDetected={handleIngredientsFromImage} />
          </div>

          {/* Right Column - AI Chef Suggestions */}
          <div className="space-y-6">
            {searchedIngredients.length > 0 && (
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center mb-6">
                  <span className="text-grapefruit mr-3">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </span>
                  <h2 className="text-2xl font-semibold text-gray-900">AI Chef's Special Recommendations</h2>
                </div>

                {/* Display searched ingredients */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Creating recipes with:</h3>
                  <div className="flex flex-wrap gap-2">
                    {searchedIngredients.map((ingredient, index) => (
                      <span 
                        key={index}
                        className="bg-grapefruit-light text-grapefruit-dark px-3 py-1 rounded-full text-sm"
                      >
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 border-4 border-grapefruit border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="mt-4 text-gray-600">Our AI chef is crafting personalized recipes...</p>
                    </div>
                  ) : aiSuggestions.length > 0 ? (
                    aiSuggestions.map((recipe: { name: string; description: string }, index: number) => (
                      <div 
                        key={index}
                        className="p-6 border border-grapefruit/10 rounded-lg hover:border-grapefruit/30 transition-all hover:shadow-md cursor-pointer"
                        onClick={() => router.push(`/recipe/ai/${encodeURIComponent(recipe.name.toLowerCase().replace(/\s+/g, '-'))}?ingredients=${searchedIngredients.join(',')}`)}
                      >
                        <div className="flex items-center mb-3">
                          <h3 className="font-semibold text-lg text-grapefruit">
                            {recipe.name}
                          </h3>
                        </div>
                        <p className="text-gray-600 text-sm">
                          {recipe.description}
                        </p>
                        <div className="mt-4 flex justify-end">
                          <span className="text-sm text-grapefruit hover:text-grapefruit-dark">
                            View Recipe →
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500">
                      No AI suggestions available at the moment
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 