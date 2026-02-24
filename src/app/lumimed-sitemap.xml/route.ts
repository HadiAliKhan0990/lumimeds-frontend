import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Get the base URL from environment variable or fallback to request origin
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
  const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true';

  // Only generate sitemap if indexing is allowed
  if (!allowIndexing) {
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>',
      {
        headers: {
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
      }
    );
  }

  const now = new Date().toISOString();

  // Core pages that should be indexed
  const pages = [
    {
      url: '/',
      lastModified: now,
      changeFrequency: 'daily',
      priority: '1.0',
    },
    {
      url: '/products',
      lastModified: now,
      changeFrequency: 'weekly',
      priority: '0.8',
    },
    {
      url: '/products/glp-1-plans',
      lastModified: now,
      changeFrequency: 'weekly',
      priority: '0.7',
    },
    {
      url: '/products/glp-1-gip-plans',
      lastModified: now,
      changeFrequency: 'weekly',
      priority: '0.7',
    },
    {
      url: '/faqs',
      lastModified: now,
      changeFrequency: 'weekly',
      priority: '0.8',
    },
    {
      url: '/privacy-policy',
      lastModified: now,
      changeFrequency: 'monthly',
      priority: '0.5',
    },
    {
      url: '/terms-of-use',
      lastModified: now,
      changeFrequency: 'monthly',
      priority: '0.5',
    },
    {
      url: '/terms-and-conditions',
      lastModified: now,
      changeFrequency: 'monthly',
      priority: '0.5',
    },
    {
      url: '/job',
      lastModified: now,
      changeFrequency: 'weekly',
      priority: '0.6',
    },
    {
      url: '/patient/login',
      lastModified: now,
      changeFrequency: 'monthly',
      priority: '0.6',
    },
    {
      url: '/admin/login',
      lastModified: now,
      changeFrequency: 'monthly',
      priority: '0.6',
    },
    {
      url: '/provider/login',
      lastModified: now,
      changeFrequency: 'monthly',
      priority: '0.6',
    },
  ];

  // Dosing guide pages that should be indexed
  const dosingGuidePages = [
    '/dosing-guide/1st-choice',
    '/dosing-guide/drug-crafters',
    '/dosing-guide/mfv',
    '/dosing-guide/northwest',
    '/dosing-guide/olympia',
    '/dosing-guide/premierRX',
  ];

  // Add dosing guide pages to sitemap
  for (const url of dosingGuidePages) {
    pages.push({
      url,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: '0.5',
    });
  }

  // Ad pages that should be indexed (all 28 ad pages)
  const adPages = [
    '/ad/easy-weight-loss',
    '/ad/for-women',
    '/ad/free',
    '/ad/glow-up',
    '/ad/glp1-gip-treatment',
    '/ad/glp1-program',
    '/ad/healthy-weight-loss',
    '/ad/how-to-start',
    '/ad/journey',
    '/ad/starter-pack',
    '/ad/med-spa',
    '/ad/med-spa1',
    '/ad/med-spa2',
    '/ad/med-spa3',
    '/ad/medical-weight-loss',
    '/ad/redefined',
    '/ad/science',
    '/ad/sem',
    '/ad/stay-on-track',
    '/ad/sustainable-weight-loss',
    '/ad/sustained',
    '/ad/tirz',
    '/ad/weight-loss',
    '/ad/weight-loss-treatment',
    '/ad/best-weight-loss-medication',
    '/ad/weight-loss-goals',
    '/ad/holiday-weight-goals',
    '/ad/starter-pack',
    '/ad/longevity-nad',
    '/ad/new-year-new-you',
    '/ad/weight-loss-medications-options'
  ];

  // Add ad pages to sitemap
  for (const url of adPages) {
    pages.push({
      url,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: '0.6',
    });
  }

  // Generate XML sitemap
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastModified}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
