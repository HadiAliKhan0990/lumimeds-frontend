import { getAnalyticsClient } from '@/lib/firebase';
import { SurveyTrackingParams } from '@/types/surveyTracking';
import { logEvent } from 'firebase/analytics';

export async function trackSurveyAnalytics({ event, payload }: SurveyTrackingParams) {
  try {
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const flow = (params?.get('flow') || '').toLowerCase();
    const analytics = await getAnalyticsClient();
    if (analytics) {
      logEvent(analytics, event, { ...payload, flow: flow || 'sfa' });
    }
  } catch (error) {
    console.error('Error tracking survey analytics:', error);
  }
}
