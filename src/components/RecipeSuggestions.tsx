import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Recipe {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  missedIngredientCount: number;
}

interface RecipeSuggestionsProps {
  searchedIngredients: string[];
  isLoading: boolean;
  recipes: Recipe[];
}

function RecipeSuggestions({
  searchedIngredients,
  isLoading,
  recipes
}: RecipeSuggestionsProps) {
  const router = useRouter();

  const handleRecipeClick = (recipeId: number) => {
    router.push(`/recipe/${recipeId}`);
  };

  return (
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
                className="flex items-center space-x-4 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                onClick={() => handleRecipeClick(recipe.id)}
              >
                <Image src={recipe.image} alt={recipe.title} width={64} height={64} className="rounded-lg" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 hover:text-grapefruit transition-colors">{recipe.title}</h3>
                  <p className="text-sm text-gray-500">Ready in {recipe.readyInMinutes} minutes</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No recipes found. Try different ingredients.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecipeSuggestions; 