import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getCachedRecipe, setCachedRecipe } from '@/utils/recipeCache';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface RecipeDetails {
  description: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  ingredients: Array<{name: string; amount: string; unit: string}>;
  instructions: Array<{step: number; text: string}>;
  nutritionFacts: {calories: number; protein: number; carbs: number; fat: number};
  tips: string[];
}

async function generateRecipeDetails(title: string, ingredients: string[]): Promise<RecipeDetails> {
  // Create cache key from title and ingredients
  const cacheKey = `${title}-${ingredients.sort().join(',')}`;
  
  // Check cache
  const cachedRecipe = await getCachedRecipe(cacheKey);
  if (cachedRecipe) {
    console.log('Cache hit for recipe:', title);
    return cachedRecipe;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional chef with expertise in creating detailed, delicious recipes. Always respond with a valid JSON object containing the recipe details."
        },
        {
          role: "user",
          content: `Create a detailed recipe for '${title}' using these ingredients: ${ingredients.join(', ')}. 
          Return a JSON object with the following structure:
          {
            "description": "Brief, appetizing description",
            "prepTime": "preparation time",
            "cookTime": "cooking time",
            "servings": number,
            "ingredients": [{"name": "ingredient name", "amount": "amount", "unit": "unit"}],
            "instructions": [{"step": number, "text": "instruction text"}],
            "nutritionFacts": {"calories": number, "protein": number, "carbs": number, "fat": number},
            "tips": ["tip1", "tip2", ...]
          }`
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No content in response');
    }

    try {
      const parsedContent = JSON.parse(content);
      // Store in Supabase cache
      await setCachedRecipe(cacheKey, parsedContent);
      return parsedContent;
    } catch (e) {
      console.error('Failed to parse GPT response as JSON:', content);
      throw new Error('Invalid JSON response from AI');
    }
  } catch (error) {
    console.error('Error generating recipe details:', error);
    throw error;
  }
}

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const title = decodeURIComponent(params.slug).split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    const url = new URL(request.url);
    const ingredientsParam = url.searchParams.get('ingredients');
    const ingredients = ingredientsParam ? ingredientsParam.split(',') : [];

    const recipeDetails = await generateRecipeDetails(title, ingredients);

    const recipe = {
      title,
      description: recipeDetails.description,
      prepTime: recipeDetails.prepTime,
      cookTime: recipeDetails.cookTime,
      servings: recipeDetails.servings,
      ingredients: recipeDetails.ingredients.map((ing) => ({
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit
      })),
      instructions: recipeDetails.instructions,
      nutritionFacts: recipeDetails.nutritionFacts,
      tips: recipeDetails.tips
    };

    return NextResponse.json(recipe);
  } catch (error) {
    console.error('Error creating recipe:', error);
    return NextResponse.json(
      { error: 'Failed to create recipe' },
      { status: 500 }
    );
  }
} 