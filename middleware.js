import { NextResponse } from 'next/server';

// MUST use this Edge-compatible syntax
export const config = {
  matcher: '/:path*', // Apply to all paths
};

export function middleware(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const search = url.searchParams;

  // Allow only API paths with required params
  if (pathname === '/api/fetch' && search.has('url')) return NextResponse.next();
  if (pathname === '/api/download' && search.has('id')) return NextResponse.next();

  // Else redirect to main site
  return NextResponse.redirect('https://pindl.blogspot.com/');
}
