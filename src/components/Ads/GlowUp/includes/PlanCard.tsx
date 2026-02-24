import { useMemo, useTransition } from 'react';
import Image, { StaticImageData } from 'next/image';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { ProductType } from '@/store/slices/productTypeSlice';
import { trackAddToCart } from '@/lib/tracking';
import { microsoftTrackAddToCart } from '@/helpers/uetTracking';
import { handleVerifyRedirectToCheckout } from '@/helpers/products';
import { Spinner } from 'react-bootstrap';

interface PlanCardProps {
  product: ProductType;
  fallbackImage?: StaticImageData;
  imageAlt: string;
}

const PlanCard: React.FC<PlanCardProps> = ({ product, fallbackImage, imageAlt }) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [isPending, startTransition] = useTransition();

  const selectedProduct = useSelector((state: RootState) => state.productType);
  const checkout = useSelector((state: RootState) => state.checkout);
  const { isSurveyCompleted, checkoutUser } = checkout || {};

  async function handleGetStarted(product: ProductType) {
    trackAddToCart({
      itemId: product.id ?? '',
      itemName: product.name ?? '',
      value: product.prices?.[0].amount ?? 0,
    });

    // Microsoft UET AddToCart tracking
    microsoftTrackAddToCart(
      product.id ?? '',
      product.name ?? '',
      product.prices?.[0].amount ?? 0,
      'USD'
    );

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

  // Map products to plan configurations
  const configProduct = useMemo(() => {
    const { bulletDescription, dividedAmount, image, durationText, featureText, name } = product;
    const activePrice = product.prices.find((pr) => pr.isActive);
    const amount = activePrice ? activePrice.amount : 0;

    // Use API data directly
    const imageSrc =
      durationText === '3-Month Subscription' || durationText === '3-Month Supply' ? fallbackImage : image;
    const supplyText =
      durationText === '3-Month Subscription' || durationText === '3-Month Supply'
        ? `upfront ($${dividedAmount}/mo equivalent)`
        : 'One-month supply, renewed monthly';

    const ModifyfeatureText = featureText === '' ? 'One time purchase' : featureText;
    const showPerMonth =
      name?.toLowerCase().includes('value 3-month subscription') ||
      name?.toLowerCase().includes('starter 3-month supply')
        ? false
        : true;

    return {
      durationText,
      featureText: ModifyfeatureText,
      bulletDescription,
      price: amount.toString(),
      imageSrc,
      showPerMonth,
      dividedAmount,
      supplyText,
    };
  }, [product]);

  const getPlanLabel = () => {
    if (product.metadata.intervalCount === 3) {
      return '3-Months';
    } else if (product.metadata.intervalCount === 2) {
      return '2-Months';
    } else if (product.metadata.intervalCount === 1) {
      return 'Monthly';
    }
    return product.durationText;
  };
  return (
    <div className='plan-card font-instrument-sans'>
      {/* Plan Banner */}
      <div className='plan-header'>
        <span className='plan-label'>{getPlanLabel()}</span>
      </div>

      <div className='plan-content'>
        <div className='row align-items-center'>
          {/* Left Section - Features */}
          <div className='col-12 col-md-5'>
            <div className='plan-info'>
              <h3 className='plan-title'>{configProduct.featureText}</h3>
              <ul className='plan-benefits'>
                {configProduct.bulletDescription.map((benefit: string, index: number) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Central Section - Vial Image */}
          <div className='col-md-3'>
            <div className='medication-image'>
              <div className='vial-image-container'>
                <Image
                  src={configProduct.imageSrc || product.image || ''}
                  alt={imageAlt || product.name || 'vial of medication'}
                  width={120}
                  height={200}
                  className='vial-image'
                  priority
                />
              </div>
            </div>
          </div>

          {/* Right Section - Pricing and CTA */}
          <div className='col-md-4'>
            <div className='plan-pricing'>
              <p className='supply-text text-center'>{configProduct.supplyText}</p>
              <div className='price text-center'>
                <span className='dollar'>$</span>
                <span className='price-dollar'>{configProduct.price}</span>
                {configProduct.showPerMonth && <span className='month'>/mo</span>}
              </div>
              <div className='mx-auto'>
                <button
                  disabled={isPending}
                  className='cta-button d-flex align-items-center justify-content-center gap-2 text-nowrap'
                  onClick={() => handleGetStarted(product)}
                  data-tracking-id={`product-card-glow-up-${
                    product.id || product.name?.toLowerCase().replace(/\s+/g, '-')
                  }`}
                >
                  {isPending && <Spinner className='border-2' size='sm' />}
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanCard;
