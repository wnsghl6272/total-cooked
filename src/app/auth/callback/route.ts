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
            response.cookies.set({
              name,
              value,
              ...options,
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 60 * 60 * 24 * 7, // 7 days
              path: '/',
            });
          },
          remove(name) {
            response.cookies.delete(name);
          },
        },
      }
    );
    
    try {
      console.log('Exchanging code for session...');
      const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) throw error;
      
      if (!session) {
        console.error('No session returned after code exchange');
        throw new Error('No session returned');
      }

      console.log('Session exchange successful');
      return response;
    } catch (error) {
      console.error('Error exchanging code for session:', error);
      // Clear any partial session data
      response.cookies.delete('sb-access-token');
      response.cookies.delete('sb-refresh-token');
      return NextResponse.redirect(new URL('/auth/error', request.url));
    }
  }

  return NextResponse.redirect(new URL(next, request.url));
} 