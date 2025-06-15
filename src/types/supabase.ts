export interface Database {
  public: {
    Tables: {
      recipe_cache: {
        Row: {
          id: string;
          cache_key: string;
          recipe_data: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          cache_key: string;
          recipe_data: any;
          created_at?: string;
          updated_at: string;
        };
        Update: {
          id?: string;
          cache_key?: string;
          recipe_data?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      unsplash_cache: {
        Row: {
          id: string;
          query: string;
          image_data: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          query: string;
          image_data: any;
          created_at?: string;
          updated_at: string;
        };
        Update: {
          id?: string;
          query?: string;
          image_data?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      dalle_cache: {
        Row: {
          id: string;
          recipe_title: string;
          image_data: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          recipe_title: string;
          image_data: any;
          created_at?: string;
          updated_at: string;
        };
        Update: {
          id?: string;
          recipe_title?: string;
          image_data?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
} 