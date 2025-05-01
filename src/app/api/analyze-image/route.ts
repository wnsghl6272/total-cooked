import { NextResponse } from 'next/server';
import vision, { protos } from '@google-cloud/vision';
import { writeFileSync } from 'fs';
import { join } from 'path';
import os from 'os';

// Google Cloud Vision client initialization
let client: vision.ImageAnnotatorClient;

if (process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64) {
  // Decode base64 credentials
  const credentials = Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64, 'base64').toString();
  const credentialsJson = JSON.parse(credentials);
  
  // Initialize client with credentials JSON
  client = new vision.ImageAnnotatorClient({
    credentials: credentialsJson
  });
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  // Fallback to file-based credentials for local development
  client = new vision.ImageAnnotatorClient({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  });
} else {
  throw new Error('No Google Cloud credentials provided');
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
  // 필요한 매핑을 계속 추가할 수 있습니다
};

export async function POST(request: Request) {
  console.log('Received image analysis request');
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      console.log('No image file provided in request');
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    console.log('Image file received:', file.name, file.type, file.size);

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    console.log('File converted to buffer, size:', buffer.length);

    // Perform both label detection and object localization
    console.log('Calling Google Vision API...');
    const [labelResult] = await client.labelDetection({
      image: { content: buffer },
    });

    // Check if client.objectLocalization exists before calling
    const [objectResult] = client.objectLocalization
      ? await client.objectLocalization({
          image: { content: buffer },
        })
      : [{ localizedObjectAnnotations: [] }];

    // Combine and process results
    const labels = labelResult.labelAnnotations || [];
    const objects = objectResult.localizedObjectAnnotations || [];

    console.log('Raw labels from Vision API:', labels);
    console.log('Raw objects from Vision API:', objects);

    // Combine all detected items with scores
    const detectedItems = new Map<string, number>();

    // Add labels with scores
    labels.forEach((label: protos.google.cloud.vision.v1.IEntityAnnotation) => {
      if (label.score && label.description) {
        const desc = label.description.toLowerCase();
        if (!EXCLUDE_KEYWORDS.includes(desc)) {
          // 이미 있는 경우 더 높은 점수로 업데이트
          const currentScore = detectedItems.get(desc) || 0;
          detectedItems.set(desc, Math.max(currentScore, label.score));
        }
      }
    });

    // Add detected objects with scores
    objects.forEach((obj: protos.google.cloud.vision.v1.ILocalizedObjectAnnotation) => {
      if (obj.score && obj.name) {
        const name = obj.name.toLowerCase();
        if (!EXCLUDE_KEYWORDS.includes(name)) {
          // 이미 있는 경우 더 높은 점수로 업데이트
          const currentScore = detectedItems.get(name) || 0;
          detectedItems.set(name, Math.max(currentScore, obj.score));
        }
      }
    });

    // 정규화 및 필터링
    const normalizedItems = new Map<string, number>();
    
    detectedItems.forEach((score, item) => {
      // 단수/복수 정규화
      const normalizedItem = NORMALIZE_MAPPING[item] || item;
      
      // 이미 있는 경우 더 높은 점수로 업데이트
      const currentScore = normalizedItems.get(normalizedItem) || 0;
      normalizedItems.set(normalizedItem, Math.max(currentScore, score));
    });

    // 점수 기준으로 정렬하고 필터링
    const ingredients = Array.from(normalizedItems.entries())
      .filter(([item, score]) => {
        // 점수가 0.8 이상인 항목만 선택
        if (score < 0.8) return false;
        
        // 제외 키워드 체크
        if (EXCLUDE_KEYWORDS.includes(item)) return false;
        
        // 일반적인 식재료 단어 체크
        const isSingleWord = !item.includes(' ');
        
        return isSingleWord;
      })
      .sort((a, b) => b[1] - a[1]) // 점수 기준 내림차순 정렬
      .map(([item]) => item); // 아이템 이름만 추출

    console.log('Final ingredients list:', ingredients);

    return NextResponse.json({ ingredients });
  } catch (error) {
    console.error('Error analyzing image:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack);
    }
    return NextResponse.json(
      { error: 'Failed to analyze image' },
      { status: 500 }
    );
  }
} 