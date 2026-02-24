import Image from 'next/image';
import { ProductType } from '@/store/slices/productTypeSlice';
import { SurveyGetStartedButton } from '@/components/SurveyGetStartedButton';
// import { getRoundedPrice } from '@/helpers/products';
// import ProfileIcons from '../../../assets/ads/black-friday-sale/ProfileIcons.png';
import BottlesImage from '../../../assets/Bottles.png';
import BottleImage from '../../../assets/Bottle.png';
import Bottles2Image from '../../../assets/Bottles2.png';
import Bottle2Image from '../../../assets/Bottle2.png';

interface Props {
  product: ProductType;
  planType: 'monthly' | 'starter';
  categoryName: string;
  categoryImage?: string | null;
}

export default function ProductCard({ product, planType, categoryName }: Readonly<Props>) {
  // const activePrice = product.prices?.find((price) => price.isActive) || product.prices?.[0];
  // const price = activePrice?.amount || 0;
  // const roundedPrice = getRoundedPrice(price);
  // const dividedAmount = product.dividedAmount || price;

  // Determine if we should show multiple vials (for starter 3-month)
  const showMultipleVials = planType === 'starter';

  // Determine if this is Semaglutide or Tirzepatide
  const isSemaglutide = categoryName.toLowerCase().includes('semaglutide');
  // const isTirzepatide = categoryName.toLowerCase().includes('tirzepatide');

  // Get the appropriate image based on category and plan type
  const getImageSource = () => {
    if (showMultipleVials) {
      // Multiple images
      return isSemaglutide ? Bottles2Image : BottlesImage;
    } else {
      // Single image
      return isSemaglutide ? Bottle2Image : BottleImage;
    }
  };

  const displayImage = getImageSource();

  // Get plan label from product data
  const getPlanLabel = (): string => {
    if (product.durationText) {
      if (product.durationText.trim() === '3-Month Supply') {
        return 'Starter 3-Month Supply';
      }
      return product.durationText;
    }
    if (product.displayName) {
      return product.displayName;
    }
    // Fallback based on planType
    if (product.planType === 'one_time' || product.metadata?.intervalCount === 3) {
      return 'Starter 3-Month Supply';
    }
    return 'Monthly Subscription';
  };

  const planLabel = getPlanLabel();

  // Check if this is a 3-month subscription plan (semaglutide or tirzepatide)
  // const is3MonthPlan =
  //   (isSemaglutide || isTirzepatide) &&
  //   (planType === 'starter' ||
  //     product.durationText?.trim() === '3-Month Supply' ||
  //     product.metadata?.intervalCount === 3);

  return (
    <div className='tw-bg-[#002C8C] tw-rounded-[24px] tw-px-6 tw-py-8 tw-flex tw-flex-col tw-gap-6 tw-h-full'>
      <div className='tw-flex tw-justify-content-center tw-flex-col tw-items-center tw-gap-3'>
        <h3 className='tw-font-bold xl:tw-text-2xl md:tw-text-xl tw-text-2xl md:tw-leading-[120%] tw-leading-[150%] tw-text-white tw-mb-0 tw-text-center'>
          {categoryName} injections
        </h3>

        <div className='tw-flex tw-flex-wrap justify-content-center tw-gap-2 tw-items-center'>
          <div className='tw-bg-transparent tw-text-white'>Weight Loss Injection</div>
          <div className='tw-bg-white tw-text-[#0577FE] xl:tw-text-base md:tw-h-auto tw-text-[15px] tw-h-10 tw-px-3 tw-py-2 tw-rounded-md tw-font-bold'>
            {planLabel}
          </div>
        </div>

        <div className='tw-relative tw-w-full tw-text-center tw-flex tw-items-center tw-justify-center tw-my-4'>
          <div className='tw-bg-[#002C8C] tw-z-10 md:tw-px-5 tw-px-0'>
            <h5 className='tw-font-bold tw-uppercase xl:tw-text-lg tw-text-base md:tw-leading-[100%] tw-leading-[180%] tw-text-white tw-m-0'>
              USE PROMO CODE LUMI50 TO GET $50 OFF <br />
              FOR NEW PATIENTS ONLY
            </h5>
          </div>
          <div
            className="tw-w-full tw-h-[1px] tw-bg-white tw-top-1/2 tw-left-0 tw-transform md:tw-translate-y-1/2 -tw-translate-y-10
              tw-before:tw-content-[''] tw-before:tw-absolute tw-before:tw-inset-0
              tw-before:tw-border tw-before:tw-border-[#001B55] tw-before:tw-pointer-events-none tw-absolute"
          ></div>
        </div>

        {/* <p className='tw-text-[#D0E6FF] xl:tw-text-[17px] tw-text-sm tw-font-bold tw-leading-[140%] tw-mb-0 tw-mt-6'>
          Want to Lose Up to 10-12 lbs every month?
        </p> */}
      </div>

      {/* Product Image */}
      <div className='tw-relative tw-w-full tw-h-[200px] md:tw-h-[250px] lg:tw-h-[280px] tw-flex tw-items-center tw-justify-center tw-my-4'>
        <div className='tw-relative tw-w-full tw-h-full'>
          <Image
            src={displayImage}
            alt={categoryName}
            fill
            className='tw-object-contain'
            sizes='(max-width: 768px) 200px, 300px'
          />
        </div>
      </div>

      {/* Get Started Button */}
      <SurveyGetStartedButton
        product={product}
        className='!tw-bg-white !tw-text-[#002C8C] !tw-rounded-full !tw-font-bold xl:!tw-text-2xl md:!tw-text-base !tw-text-2xl xl:tw-h-[72px] md:tw-h-12 tw-h-[72px] tw-uppercase tw-leading-[100%] hover:tw-opacity-90 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed tw-w-full'
      >
        GET STARTED
      </SurveyGetStartedButton>

      {/* Commitment Details */}
      {/* <p className='tw-text-white tw-text-base tw-font-normal tw-leading-[140%] tw-text-center tw-my-2'>
        {is3MonthPlan ? 'Renewable every 3 months' : '1-month supply, renewed monthly'}
      </p> */}

      {/* Social Proof */}
      {/* <div className='tw-flex tw-items-center tw-justify-center tw-gap-3 tw-mt-auto'>
        <div className='tw-relative tw-w-[120px] md:tw-w-[140px] tw-h-[30px] md:tw-h-[35px]'>
          <Image
            src={ProfileIcons}
            alt='Customer profiles'
            fill
            className='tw-object-contain'
            sizes='(max-width: 768px) 120px, 140px'
          />
        </div>
        <div className='tw-text-white tw-flex tw-flex-col tw-leading-tight tw-text-sm'>
          <div className='tw-font-bold tw-text-[#D0E6FF]'>3214+ </div>
          <div>customers bought this</div>
        </div>
      </div> */}
    </div>
  );
}
