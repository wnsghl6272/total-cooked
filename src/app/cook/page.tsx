'use client';

import { useState, KeyboardEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import IngredientInput from '@/components/IngredientInput';
import ImageUpload from '@/components/ImageUpload';
import RecipeSuggestions from '@/components/RecipeSuggestions';
import { useRecipeSearch } from '@/hooks/useRecipeSearch';
import { saveScrollPosition, restoreScrollPosition } from '@/utils/scrollPosition';
import { useAuth } from '@/contexts/AuthContext';
import Head from 'next/head';

interface Recipe {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  missedIngredientCount: number;
}

interface AiRecipe {
  name: string;
  description: string;
}

interface AiSuggestions {
  recipes: AiRecipe[];
}

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
  const recipes = data?.recipes || [];
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
  }, []);

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
        <title>Cook Page - Your Recipe Finder</title>
        <meta name="description" content="Find the best recipes based on the ingredients you have at home." />
        <meta name="keywords" content="recipes, cooking, ingredients, food, AI suggestions" />
        <meta property="og:title" content="Cook Page - Your Recipe Finder" />
        <meta property="og:description" content="Find the best recipes based on the ingredients you have at home." />
        <meta property="og:image" content="/path/to/your/image.jpg" />
        <meta property="og:url" content="https://yourwebsite.com/cook" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Cook Page - Your Recipe Finder" />
        <meta name="twitter:description" content="Find the best recipes based on the ingredients you have at home." />
        <meta name="twitter:image" content="/path/to/your/image.jpg" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Cook Page - Your Recipe Finder",
            "description": "Find the best recipes based on the ingredients you have at home.",
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

          {/* Right Column - Recipe Suggestions */}
          <div className="space-y-6">
            <RecipeSuggestions
              searchedIngredients={searchedIngredients}
              isLoading={isLoading}
              recipes={recipes}
            />

            {/* AI Recipe Suggestions */}
            {searchedIngredients.length > 0 && (
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-2xl font-semibold mb-6 text-gray-900">AI Chef Suggestions</h2>
                <div className="space-y-6">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 border-4 border-grapefruit border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="mt-4 text-gray-600">Our AI chef is thinking...</p>
                    </div>
                  ) : aiSuggestions.length > 0 ? (
                    aiSuggestions.map((recipe, index) => (
                      <div 
                        key={index}
                        className="p-4 border border-grapefruit/10 rounded-lg hover:border-grapefruit/30 transition-all hover:shadow-md"
                      >
                        <h3 className="font-semibold text-lg text-grapefruit mb-2">
                          {recipe.name}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {recipe.description}
                        </p>
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