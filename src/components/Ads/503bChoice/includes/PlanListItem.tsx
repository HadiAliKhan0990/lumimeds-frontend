import Image from 'next/image';
import GroupImage3 from '@/assets/503Bontrack/503B-Gorup-3.png';
import { ProductType } from '@/store/slices/productTypeSlice';
import { useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { handleVerifyRedirectToCheckout } from '@/helpers/products';
import { trackAddToCart } from '@/lib/tracking';
import { Spinner } from 'react-bootstrap';

interface Props {
  product: ProductType;
}

export default function PlanListItem({ product }: Readonly<Props>) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [isPending, startTransition] = useTransition();

  const selectedProduct = useSelector((state: RootState) => state.productType);
  const checkout = useSelector((state: RootState) => state.checkout);
  const { isSurveyCompleted, checkoutUser } = checkout || {};

  async function handleGetStarted() {
    trackAddToCart({
      itemId: product.id ?? '',
      itemName: product.displayName ?? product.name ?? '',
      value: product.prices?.[0].amount ?? 0,
    });

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

  const renderProductImage = () => {
    // If supply text includes 3-Month, show static image
    if (product.durationText?.includes('3-Month')) {
      return (
        <Image
          src={GroupImage3}
          alt='GLP-1 (503B) Weight Loss Injection Vials'
          width={200}
          height={120}
          className='product-vial-image'
        />
      );
    } else {
      // Otherwise use the provided image URL or fallback
      return (
        <Image
          src={product.image || ''}
          alt='GLP-1 (503B) Weight Loss Injection Vial'
          width={80}
          height={120}
          className='product-vial-image'
        />
      );
    }
  };

  const benefit = useMemo(() => {
    if (product?.durationText === '1-Month Supply') {
      return 'A solid first step in your weight care journey.';
    }
    if (product?.durationText === '2-Month Supply') {
      return 'Begin your journey with stronger momentum.';
    }
    return 'Set your sights on real transformation.';
  }, [product]);

  return (
    <div className='plan-list-item'>
      <div className='plan-content'>
        {/* Left Section - Product Image */}
        <div className='plan-image-section'>
          <div className='product-image-container'>{renderProductImage()}</div>
          <p className='product-description'>GLP-1 (503B) Weight Loss Injections</p>
        </div>

        {/* Right Section - Plan Details */}
        <div className='plan-details-section'>
          <h3 className='plan-title'>{product.durationText}</h3>
          <p className='plan-subtitle'>Advanced Weight Care at</p>
          <div className='price-display'>
            <span className='price-amount'>{product.dividedAmount}</span>
            <span className='price-period'>/mo</span>
          </div>
          <p className='purchase-type'>One-Time Purchase</p>
          <p className='plan-benefit'>{benefit}</p>

          <div className='plan-features'>
            {product.bulletDescription.map((feature) => (
              <div key={feature} className='feature-item'>
                <span className='feature-bullet'>■</span>
                <span className='feature-text'>{feature}</span>
              </div>
            ))}
          </div>

          <button onClick={handleGetStarted} disabled={isPending} className='cta-button gap-2'>
            {isPending && <Spinner className='border-2' size='sm' />}
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}
