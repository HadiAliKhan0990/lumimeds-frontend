import { fetcher } from '@/lib/fetcher';
import { PatientSurveysResponse, SingleSurveyResponse } from '@/store/slices/surveysApiSlice';
import { fetchProducts } from '@/services/products';
import { extractSurveyId } from '@/helpers/products';
import { PatientDataForRenewalSurveyResponse } from './types';
import { getProductKeysForCategory, SurveyCategory } from '@/constants/productCategories';

interface FetchSurveyOptions {
  surveyId?: string;
  category?: SurveyCategory;
}

export async function fetchSurveyFromProductList(options?: FetchSurveyOptions): Promise<SingleSurveyResponse> {
  const resolvedSurveyId = await getSurveyIdSafely(options);

  const survey = await fetcher<SingleSurveyResponse>(`/surveys/${resolvedSurveyId}`);
  return survey;
}

/**
 * Safely extracts survey ID from product list without throwing errors
 * @param options Optional survey ID or category to determine which products to fetch
 * @returns Survey ID string or empty string if not found
 */
export async function getSurveyIdSafely(options?: FetchSurveyOptions): Promise<string> {
  try {
    const { surveyId, category } = options || {};

    // If surveyId is provided, return it
    if (surveyId && typeof surveyId === 'string') {
      return surveyId;
    }

    // Get product keys based on category (defaults to weight_loss)
    const keys = getProductKeysForCategory(category || 'weight_loss');

    if (!keys) {
      console.warn(`No product keys found for category: ${category}`);
      return '';
    }

    // Fetch products and extract survey ID
    const data = await fetchProducts({ keys });
    return extractSurveyId(data);
  } catch (error) {
    console.warn('Error getting survey ID safely:', error);
    return '';
  }
}

export async function fetchGeneralSurvey(
  surveyId: string,
  queryParams?: { email?: string; preventClose?: string; submitted?: string }
): Promise<PatientSurveysResponse['data'] | undefined> {
  try {
    const { data } = await fetcher<PatientSurveysResponse>(`/surveys/general-survey/${surveyId}`, {
      params: queryParams as Record<string, string>,
    });
    return data;
  } catch (error) {
    console.log('Failed to fetch general survey:', error);
    return undefined;
  }
}

export async function fetchPatientDataForRenewalSurvey(
  surveyToken: string
): Promise<PatientDataForRenewalSurveyResponse['data'] | undefined> {
  try {
    const { data } = await fetcher<PatientDataForRenewalSurveyResponse>(`/patients/renewal-data/${surveyToken}`);
    return data;
  } catch {
    return undefined;
  }
}
