// middleware.js
import { NextResponse } from 'next/server';

export function middleware(req) {
  const { pathname, searchParams } = new URL(req.url);

  // Allow API routes to continue
  if (pathname.startsWith('/api/fetch') && searchParams.has('url')) return;
  if (pathname.startsWith('/api/download') && searchParams.has('id')) return;

  // Otherwise redirect to your main website
  return NextResponse.redirect("https://pindl.blogspot.com/");
}
