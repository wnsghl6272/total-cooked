import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Helper function to set cookie with appropriate security settings
const setCookie = (name: string, value: string, maxAge: number = 3600) => {
  const secure = process.env.NODE_ENV === 'production' ? 'secure; ' : '';
  const cookieString = `${name}=${value}; path=/; max-age=${maxAge}; ${secure}samesite=lax`;
  document.cookie = cookieString;
  console.log('Setting cookie:', { name, cookieString });
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
}); 