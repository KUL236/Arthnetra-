import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/';
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // If there's an OAuth error, redirect to auth with error
  if (error) {
    const authUrl = new URL('/auth', requestUrl.origin);
    authUrl.searchParams.set('error', errorDescription ?? error);
    return NextResponse.redirect(authUrl);
  }

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      // Successful auth — redirect to dashboard (or next param)
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }

    const authUrl = new URL('/auth', requestUrl.origin);
    authUrl.searchParams.set('error', 'Authentication failed. Please try again.');
    return NextResponse.redirect(authUrl);
  }

  // No code — redirect to auth
  return NextResponse.redirect(new URL('/auth', requestUrl.origin));
}
