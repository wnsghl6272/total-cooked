import { NextResponse } from 'next/server';

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
const BASE_URL = 'https://api.spoonacular.com/recipes';
const MAX_RETRIES = 3;
const TIMEOUT = 10000; // 10 seconds

type Recipe = {
  id: number;
  title: string;
  image: string;
  missedIngredientCount: number;
};

type ApiError = {
  message: string;
  status: number;
};

async function fetchWithTimeout(url: string, options: RequestInit = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ingredients = searchParams.get('ingredients');
  const limit = Number(searchParams.get('limit')) || 5;

  // Input validation
  if (!ingredients) {
    return NextResponse.json(
      { error: 'No ingredients provided' },
      { status: 400 }
    );
  }

  if (limit < 1 || limit > 10) {
    return NextResponse.json(
      { error: 'Limit must be between 1 and 10' },
      { status: 400 }
    );
  }

  if (!SPOONACULAR_API_KEY) {
    console.error('Spoonacular API key not configured');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }

  try {
    // Fetch initial recipes
    const response = await fetchWithTimeout(
      `${BASE_URL}/findByIngredients?apiKey=${SPOONACULAR_API_KEY}&ingredients=${ingredients}&number=${limit}&ranking=2&ignorePantry=true`
    );

    if (!response.ok) {
      const error: ApiError = {
        message: 'Failed to fetch recipes',
        status: response.status
      };
      
      if (response.status === 402) {
        error.message = 'API quota exceeded';
      } else if (response.status === 429) {
        error.message = 'Too many requests';
      }
      
      throw error;
    }

    const recipes: Recipe[] = await response.json();

    if (!Array.isArray(recipes)) {
      throw new Error('Invalid response format from Spoonacular API');
    }

    // Get additional recipe information with retry logic
    const recipeDetails = await Promise.all(
      recipes.map(async (recipe: Recipe) => {
        for (let i = 0; i < MAX_RETRIES; i++) {
          try {
            const detailResponse = await fetchWithTimeout(
              `${BASE_URL}/${recipe.id}/information?apiKey=${SPOONACULAR_API_KEY}`
            );

            if (!detailResponse.ok) {
              throw new Error(`Failed to fetch recipe details: ${detailResponse.status}`);
            }

            const detail = await detailResponse.json();
            
            return {
              id: recipe.id,
              title: recipe.title,
              image: recipe.image,
              readyInMinutes: detail.readyInMinutes || 0,
              missedIngredientCount: recipe.missedIngredientCount,
              sourceUrl: detail.sourceUrl || '',
              instructions: detail.instructions || 'No instructions available'
            };
          } catch (error) {
            // Only retry on network errors or 5xx errors
            if (error instanceof Error && error.name === 'AbortError') {
              continue;
            }
            if (i === MAX_RETRIES - 1) {
              console.error(`Failed to fetch details for recipe ${recipe.id} after ${MAX_RETRIES} retries:`, error);
            }
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
          }
        }
        
        // Return partial data if detail fetch fails
        return {
          id: recipe.id,
          title: recipe.title,
          image: recipe.image,
          readyInMinutes: 0,
          missedIngredientCount: recipe.missedIngredientCount,
          sourceUrl: '',
          instructions: 'Failed to load recipe details'
        };
      })
    );

    return NextResponse.json(recipeDetails);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    
    if ((error as ApiError).status) {
      const apiError = error as ApiError;
      return NextResponse.json(
        { error: apiError.message },
        { status: apiError.status }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
    );
  }
} 