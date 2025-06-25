import { NextResponse } from 'next/server';

export const config = {
  matcher: '/:path*', // Apply to all routes
};

export function middleware(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const params = url.searchParams;

  // Allow only fetch & download API paths with required query param
  if (pathname === '/api/fetch' && params.has('url')) return NextResponse.next();
  if (pathname === '/api/download' && params.has('id')) return NextResponse.next();

  // All other requests — redirect
  return NextResponse.redirect('https://your-site.blogspot.com');
}
