import { NextRequest, NextResponse } from 'next/server';
import { TRUSTPILOT_CONFIG } from '@/constants/trustpilot';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessUnitId = searchParams.get('businessUnitId') || TRUSTPILOT_CONFIG.BUSINESS_UNIT_ID;
    const locale = searchParams.get('locale') || 'en-US';
    const reviewLanguages = searchParams.get('reviewLanguages') || 'en';
    const templateId = searchParams.get('templateId') || TRUSTPILOT_CONFIG.TEMPLATE_ID.en;

    // Use the public widget data endpoint (no authentication required)
    // This endpoint returns both business unit info and reviews
    const queryParams = new URLSearchParams({
      businessUnitId,
      locale,
      reviewLanguages,
      includeReviews: 'true',
      reviewsPerPage: '1', // We only need the business unit data, not all reviews
    });

    const url = `https://widget.trustpilot.com/trustbox-data/${templateId}?${queryParams}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Don't cache external API calls
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Trustpilot Widget API Error Response:', errorText);
      throw new Error(`Trustpilot widget API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    // Transform the widget data response to match expected business unit format
    // The widget endpoint returns: { businessUnit: { stars, trustScore, displayName, numberOfReviews, websiteUrl, identifyingName }, ... }
    if (data && data.businessUnit) {
      const businessUnit = data.businessUnit;
      return NextResponse.json({
        id: businessUnit.id || businessUnitId,
        displayName: businessUnit.displayName || businessUnit.identifyingName || '',
        name: {
          identifying: businessUnit.identifyingName || businessUnit.displayName || '',
        },
        websiteUrl: businessUnit.websiteUrl || '',
        numberOfReviews: {
          total: businessUnit.numberOfReviews?.total || 0,
          oneStar: businessUnit.numberOfReviews?.oneStar || 0,
          twoStars: businessUnit.numberOfReviews?.twoStars || 0,
          threeStars: businessUnit.numberOfReviews?.threeStars || 0,
          fourStars: businessUnit.numberOfReviews?.fourStars || 0,
          fiveStars: businessUnit.numberOfReviews?.fiveStars || 0,
        },
        score: {
          stars: businessUnit.stars || 0,
          trustScore: businessUnit.trustScore || 0,
        },
        status: 'active', // Widget API doesn't provide status, defaulting to active
      });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Trustpilot business unit API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business unit data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
