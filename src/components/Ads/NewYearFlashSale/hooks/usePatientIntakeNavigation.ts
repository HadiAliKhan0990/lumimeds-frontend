'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ROUTES } from '@/constants';
import { showToast } from '@/lib/toast';

export function usePatientIntakeNavigation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const handleNavigation = async () => {
    setIsLoading(true);

    try {
      // Preserve existing query params and add sale_type=flash_sale
      const params = new URLSearchParams();
      
      // Copy existing params
      const overrideTime = searchParams.get('overrideTime');
      if (overrideTime) params.set('overrideTime', overrideTime);
      
      // Always add sale_type=flash_sale for flash sale page
      params.set('sale_type', 'flash_sale');
      
      const url = `${ROUTES.PATIENT_INTAKE}?${params.toString()}`;
      await router.push(url);
    } catch (error) {
      console.error('Navigation error:', error);
      showToast({
        title: 'Navigation Error',
        message: 'Unable to navigate. Please try again.',
        type: 'error',
      });
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleNavigation,
  };
}
