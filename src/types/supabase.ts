export interface RecipeData {
  title: string;
  description: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  ingredients: Array<{
    name: string;
    amount: string;
    unit: string;
  }>;
  instructions: Array<{
    step: number;
    text: string;
  }>;
  nutritionFacts?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  tips?: string[];
}

export interface ImageData {
  id: string;
  url: string;
  alt_description: string;
  prompt?: string;
  created_at: string;
}

export interface UnsplashImageData {
  id: string;
  urls: {
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string;
  user: {
    name: string;
  };
}

export interface Database {
  public: {
    Tables: {
      recipe_cache: {
        Row: {
          id: string;
          cache_key: string;
          recipe_data: RecipeData;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          cache_key: string;
          recipe_data: RecipeData;
          created_at?: string;
          updated_at: string;
        };
        Update: {
          id?: string;
          cache_key?: string;
          recipe_data?: RecipeData;
          created_at?: string;
          updated_at?: string;
        };
      };
      unsplash_cache: {
        Row: {
          id: string;
          query: string;
          image_data: UnsplashImageData;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          query: string;
          image_data: UnsplashImageData;
          created_at?: string;
          updated_at: string;
        };
        Update: {
          id?: string;
          query?: string;
          image_data?: UnsplashImageData;
          created_at?: string;
          updated_at?: string;
        };
      };
      dalle_cache: {
        Row: {
          id: string;
          recipe_title: string;
          image_data: ImageData;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          recipe_title: string;
          image_data: ImageData;
          created_at?: string;
          updated_at: string;
        };
        Update: {
          id?: string;
          recipe_title?: string;
          image_data?: ImageData;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
} 