import CheckoutForm from '@/components/Checkout/CheckoutForm';
import CheckoutTryForm from '@/components/CheckoutTry/CheckoutForm';
import { GOOGLE_MERCHANT_SOURCE, ROUTES } from '@/constants';
import { getCheckoutData } from '@/services/checkout';
import { fetchTrustpilotData } from '@/services/trustpilot';
import { redirect } from 'next/navigation';

export const revalidate = 0;

interface SearchParams {
  priceId?: string;
  flow?: string;
  source?: string;
  couponCode?: string;
  overrideTime?: string;
  sale_type?: string;
}

interface Props {
  params: Promise<{ token: string }>;
  searchParams: Promise<SearchParams>;
}

export default async function CheckoutPage({ params, searchParams }: Readonly<Props>) {
  const { token } = await params;

  const [{ priceId, flow, source, couponCode, overrideTime, sale_type }, result, trustpilotData] = await Promise.all([
    searchParams,
    getCheckoutData(token),
    fetchTrustpilotData(),
  ]);

  const isGoogleMerchant = source === GOOGLE_MERCHANT_SOURCE;
  const checkoutToken = result?.token ?? token ?? '';

  // Build redirect URL with preserved query params
  const buildRedirectUrl = () => {
    const baseUrl = source === 'google-merchant'
      ? ROUTES.PRODUCT_SUMMARY_GOOGLE_MERCHANT
      : ROUTES.PRODUCT_SUMMARY;

    const params = new URLSearchParams();
    params.set('error', 'checkout_token_expired');
    if (source === 'google-merchant') params.set('source', 'google-merchant');
    if (sale_type) params.set('sale_type', sale_type);
    if (overrideTime === 'true') params.set('overrideTime', 'true');

    return `${baseUrl}?${params.toString()}`;
  };

  const redirectUrl = buildRedirectUrl();

  if (!checkoutToken) {
    console.log("CHECKOUT TOKEN in CHECKOUT PAGE IS NOT VALID ===>", checkoutToken);
    redirect(redirectUrl);
  }

  return (isGoogleMerchant
    ? (
      <CheckoutTryForm
        token={checkoutToken}
        priceId={priceId}
        trustpilotData={trustpilotData}
        checkoutData={result}
        flow={flow}
        source={source}
        couponCode={couponCode}
        overrideTime={overrideTime === 'true'}
      />
    ) : (
      <CheckoutForm
        token={checkoutToken}
        priceId={priceId}
        trustpilotData={trustpilotData}
        checkoutData={result}
        flow={flow}
        source={source}
        couponCode={couponCode}
        overrideTime={overrideTime === 'true'}
      />
    )
  );
}
