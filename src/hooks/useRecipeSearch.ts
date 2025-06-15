import { useQuery } from '@tanstack/react-query';

interface AIRecipe {
  name: string;
  description: string;
}

async function fetchRecipes(ingredients: string[]): Promise<{ aiSuggestions: AIRecipe[] }> {
  if (!ingredients.length) return { aiSuggestions: [] };
  
  const response = await fetch(`/api/ai-suggestions?ingredients=${ingredients.join(',')}`);
  const data = await response.json();

  return {
    aiSuggestions: data.recipes || []
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