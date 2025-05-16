import { KeyboardEvent, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface IngredientInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  ingredients: string[];
  handleAddIngredient: (ingredient: string) => void;
  handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleRemoveIngredient: (index: number) => void;
  searchRecipes: () => void;
  isLoading: boolean;
  clearIngredients: () => void;
}

export default function IngredientInput({
  inputValue,
  setInputValue,
  ingredients,
  handleAddIngredient,
  handleKeyPress,
  handleRemoveIngredient,
  searchRecipes,
  isLoading,
  clearIngredients
}: IngredientInputProps) {
  const [searchCount, setSearchCount] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const count = localStorage.getItem('recipeSearchCount');
    if (count) {
      setSearchCount(parseInt(count));
    }
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (inputValue.trim().length < 3) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await fetch(`/api/ingredients?query=${encodeURIComponent(inputValue)}`);
        const data = await response.json();
        setSuggestions(data.suggestions);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 800);
    return () => clearTimeout(debounceTimer);
  }, [inputValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[selectedIndex]);
      handleAddIngredient(inputValue);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-2xl font-semibold mb-6 text-gray-900">Add Your Ingredients</h2>
      
      {/* Input Section */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Type an ingredient..."
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-grapefruit focus:border-transparent"
          />
          <button
            onClick={() => handleAddIngredient(inputValue)}
            disabled={!inputValue.trim()}
            className="px-4 py-2 bg-grapefruit text-white rounded-lg hover:bg-grapefruit-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Add
          </button>
        </div>

        {/* Ingredients List */}
        {ingredients.length > 0 && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {ingredients.map((ingredient, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-grapefruit/10 text-grapefruit"
                >
                  {ingredient}
                  <button
                    onClick={() => handleRemoveIngredient(index)}
                    className="ml-2 hover:text-grapefruit-dark"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={searchRecipes}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-grapefruit text-white rounded-lg hover:bg-grapefruit-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Searching...
                  </span>
                ) : (
                  'Find Recipes'
                )}
              </button>
              <button
                onClick={clearIngredients}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 