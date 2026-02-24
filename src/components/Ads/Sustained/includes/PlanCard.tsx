import { useMemo, useTransition } from 'react';
import Image, { StaticImageData } from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { ProductPrice, ProductType } from '@/store/slices/productTypeSlice';
import { trackAddToCart } from '@/lib/tracking';
import { microsoftTrackAddToCart } from '@/helpers/uetTracking';
import { handleVerifyRedirectToCheckout, getRoundedPrice } from '@/helpers/products';
import { useRouter } from 'next/navigation';
import { Spinner } from 'react-bootstrap';
import { GLP1_GIP_PRODUCT_NAME, GLP1_GIP_LABEL } from '@/constants/factory';

interface PlanCardProps {
  product: ProductType;
  footnote?: string;
  imageAlt?: string;
  fallbackImage?: StaticImageData;
}

function getActivePriceAmount(product: ProductType): number {
  const activePrice = product.prices?.find((p: ProductPrice) => p.isActive);
  return activePrice ? activePrice.amount : 0;
}

export default function PlanCard({ product, footnote, imageAlt, fallbackImage }: Readonly<PlanCardProps>) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [isPending, startTransition] = useTransition();

  const selectedProduct = useSelector((state: RootState) => state.productType);
  const checkout = useSelector((state: RootState) => state.checkout);
  const { isSurveyCompleted, checkoutUser } = checkout || {};

  const config = useMemo(() => {
    const amount = getActivePriceAmount(product);
    const isValue =
      product.metadata?.intervalCount === 3 || (product.durationText || '').toLowerCase().includes('3-month');

    const perMonthDisplay = isValue ? product.dividedAmount : amount;
    const imageSrc = (isValue ? fallbackImage : product.image || fallbackImage) as string | StaticImageData;

    return {
      isValue,
      perMonthDisplay,
      upfront: amount,
      imageSrc,
      bullets: product.bulletDescription || [],
    };
  }, [product]);

  async function handleGetStarted() {
    trackAddToCart({
      itemId: product.id ?? '',
      itemName: product.name ?? '',
      value: getActivePriceAmount(product),
    });

    // Microsoft UET AddToCart tracking
    microsoftTrackAddToCart(product.id ?? '', product.name ?? '', getActivePriceAmount(product), 'USD');

    await handleVerifyRedirectToCheckout({
      selectedProduct,
      product,
      dispatch,
      startTransition,
      router,
      isSurveyCompleted,
      checkoutUser,
    });
  }

  return (
    <div className='product-card plan-card rounded-4 p-4 p-md-5 h-100 d-flex flex-column'>
      <div className='card-media mb-3 mb-md-4'>
        {config.imageSrc && (
          <Image
            src={config.imageSrc}
            alt={imageAlt || product.name || `${GLP1_GIP_PRODUCT_NAME} ${GLP1_GIP_LABEL} vial`}
            width={320}
            height={320}
            className={`tw-mx-auto tw-object-contain ${
              footnote == 'Maximum flexibility with minimum commitment.' ? 'single-img' : 'triple-img'
            }`}
          />
        )}
      </div>

      <div className='card-body p-0'>
        <div className='starter-card sustained mb-3'>
          <div className='price-line d-flex justify-content-center align-items-end me-2'>
            <span className='currency'>$</span>
            <span className='price-large'>{getRoundedPrice(config.perMonthDisplay)}</span>
            <span className='per'>/mo</span>
          </div>
          {config.isValue && (
            <div className='flex flex-row text-center'>
              <p className='best-value mb-0'> Best Value for ongoing treatment </p>
              <span>${config.upfront} upfront</span>
            </div>
          )}
        </div>

        <ul className='plan-bullets'>
          {config.bullets.map((b: string, idx: number) => (
            <li key={idx}>{b}</li>
          ))}
        </ul>

        <div className='mt-3 text-center text-lg-start'>
          <button
            disabled={isPending}
            className='btn btn-cta'
            onClick={handleGetStarted}
            data-tracking-id={`product-card-sustained-${
              product.id || product.name?.toLowerCase().replace(/\s+/g, '-')
            }`}
          >
            {isPending && <Spinner className='border-2' size='sm' />}
            Get Started
          </button>
        </div>

        {footnote && <div className='footnote mt-3'>{footnote}</div>}
      </div>
    </div>
  );
}
