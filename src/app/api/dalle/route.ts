import { NextRequest, NextResponse } from 'next/server';
import { generateMultipleRecipeImages, DalleImage } from '@/utils/dalleApi';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const count = parseInt(searchParams.get('count') || '2');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    console.log('Generating DALL-E images for:', query);

    const images = await generateMultipleRecipeImages(query, count);

    if (!images || images.length === 0) {
      return NextResponse.json({ error: 'Failed to generate images' }, { status: 500 });
    }

    // Transform DALL-E images to standard format
    const transformedImages = images.map((image: DalleImage) => ({
      id: image.id,
      urls: {
        regular: image.url,
        full: image.url,
      },
      alt_description: image.alt_description,
      user: {
        name: 'AI Generated',
        username: 'dalle',
      },
      dalle_specific: {
        prompt: image.prompt,
        created_at: image.created_at,
      }
    }));

    return NextResponse.json(transformedImages);
  } catch (error) {
    console.error('Error generating DALL-E images:', error);
    return NextResponse.json({ 
      error: 'Failed to generate images',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 