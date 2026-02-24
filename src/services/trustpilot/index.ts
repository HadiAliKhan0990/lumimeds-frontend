import { TRUSTPILOT_CONFIG } from '@/constants/trustpilot';
import { TrustpilotBusinessUnit, TrustpilotReview } from './trustpilotApi';

export interface TrustpilotData {
  businessUnit: TrustpilotBusinessUnit | null;
  reviews: TrustpilotReview[];
}

/**
 * Server-side function to fetch Trustpilot data
 * Following the same pattern as fetchProducts
 */
export async function fetchTrustpilotData(): Promise<TrustpilotData> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const [businessUnitResponse, reviewsResponse] = await Promise.all([
      fetch(`${baseUrl}/api/trustpilot/business-unit?businessUnitId=${TRUSTPILOT_CONFIG.BUSINESS_UNIT_ID}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Always fetch fresh data for server-side rendering
      }),
      fetch(`${baseUrl}/api/trustpilot/reviews?businessUnitId=${TRUSTPILOT_CONFIG.BUSINESS_UNIT_ID}&limit=5&orderBy=createdat.desc`, {
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Always fetch fresh data for server-side rendering
      }),
    ]);


    let businessUnit: TrustpilotBusinessUnit | null = null;
    let reviews: TrustpilotReview[] = [];

    // Handle business unit response
    if (businessUnitResponse.ok) {
      const businessUnitData = await businessUnitResponse.json();
      if (businessUnitData && businessUnitData.id) {
        businessUnit = {
          id: businessUnitData.id,
          name: businessUnitData.name?.identifying || businessUnitData.displayName,
          displayName: businessUnitData.displayName,
          websiteUrl: businessUnitData.websiteUrl,
          numberOfReviews: businessUnitData.numberOfReviews?.total || 0,
          stars: businessUnitData.score?.stars || 0,
          trustScore: businessUnitData.score?.trustScore || 0,
          profileImageUrl: '', // Not provided in this API response
          isVerified: businessUnitData.status === 'active',
          isClaimed: businessUnitData.status === 'active',
        };
      }
    } else {
      console.error('Failed to fetch business unit:', businessUnitResponse.status, businessUnitResponse.statusText);
    }

    // Handle reviews response
    if (reviewsResponse.ok) {
      const reviewsData = await reviewsResponse.json();
      // Handle different response formats
      if (Array.isArray(reviewsData)) {
        reviews = reviewsData;
      } else if (reviewsData && reviewsData.reviews && Array.isArray(reviewsData.reviews)) {
        reviews = reviewsData.reviews;
      } else if (reviewsData && reviewsData.data && Array.isArray(reviewsData.data)) {
        reviews = reviewsData.data;
      }
    } else {
      console.error('Failed to fetch reviews:', reviewsResponse.status, reviewsResponse.statusText);
    }

    return {
      businessUnit,
      reviews,
    };
  } catch (error) {
    console.error('Failed to fetch Trustpilot data:', error);
    return {
      businessUnit: null,
      reviews: [],
    };
  }
}
