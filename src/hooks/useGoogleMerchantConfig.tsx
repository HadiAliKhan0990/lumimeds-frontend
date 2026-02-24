'use client';
import { useSearchParams } from 'next/navigation';
import { GOOGLE_MERCHANT_SOURCE } from '@/constants';
import { useTrySubdomainDetection } from './useTrySubdomainDetection';

export const useGoogleMerchantConfig = () => {
  const params = useSearchParams();
  const source = params.get('source') ?? '';
  const isTrySubdomain = useTrySubdomainDetection();
  
  const isGoogleMerchant = source === GOOGLE_MERCHANT_SOURCE;

  const renderTextWRTGoogleMerchant = ({text, googleMerchantText}: {text: string, googleMerchantText: string}) => {
    return isGoogleMerchant ? googleMerchantText : text;
  };

  return {
    isGoogleMerchant,
    renderTextWRTGoogleMerchant,
    source,
    isTrySubdomain,
  };
};
