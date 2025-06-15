import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { RequestCookies } from 'next/dist/server/web/spec-extension/cookies';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const next = request.nextUrl.searchParams.get('next') ?? '/';

  if (code) {
    const response = NextResponse.redirect(new URL(next, request.nextUrl.origin));
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
      console.log('Exchanging code for session...', { code });
      
      // Get the code verifier cookie
      const codeVerifier = cookieStore.get('code_verifier')?.value;
      console.log('Code verifier from cookie:', codeVerifier);
      
      if (!codeVerifier) {
        throw new Error('No code verifier found in cookies');
      }

      const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Error in exchangeCodeForSession:', error);
        throw error;
      }
      
      if (!session) {
        console.error('No session returned after code exchange');
        throw new Error('No session returned');
      }

      console.log('Session exchange successful', { 
        user: session.user.id,
        expires_at: session.expires_at
      });
      
      // Clean up the code verifier cookie
      response.cookies.delete('code_verifier');
      
      return response;
    } catch (error) {
      console.error('Error exchanging code for session:', error);
      // Clear any partial session data
      response.cookies.delete('sb-access-token');
      response.cookies.delete('sb-refresh-token');
      response.cookies.delete('code_verifier');
      
      // Add error details to the redirect URL
      const errorUrl = new URL('/auth/error', request.nextUrl.origin);
      if (error instanceof Error) {
        errorUrl.searchParams.set('message', error.message);
      }
      return NextResponse.redirect(errorUrl);
    }
  }

  return NextResponse.redirect(new URL(next, request.nextUrl.origin));
} 