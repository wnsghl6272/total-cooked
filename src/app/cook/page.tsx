'use client';

import { useState, FormEvent, KeyboardEvent } from 'react';
import Navbar from '@/components/Navbar';
import Image from 'next/image';

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
      <Navbar />
      
      <div className="pt-24 px-4 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Input Section */}
          <div className="space-y-6">
            {/* Ingredient Search */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">What's in your kitchen?</h2>
              <div className="relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type ingredient name..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-grapefruit focus:border-transparent"
                />
                <button 
                  onClick={handleAddIngredient}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-grapefruit text-white px-4 py-2 rounded-lg hover:bg-grapefruit-dark transition-colors"
                >
                  Add
                </button>
              </div>
              
              {/* Added Ingredients */}
              <div className="mt-4 flex flex-wrap gap-2">
                {ingredients.map((ingredient, index) => (
                  <span 
                    key={index} 
                    className="bg-grapefruit-light text-grapefruit-dark px-3 py-1 rounded-full text-sm flex items-center"
                  >
                    {ingredient}
                    <button 
                      onClick={() => handleRemoveIngredient(ingredient)}
                      className="ml-2 text-grapefruit hover:text-grapefruit-dark"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Search Button */}
              <div className="mt-6">
                <button
                  onClick={searchRecipes}
                  disabled={ingredients.length === 0 || isLoading}
                  className="w-full bg-grapefruit text-white py-3 rounded-lg hover:bg-grapefruit-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Searching...' : 'Search Recipes'}
                </button>
              </div>
            </div>

            {/* Image Upload */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">Or upload a photo</h2>
              <div className="border-2 border-dashed border-grapefruit/20 rounded-lg p-8 text-center hover:border-grapefruit/40 transition-colors">
                <input type="file" className="hidden" id="image-upload" accept="image/*" />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="w-12 h-12 bg-grapefruit-light rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-6 h-6 text-grapefruit" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <p className="text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                </label>
              </div>
              {/* Image Upload Search Button */}
              <div className="mt-6">
                <button
                  onClick={() => {/* Image processing logic will go here */}}
                  className="w-full bg-grapefruit text-white py-3 rounded-lg hover:bg-grapefruit-dark transition-colors"
                >
                  Search with Image
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Recipe Suggestions */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-2xl font-semibold mb-6 text-gray-900">Recipe Suggestions</h2>
              
              {/* Display searched ingredients */}
              {searchedIngredients.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Searching recipes with:</h3>
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
              )}

              <div className="space-y-6">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 border-4 border-grapefruit border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600">Finding the perfect recipes...</p>
                  </div>
                ) : recipes.length > 0 ? (
                  recipes.map((recipe) => (
                    <div 
                      key={recipe.id}
                      className="flex gap-4 p-4 border border-grapefruit/10 rounded-lg hover:border-grapefruit/30 transition-all hover:shadow-md group"
                    >
                      <div className="w-24 h-24 bg-grapefruit-light rounded-lg overflow-hidden relative">
                        <Image
                          src={recipe.image}
                          alt={recipe.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg group-hover:text-grapefruit transition-colors">
                          {recipe.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">
                          {recipe.missedIngredientCount > 0 
                            ? `Missing ${recipe.missedIngredientCount} ingredient${recipe.missedIngredientCount > 1 ? 's' : ''}`
                            : 'You have all ingredients!'}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">{recipe.readyInMinutes} mins</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 mt-8">
                    {searchedIngredients.length > 0 
                      ? 'No recipes found. Try different ingredients!'
                      : 'Add ingredients or upload a photo to see recipe suggestions'}
                  </div>
                )}
              </div>
            </div>

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