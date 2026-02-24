'use client';

import GoogleShoppingPage from '@/components/Ads/GoogleShopping';
import GoogleShoppingTryPage from '@/components/Ads/GoogleShoppingTry';
import { useGoogleMerchantConfig } from '@/hooks/useGoogleMerchantConfig';
import { ProductType } from '@/store/slices/productTypeSlice';

interface Props {
  product: ProductType;
}

export default function GoogleShopping({ product }: Readonly<Props>) {
  const { isTrySubdomain } = useGoogleMerchantConfig();
  
  return (isTrySubdomain
    ? <GoogleShoppingTryPage product={product} />
    : <GoogleShoppingPage product={product} />
  );
}
