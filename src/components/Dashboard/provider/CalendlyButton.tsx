'use client';

import toast from 'react-hot-toast';
import { useSearchParams, useRouter } from 'next/navigation';
import { useConnectCalendlyMutation } from '@/store/slices/calendlyApiSlice';
import { updateCalendlyStatus } from '@/store/slices/calendlySlice';
import { getCalendlyAuthUrl } from '@/lib/calendly';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { ROUTES } from '@/constants';
import { shouldHideCalendlyFeature } from '@/helpers/featureFlags';

export default function CalendlyButton() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const [connectCalendly] = useConnectCalendlyMutation();

  // Get Calendly status from Redux store
  const providerProfile = useSelector((state: RootState) => state.user);
  const calendlyState = useSelector((state: RootState) => state.calendly);
  const calendlyStatus = calendlyState.status;
  const isCalendlyLoaded = calendlyState.isLoaded;

  const isCalendlyDisabled = shouldHideCalendlyFeature(providerProfile?.email);

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state'); // This will be the doctor ID

    if (error) {
      toast.error('Failed to connect to Calendly: ' + error);
      // Clean up URL parameters
      router.replace(ROUTES.PROVIDER_HOME);
      return;
    }

    if (code && state && providerProfile?.id) {
      connectCalendly({ code, doctorId: state })
        .unwrap()
        .then((response) => {
          // Update Redux store with new status
          dispatch(updateCalendlyStatus(response));
          toast.success('Successfully connected to Calendly!');
          // Clean up URL parameters and stay on current page
          router.replace(ROUTES.PROVIDER_HOME);
        })
        .catch((error) => {
          console.error('Calendly connection error:', error);
          toast.error('Failed to connect to Calendly');
          // Clean up URL parameters
          router.replace(ROUTES.PROVIDER_HOME);
        });
    }
  }, [searchParams, connectCalendly, router, providerProfile?.id]);

  const handleCalendlyRegistration = () => {
    if (!providerProfile?.id) {
      toast.error('Doctor ID not available');
      return;
    }
    const authUrl = getCalendlyAuthUrl(providerProfile.id);
    window.location.href = authUrl;
  };

  // Hide button if Calendly feature is disabled
  if (isCalendlyDisabled) {
    return null;
  }

  return (
    <>
      {isCalendlyLoaded && !calendlyStatus?.authorized ? (
        <button type='button' className='btn w-100 btn-primary text-nowrap' onClick={handleCalendlyRegistration}>
          Connect Calendly
        </button>
      ) : null}
    </>
  );
}
