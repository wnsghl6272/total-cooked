import { NextResponse } from 'next/server';

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
const BASE_URL = 'https://api.spoonacular.com/recipes';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ingredients = searchParams.get('ingredients');

  if (!ingredients) {
    return NextResponse.json({ error: 'No ingredients provided' }, { status: 400 });
  }

  if (!SPOONACULAR_API_KEY) {
    return NextResponse.json(
      { error: 'Spoonacular API key not configured' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `${BASE_URL}/findByIngredients?apiKey=${SPOONACULAR_API_KEY}&ingredients=${ingredients}&number=5&ranking=2&ignorePantry=true`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch recipes');
    }

    const recipes = await response.json();

    // Get additional recipe information for each recipe
    const recipeDetails = await Promise.all(
      recipes.map(async (recipe: any) => {
        const detailResponse = await fetch(
          `${BASE_URL}/${recipe.id}/information?apiKey=${SPOONACULAR_API_KEY}`
        );
        const detail = await detailResponse.json();
        
        return {
          id: recipe.id,
          title: recipe.title,
          image: recipe.image,
          readyInMinutes: detail.readyInMinutes,
          missedIngredientCount: recipe.missedIngredientCount,
          sourceUrl: detail.sourceUrl,
          instructions: detail.instructions
        };
      })
    );

    return NextResponse.json(recipeDetails);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
    );
  }
} 