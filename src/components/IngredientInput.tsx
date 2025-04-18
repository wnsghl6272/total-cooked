import { KeyboardEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface IngredientInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  ingredients: string[];
  handleAddIngredient: () => void;
  handleKeyPress: (e: KeyboardEvent<HTMLInputElement>) => void;
  handleRemoveIngredient: (ingredient: string) => void;
  searchRecipes: () => void;
  isLoading: boolean;
}

function IngredientInput({
  inputValue,
  setInputValue,
  ingredients,
  handleAddIngredient,
  handleKeyPress,
  handleRemoveIngredient,
  searchRecipes,
  isLoading
}: IngredientInputProps) {
  const [searchCount, setSearchCount] = useState(0);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const count = localStorage.getItem('recipeSearchCount');
    if (count) {
      setSearchCount(parseInt(count));
    }
  }, []);

  const handleSearch = () => {
    if (!user && searchCount >= 1) {
      router.push('/auth/signin');
      return;
    }

    searchRecipes();
    if (!user) {
      const newCount = searchCount + 1;
      setSearchCount(newCount);
      localStorage.setItem('recipeSearchCount', newCount.toString());
    }
  };

  return (
    <div className="space-y-6">
      {/* Ingredient Search */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">What&apos;s in your kitchen?</h2>
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
            onClick={handleSearch}
            disabled={ingredients.length === 0 || isLoading}
            className="w-full bg-grapefruit text-white py-3 rounded-lg hover:bg-grapefruit-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Searching...' : (!user && searchCount >= 1) ? 'Sign in to Search More Recipes' : 'Search Recipes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default IngredientInput; 