import { NextRequest, NextResponse } from 'next/server';
import { TRUSTPILOT_CONFIG } from '@/constants/trustpilot';

interface Reply {
  text: string;
  createdAt: string;
}

interface Review {
  id: string;
  businessUnitId: string;
  consumerId: string;
  consumerName: string;
  consumerEmail: string;
  stars: number;
  title: string;
  text: string;
  language: string;
  createdAt: string;
  updatedAt: string;
  isVerified: boolean;
  isRecommended: boolean;
  helpful: number;
  unhelpful: number;
  reply?: Reply;
}

interface TrustpilotWidgetResponse {
  businessUnit?: { id?: string };
  reviews?: Array<{
    id?: string;
    reviewUrl?: string;
    consumer?: {
      id?: string;
      displayName?: string;
      email?: string;
    };
    stars?: number;
    title?: string;
    text?: string;
    language?: string;
    createdAt?: string;
    verification?: { isVerified?: boolean };
    helpful?: number;
    unhelpful?: number;
    reply?: {
      text?: string;
      createdAt?: string;
    };
  }>;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessUnitId = searchParams.get('businessUnitId') || TRUSTPILOT_CONFIG.BUSINESS_UNIT_ID;
    const limit = searchParams.get('limit') || '5';
    const stars = searchParams.get('stars');
    const locale = searchParams.get('locale') || 'en-US';
    const reviewLanguages = searchParams.get('reviewLanguages') || 'en';
    const templateId = searchParams.get('templateId') || TRUSTPILOT_CONFIG.TEMPLATE_ID.en;

    
    const queryParams = new URLSearchParams({
      businessUnitId,
      locale,
      reviewLanguages,
      includeReviews: 'true',
      reviewsPerPage: limit,
    });

    if (stars) queryParams.append('reviewStars', stars);

    const url = `https://widget.trustpilot.com/trustbox-data/${templateId}?${queryParams}`;

    const response = await fetch(url, { headers: { 'Content-Type': 'application/json' }, cache: 'no-store' });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Trustpilot Widget API Error Response:', errorText);
      throw new Error(`Trustpilot widget API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data: TrustpilotWidgetResponse = await response.json();

    if (data?.reviews && Array.isArray(data.reviews)) {
      const transformedReviews: Review[] = data.reviews.map(review => ({
        id: review.id || (review.reviewUrl?.split('/').pop() ?? ''),
        businessUnitId: data.businessUnit?.id || businessUnitId,
        consumerId: review.consumer?.id || '',
        consumerName: review.consumer?.displayName || '',
        consumerEmail: review.consumer?.email || '',
        stars: review.stars || 0,
        title: review.title || '',
        text: review.text || '',
        language: review.language || 'en',
        createdAt: review.createdAt || '',
        updatedAt: review.createdAt || '',
        isVerified: review.verification?.isVerified || false,
        isRecommended: (review.stars ?? 0) >= 4,
        helpful: review.helpful || 0,
        unhelpful: review.unhelpful || 0,
        reply: review.reply ? { text: review.reply.text || '', createdAt: review.reply.createdAt || '' } : undefined,
      }));

      return NextResponse.json({ reviews: transformedReviews });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Trustpilot reviews API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
