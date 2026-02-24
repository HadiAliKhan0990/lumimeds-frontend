import { TRUSTPILOT_CONFIG } from '@/constants/trustpilot';

// Trustpilot API Types
export interface TrustpilotReview {
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
  reply?: {
    text: string;
    createdAt: string;
  };
}

export interface TrustpilotBusinessUnit {
  id: string;
  name: string;
  displayName: string;
  websiteUrl: string;
  numberOfReviews: number;
  stars: number;
  trustScore: number;
  profileImageUrl: string;
  isVerified: boolean;
  isClaimed: boolean;
}

export interface TrustpilotApiResponse<T> {
  data: T;
  links: Array<{
    href: string;
    rel: string;
  }>;
}

// Internal API response types
interface TrustpilotBusinessUnitResponse {
  id: string;
  name?: {
    identifying?: string;
  };
  displayName: string;
  websiteUrl: string;
  numberOfReviews?: {
    total?: number;
  };
  score?: {
    stars?: number;
    trustScore?: number;
  };
  status: string;
}

interface TrustpilotReviewsResponse {
  reviews?: TrustpilotReview[];
  data?: TrustpilotReview[];
}

class TrustpilotApiService {
  private async makeInternalRequest<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(endpoint, globalThis.location.origin);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.append(key, value);
      }
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Get business unit information
  async getBusinessUnit(businessUnitId: string = TRUSTPILOT_CONFIG.BUSINESS_UNIT_ID): Promise<TrustpilotBusinessUnit> {
    const response = await this.makeInternalRequest<TrustpilotBusinessUnitResponse>('/api/trustpilot/business-unit', {
      businessUnitId,
    });

    // Transform the actual Trustpilot API response to our expected format
    return {
      id: response.id || '',
      name: response.name?.identifying || response.displayName || '',
      displayName: response.displayName || '',
      websiteUrl: response.websiteUrl || '',
      numberOfReviews: response.numberOfReviews?.total || 0,
      stars: response.score?.stars || 0,
      trustScore: response.score?.trustScore || 0,
      profileImageUrl: '', // Not provided in this API response
      isVerified: response.status === 'active',
      isClaimed: response.status === 'active',
    };
  }

  // Get reviews for a business unit
  async getReviews(
    businessUnitId: string = TRUSTPILOT_CONFIG.BUSINESS_UNIT_ID,
    limit: number = 5,
    orderBy: 'createdat.desc' | 'createdat.asc' | 'stars.desc' | 'stars.asc' = 'createdat.desc'
  ): Promise<TrustpilotReview[]> {
    const response = await this.makeInternalRequest<TrustpilotReview[] | TrustpilotReviewsResponse>(
      '/api/trustpilot/reviews',
      {
        businessUnitId,
        limit: limit.toString(),
        orderBy,
      }
    );

    // Handle different response formats
    if (response && Array.isArray(response)) {
      return response;
    }

    if (response && typeof response === 'object') {
      if ('reviews' in response && Array.isArray(response.reviews)) {
        return response.reviews;
      }
      if ('data' in response && Array.isArray(response.data)) {
        return response.data;
      }
    }

    return [];
  }

  // Get recent reviews (last 30 days)
  async getRecentReviews(
    businessUnitId: string = TRUSTPILOT_CONFIG.BUSINESS_UNIT_ID,
    limit: number = 5
  ): Promise<TrustpilotReview[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const fromDate = thirtyDaysAgo.toISOString();

    const response = await this.makeInternalRequest<TrustpilotReview[] | TrustpilotReviewsResponse>(
      '/api/trustpilot/reviews',
      {
        businessUnitId,
        limit: limit.toString(),
        fromDate,
        orderBy: 'createdat.desc',
      }
    );

    // Handle different response formats
    if (response && Array.isArray(response)) {
      return response;
    }

    if (response && typeof response === 'object') {
      if ('reviews' in response && Array.isArray(response.reviews)) {
        return response.reviews;
      }
      if ('data' in response && Array.isArray(response.data)) {
        return response.data;
      }
    }

    return [];
  }

  // Get 5-star reviews only
  async getFiveStarReviews(
    businessUnitId: string = TRUSTPILOT_CONFIG.BUSINESS_UNIT_ID,
    limit: number = 5
  ): Promise<TrustpilotReview[]> {
    const response = await this.makeInternalRequest<TrustpilotReview[] | TrustpilotReviewsResponse>(
      '/api/trustpilot/reviews',
      {
        businessUnitId,
        limit: limit.toString(),
        stars: '5',
        orderBy: 'createdat.desc',
      }
    );

    // Handle different response formats
    if (response && Array.isArray(response)) {
      return response;
    }

    if (response && typeof response === 'object') {
      if ('reviews' in response && Array.isArray(response.reviews)) {
        return response.reviews;
      }
      if ('data' in response && Array.isArray(response.data)) {
        return response.data;
      }
    }

    return [];
  }

  // Get review statistics
  async getReviewStats(businessUnitId: string = TRUSTPILOT_CONFIG.BUSINESS_UNIT_ID) {
    const businessUnit = await this.getBusinessUnit(businessUnitId);

    return {
      totalReviews: businessUnit.numberOfReviews,
      averageRating: businessUnit.stars,
      trustScore: businessUnit.trustScore,
      isVerified: businessUnit.isVerified,
    };
  }
}

export const trustpilotApi = new TrustpilotApiService();
