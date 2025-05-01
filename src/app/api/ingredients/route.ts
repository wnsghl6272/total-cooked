import { NextResponse } from 'next/server';

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
const BASE_URL = 'https://api.spoonacular.com/food/ingredients';

// 기본 재료 목록
const COMMON_INGREDIENTS = [
  'salt', 'pepper', 'olive oil', 'garlic', 'onion', 'tomato', 'potato', 'carrot',
  'chicken', 'beef', 'pork', 'rice', 'pasta', 'egg', 'milk', 'butter', 'cheese',
  'flour', 'sugar', 'bread', 'lettuce', 'cucumber', 'mushroom', 'lemon', 'ginger'
];

interface IngredientSuggestion {
  name: string;
  image: string;
  id: number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query')?.toLowerCase();

  if (!query) {
    return NextResponse.json({ suggestions: [] });
  }

  // 로컬에서 먼저 검색
  const localSuggestions = COMMON_INGREDIENTS.filter(ingredient => 
    ingredient.toLowerCase().includes(query)
  );

  // 로컬에서 결과를 찾았다면 API 호출 없이 반환
  if (localSuggestions.length > 0) {
    return NextResponse.json({ suggestions: localSuggestions });
  }

  // API 키가 없는 경우 사용자 입력을 그대로 반환
  if (!SPOONACULAR_API_KEY) {
    console.warn('Spoonacular API key not configured, returning user input');
    return NextResponse.json({ suggestions: [query] });
  }

  try {
    // Spoonacular API의 ingredient autocomplete 엔드포인트 사용
    const response = await fetch(
      `${BASE_URL}/autocomplete?apiKey=${SPOONACULAR_API_KEY}&query=${encodeURIComponent(query)}&number=5&metaInformation=true`
    );

    if (!response.ok) {
      console.error('Spoonacular API error:', await response.text());
      // API 호출 실패 시 사용자 입력을 그대로 반환
      return NextResponse.json({ suggestions: [query] });
    }

    const data: IngredientSuggestion[] = await response.json();
    
    // 이름만 추출하여 반환
    const suggestions = data.map(item => item.name);
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error fetching ingredient suggestions:', error);
    // 에러 발생 시 사용자 입력을 그대로 반환
    return NextResponse.json({ suggestions: [query] });
  }
} 