import { useMemo } from 'react';
import Image, { StaticImageData } from 'next/image';
import { ProductType } from '@/store/slices/productTypeSlice';
import { SurveyGetStartedButton } from '@/components/SurveyGetStartedButton';
import { getRoundedPrice } from '@/helpers/products';

interface PlanCardProps {
  product: ProductType;
  fallbackImage?: StaticImageData;
  imageAlt: string;
}

const PlanCard: React.FC<PlanCardProps> = ({ product, fallbackImage, imageAlt }) => {
  // Map products to plan configurations
  const configProduct = useMemo(() => {
    const { bulletDescription, dividedAmount, image, durationText, featureText, name } = product;
    const activePrice = product.prices.find((pr) => pr.isActive);
    const amount = activePrice ? activePrice.amount : 0;

    // Use API data directly
    const imageSrc =
      durationText === '3-Month Subscription' || durationText === '3-Month Supply' ? fallbackImage : image;
    const supplyText = (() => {
      const { intervalCount } = product.metadata || {};

      // For monthly products (intervalCount === 1), keep as is
      if (intervalCount === 1) {
        return 'One-month supply, renewed monthly';
      }

      // For 2-month and 3-month products, show price in the format "upfront ($649 equivalent)"
      if (intervalCount === 2 || intervalCount === 3) {
        return `upfront ($${getRoundedPrice(amount)} equivalent)`;
      }

      // Fallback for other cases
      return durationText === '3-Month Subscription' || durationText === '3-Month Supply'
        ? `upfront ($${getRoundedPrice(amount)} equivalent)`
        : 'One-month supply, renewed monthly';
    })();

    const ModifyfeatureText = featureText === '' ? 'One time purchase' : featureText;
    const showPerMonth = (() => {
      const { intervalCount } = product.metadata || {};

      // Show /mo for monthly, 2-month, and 3-month plans
      if (intervalCount === 1 || intervalCount === 2 || intervalCount === 3) {
        return true;
      }

      // Fallback to original logic for backward compatibility
      return !(
        name?.toLowerCase().includes('value 3-month subscription') ||
        name?.toLowerCase().includes('starter 3-month supply')
      );
    })();

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
    const { billingInterval, intervalCount, planTier } = product.metadata || {};
    const planType = product.planType;

    // Determine the suffix based on plan type
    const suffix = planType === 'one_time' ? 'Supply' : 'Subscription';

    // If billing interval is 1, show "Monthly" + suffix
    if (intervalCount === 1) {
      return `Monthly ${suffix}`;
    }

    // For others, concatenate: planTier + intervalCount + billingInterval + suffix
    const capitalizedPlanTier = planTier ? planTier.charAt(0).toUpperCase() + planTier.slice(1) : 'Plan';
    const capitalizedBillingInterval = billingInterval
      ? billingInterval.charAt(0).toUpperCase() + billingInterval.slice(1)
      : 'Month';

    return `${capitalizedPlanTier} ${intervalCount || 1} ${capitalizedBillingInterval} ${suffix}`;
  };

  return (
    <div
      className='science-plans-card plan-card font-instrument-sans'
      style={{ borderRadius: '32px', background: 'linear-gradient(to bottom, #FFFEFE, #FFF2E4)' }}
    >
      {/* Plan Banner */}
      <div className='plan-header'>
        <span className='plan-label' style={{ backgroundColor: '#A5856B' }}>
          {getPlanLabel()}
        </span>
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
                  width={200}
                  height={297}
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
                <span className='dollar' style={{ color: '#774116' }}>
                  $
                </span>
                <span className='price-dollar' style={{ color: '#774116' }}>
                  {getRoundedPrice(configProduct.dividedAmount)}
                </span>
                {configProduct.showPerMonth && (
                  <span className='month' style={{ color: '#774116' }}>
                    /mo
                  </span>
                )}
              </div>
              <div className='mx-auto'>
                <SurveyGetStartedButton
                  className='cta-button d-flex align-items-center justify-content-center gap-2 text-nowrap'
                  style={{ backgroundColor: '#771618' }}
                  product={product}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanCard;
