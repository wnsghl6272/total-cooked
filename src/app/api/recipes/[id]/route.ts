import { NextResponse } from 'next/server';

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
const BASE_URL = 'https://api.spoonacular.com/recipes';

interface Context {
  params: {
    id: string;
  };
}

export async function GET(
  request: Request,
  context: Context
) {
  try {
    if (!SPOONACULAR_API_KEY) {
      return NextResponse.json(
        { error: 'Spoonacular API key not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(
      `${BASE_URL}/${context.params.id}/information?apiKey=${SPOONACULAR_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch recipe details');
    }

    const recipe = await response.json();
    return NextResponse.json(recipe);
  } catch (error) {
    console.error('Error fetching recipe details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipe details' },
      { status: 500 }
    );
  }
}