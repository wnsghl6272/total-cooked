import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ingredients = searchParams.get('ingredients');

  if (!ingredients) {
    return NextResponse.json({ error: 'No ingredients provided' }, { status: 400 });
  }

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a professional chef who can suggest creative and delicious recipes based on available ingredients. Provide recipes in a structured format with name and brief description."
        },
        {
          role: "user",
          content: `Suggest 3 creative recipes I can make with these ingredients: ${ingredients}. 
          Format each recipe as a JSON object with 'name' and 'description' fields. 
          Return them in an array.`
        }
      ],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const suggestions = JSON.parse(completion.choices[0].message.content || '{"recipes": []}');
    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('Error getting AI suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to get AI suggestions' },
      { status: 500 }
    );
  }
} 