import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const TIMEOUT = 30000; // 30 seconds
const MAX_INGREDIENTS = 20;
const MIN_INGREDIENTS = 1;

let openai: OpenAI;

try {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }
  
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: TIMEOUT,
  });
} catch (error) {
  console.error('Failed to initialize OpenAI client:', error);
  throw error;
}

type ApiError = {
  message: string;
  status: number;
};

type Recipe = {
  name: string;
  description: string;
};

type ApiResponse = {
  recipes: Recipe[];
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ingredients = searchParams.get('ingredients');

  try {
    // Validate input
    if (!ingredients) {
      throw { message: 'No ingredients provided', status: 400 };
    }

    const ingredientsList = ingredients.split(',').map(i => i.trim());
    
    if (ingredientsList.length > MAX_INGREDIENTS) {
      throw {
        message: `Too many ingredients. Maximum allowed: ${MAX_INGREDIENTS}`,
        status: 400
      };
    }

    if (ingredientsList.length < MIN_INGREDIENTS) {
      throw {
        message: `At least ${MIN_INGREDIENTS} ingredient is required`,
        status: 400
      };
    }

    // Call OpenAI API with timeout
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a professional chef who can suggest creative and delicious recipes based on available ingredients. Always respond with a valid JSON object containing an array of recipes under the 'recipes' key."
        },
        {
          role: "user",
          content: `Suggest 5 creative recipes I can make with these ingredients: ${ingredients}. 
          Return a JSON object with this exact structure:
          {
            "recipes": [
              {
                "name": "Recipe Name",
                "description": "Brief description"
              }
            ]
          }`
        }
      ],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      max_tokens: 1000
    });

    if (!completion.choices[0].message.content) {
      throw { message: 'No suggestions generated', status: 500 };
    }

    let suggestions: ApiResponse;
    try {
      suggestions = JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error('Failed to parse OpenAI response:', error);
      throw { message: 'Invalid response format from AI', status: 500 };
    }

    if (!suggestions.recipes || !Array.isArray(suggestions.recipes)) {
      throw { message: 'Invalid response format from AI', status: 500 };
    }

    // Validate recipe format
    suggestions.recipes.forEach(recipe => {
      if (!recipe.name || !recipe.description) {
        throw { message: 'Invalid recipe format in AI response', status: 500 };
      }
    });

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('Error getting AI suggestions:', error);
    
    if ((error as ApiError).status) {
      const apiError = error as ApiError;
      return NextResponse.json(
        { error: apiError.message },
        { status: apiError.status }
      );
    }

    if (error instanceof Error && error.message.includes('timeout')) {
      return NextResponse.json(
        { error: 'Request timed out' },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to get AI suggestions' },
      { status: 500 }
    );
  }
} 