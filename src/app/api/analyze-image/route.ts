import { NextResponse } from 'next/server';
import * as vision from '@google-cloud/vision';
import { protos } from '@google-cloud/vision';

// Constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MIN_CONFIDENCE_SCORE = 0.8;

// Type definitions for Vision API responses
type VisionLabel = {
  description: string;
  score: number;
};

type VisionObject = {
  name: string;
  score: number;
};

type ObjectResponse = {
  localizedObjectAnnotations: VisionObject[];
};

// Google Cloud Vision client initialization
let client: vision.v1.ImageAnnotatorClient;

try {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64) {
    // Decode base64 credentials
    const credentials = Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64, 'base64').toString();
    const credentialsJson = JSON.parse(credentials);
    
    // Initialize client with credentials JSON
    client = new vision.v1.ImageAnnotatorClient({
      credentials: credentialsJson
    });
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Fallback to file-based credentials for local development
    client = new vision.v1.ImageAnnotatorClient({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
  } else {
    throw new Error('No Google Cloud credentials provided');
  }
} catch (error) {
  console.error('Failed to initialize Vision API client:', error);
  throw error;
}

// 제외할 일반적인 키워드
const EXCLUDE_KEYWORDS = [
  'food', 'ingredient', 'ingredients', 'natural foods', 'cuisine', 'dish', 'meal',
  'produce', 'product', 'grocery', 'groceries', 'supermarket', 'red', 'green', 'yellow',
  'white', 'black', 'fresh', 'raw', 'cooked', 'seedless', 'sweet', 'sour', 'berry',
  'fruit', 'vegetable', 'frozen', 'dried'
];

// 단수/복수 정규화를 위한 매핑
const NORMALIZE_MAPPING: { [key: string]: string } = {
  'strawberries': 'strawberry',
  'tomatoes': 'tomato',
  'potatoes': 'potato',
  'carrots': 'carrot',
  'onions': 'onion',
  'peppers': 'pepper',
  'cucumbers': 'cucumber',
  'berries': 'berry',
  'apples': 'apple',
  'oranges': 'orange',
  'lemons': 'lemon',
  'limes': 'lime',
  'bananas': 'banana',
  'grapes': 'grape',
};

type ApiError = {
  message: string;
  status: number;
};

export async function POST(request: Request) {
  console.log('Received image analysis request');
  
  try {
    // Validate request content type
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('multipart/form-data')) {
      throw { message: 'Invalid content type. Expected multipart/form-data', status: 400 };
    }

    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    // Validate file existence
    if (!file) {
      throw { message: 'No image file provided', status: 400 };
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw {
        message: `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
        status: 400
      };
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw {
        message: `File size exceeds limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        status: 400
      };
    }

    console.log('Image file received:', file.name, file.type, file.size);

    // Convert file to buffer with memory management
    let buffer: Buffer;
    try {
      buffer = Buffer.from(await file.arrayBuffer());
    } catch (error) {
      console.error('Error converting file to buffer:', error);
      throw { message: 'Failed to process image file', status: 500 };
    }

    console.log('File converted to buffer, size:', buffer.length);

    // Perform Vision API requests
    console.log('Calling Google Vision API...');
    
    // Label Detection
    const [labelResponse] = await client.labelDetection({
      image: { content: buffer }
    });

    // Object Localization (optional)
    let objectResponse: ObjectResponse = { localizedObjectAnnotations: [] };
    if (typeof client.objectLocalization === 'function') {
      try {
        const [response] = await client.objectLocalization({
          image: { content: buffer }
        });
        if (response && Array.isArray(response.localizedObjectAnnotations)) {
          objectResponse = {
            localizedObjectAnnotations: response.localizedObjectAnnotations.map(obj => ({
              name: obj.name || '',
              score: obj.score || 0
            }))
          };
        }
      } catch (error) {
        console.warn('Object localization failed, continuing with labels only:', error);
      }
    } else {
      console.warn('Object localization not available in this Vision API client');
    }

    // Clean up buffer
    buffer = Buffer.alloc(0);

    // Extract and validate labels
    const labels: VisionLabel[] = (labelResponse?.labelAnnotations || []).map(label => ({
      description: label.description || '',
      score: label.score || 0
    }));

    // Extract objects
    const objects = objectResponse.localizedObjectAnnotations;

    console.log('Raw labels from Vision API:', labels);
    console.log('Raw objects from Vision API:', objects);

    // Combine all detected items with scores
    const detectedItems = new Map<string, number>();

    // Add labels with scores
    labels.forEach((label) => {
      if (label.score > 0 && label.description) {
        const desc = label.description.toLowerCase();
        if (!EXCLUDE_KEYWORDS.includes(desc)) {
          const currentScore = detectedItems.get(desc) || 0;
          detectedItems.set(desc, Math.max(currentScore, label.score));
        }
      }
    });

    // Add detected objects with scores
    objects.forEach((obj) => {
      if (obj.score > 0 && obj.name) {
        const name = obj.name.toLowerCase();
        if (!EXCLUDE_KEYWORDS.includes(name)) {
          const currentScore = detectedItems.get(name) || 0;
          detectedItems.set(name, Math.max(currentScore, obj.score));
        }
      }
    });

    // 정규화 및 필터링
    const normalizedItems = new Map<string, number>();
    
    detectedItems.forEach((score, item) => {
      const normalizedItem = NORMALIZE_MAPPING[item] || item;
      const currentScore = normalizedItems.get(normalizedItem) || 0;
      normalizedItems.set(normalizedItem, Math.max(currentScore, score));
    });

    // 점수 기준으로 정렬하고 필터링
    const ingredients = Array.from(normalizedItems.entries())
      .filter(([item, score]) => {
        if (score < MIN_CONFIDENCE_SCORE) return false;
        if (EXCLUDE_KEYWORDS.includes(item)) return false;
        return !item.includes(' '); // 단일 단어만 선택
      })
      .sort((a, b) => b[1] - a[1])
      .map(([item]) => item);

    if (ingredients.length === 0) {
      return NextResponse.json({
        ingredients: [],
        message: 'No ingredients detected with high confidence'
      });
    }

    console.log('Final ingredients list:', ingredients);
    return NextResponse.json({ ingredients });

  } catch (error) {
    console.error('Error analyzing image:', error);
    
    if ((error as ApiError).status) {
      const apiError = error as ApiError;
      return NextResponse.json(
        { error: apiError.message },
        { status: apiError.status }
      );
    }

    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack);
    }

    return NextResponse.json(
      { error: 'Failed to analyze image' },
      { status: 500 }
    );
  }
} 