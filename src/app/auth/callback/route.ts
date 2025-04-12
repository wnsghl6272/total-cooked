import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { RequestCookies } from 'next/dist/server/web/spec-extension/cookies';

export const runtime = 'edge';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/';

  if (code) {
    const response = NextResponse.redirect(new URL(next, request.url));
    const cookieStore = cookies() as unknown as RequestCookies;

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
          set(name, value, options) {
            response.cookies.set({ name, value, ...options });
          },
          remove(name, options) {
            response.cookies.delete(name);
          },
        },
      }
    );
    
    try {
      await supabase.auth.exchangeCodeForSession(code);
      return response;
    } catch (error) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(new URL('/auth/error', request.url));
    }
  }

  return NextResponse.redirect(new URL(next, request.url));
} 