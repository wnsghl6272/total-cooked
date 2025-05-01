import { KeyboardEvent, useEffect, useState, useRef } from 'react';
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
  clearIngredients: () => void;
}

function IngredientInput({
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
      handleAddIngredient();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
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
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Type ingredient name..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-grapefruit focus:border-transparent"
          />
          <button 
            onClick={handleAddIngredient}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-grapefruit text-white px-4 py-2 rounded-lg hover:bg-grapefruit-dark transition-colors"
          >
            Add
          </button>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
            >
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`px-4 py-2 cursor-pointer hover:bg-grapefruit-light ${
                    index === selectedIndex ? 'bg-grapefruit-light' : ''
                  }`}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
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
          {ingredients.length > 0 && (
            <button
              onClick={clearIngredients}
              className="text-sm text-gray-500 hover:text-grapefruit transition-colors ml-2 flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear all
            </button>
          )}
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={ingredients.length === 0 || isLoading}
          className="w-full mt-4 bg-grapefruit text-white py-3 rounded-lg hover:bg-grapefruit-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Searching...' : (!user && searchCount >= 1) ? 'Sign in to Search More Recipes' : 'Search Recipes'}
        </button>
      </div>
    </div>
  );
}

export default IngredientInput; 