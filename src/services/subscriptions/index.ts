import { fetcher } from '@/lib/fetcher';
import { SubscriptionsData } from '@/store/slices/patientAtiveSubscriptionSlice';
import { ActiveSubscriptionResponse } from '@/store/slices/subscriptionsApiSlice';

export async function getPatientsSubscriptions(): Promise<SubscriptionsData> {
  try {
    const { data } = await fetcher<ActiveSubscriptionResponse>('/patients/subscription', {
      method: 'GET',
    });
    return (
      data || {
        activeSubscriptions: [],
        subscriptionProducts: undefined,
        oneTimeProducts: undefined,
        summary: {
          totalActiveSubscriptions: 0,
          activeSubscriptionsByCategory: {},
        },
      }
    );
  } catch (error) {
    console.log('Failed to get patients subscriptions:', error);
    return {
      activeSubscriptions: [],
      subscriptionProducts: undefined,
      oneTimeProducts: undefined,
      summary: {
        totalActiveSubscriptions: 0,
        activeSubscriptionsByCategory: {},
      },
    };
  }
}
