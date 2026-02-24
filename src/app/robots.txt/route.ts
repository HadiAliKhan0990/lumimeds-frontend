import { NextResponse } from 'next/server';

export async function GET() {
  const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.lumimeds.com';
  
  const robotsContent = allowIndexing
    ? `User-agent: *
Disallow: /_next/*
Disallow: /api/*
Disallow: /checkout
Disallow: /checkout/*
Disallow: /forgot-password
Sitemap: ${baseUrl}/lumimed-sitemap.xml`
    : `User-agent: *
Disallow: /`;

  return new NextResponse(robotsContent, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
