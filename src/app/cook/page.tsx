'use client';

import { useState, FormEvent, KeyboardEvent } from 'react';
import Navbar from '@/components/Navbar';
import Image from 'next/image';
import IngredientInput from '@/components/IngredientInput';
import ImageUpload from '@/components/ImageUpload';
import RecipeSuggestions from '@/components/RecipeSuggestions';
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
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [searchedIngredients, setSearchedIngredients] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<AiRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const handleAddIngredient = () => {
    const trimmedInput = inputValue.trim().toLowerCase();
    if (trimmedInput && !ingredients.includes(trimmedInput)) {
      setIngredients([...ingredients, trimmedInput]);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddIngredient();
    }
  };

  const handleRemoveIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter(item => item !== ingredient));
  };

  const getAiSuggestions = async (ingredients: string[]) => {
    setIsLoadingAi(true);
    try {
      const response = await fetch(`/api/ai-suggestions?ingredients=${ingredients.join(',')}`);
      const data: AiSuggestions = await response.json();
      setAiSuggestions(data.recipes);
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const searchRecipes = async () => {
    if (ingredients.length === 0) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/recipes?ingredients=${ingredients.join(',')}`);
      const data = await response.json();
      setRecipes(data);
      setSearchedIngredients([...ingredients]); // Store searched ingredients
      setIngredients([]); // Reset ingredients input
      
      // Get AI suggestions after recipe search
      await getAiSuggestions(ingredients);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setIsLoading(false);
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
              searchRecipes={searchRecipes}
              isLoading={isLoading}
            />

            {/* Image Upload */}
            <ImageUpload />
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
                  {isLoadingAi ? (
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