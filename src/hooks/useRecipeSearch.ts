import { useQuery } from '@tanstack/react-query';

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

async function fetchRecipes(ingredients: string[]) {
  if (!ingredients.length) return { recipes: [], aiSuggestions: [] };
  
  const [recipesResponse, aiResponse] = await Promise.all([
    fetch(`/api/recipes?ingredients=${ingredients.join(',')}`),
    fetch(`/api/ai-suggestions?ingredients=${ingredients.join(',')}`)
  ]);

  const recipes = await recipesResponse.json();
  const aiSuggestions = await aiResponse.json();

  return {
    recipes,
    aiSuggestions: aiSuggestions.recipes
  };
}

export function useRecipeSearch(ingredients: string[]) {
  return useQuery({
    queryKey: ['recipes', ingredients],
    queryFn: () => fetchRecipes(ingredients),
    enabled: ingredients.length > 0,
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
} 