'use client';

import { ReactNode, useMemo } from 'react';
import Image, { StaticImageData } from 'next/image';
import { PlanProduct, ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import { ProductPrice, ProductType } from '@/store/slices/productTypeSlice';
import { getRoundedPrice } from '@/helpers/products';
import { trackAddToCart } from '@/lib/tracking';
import { microsoftTrackAddToCart } from '@/helpers/uetTracking';
import { GLP1_GIP_LABEL, GLP1_GIP_PRODUCT_NAME } from '@/constants/factory';
import { PlanType } from '@/types/medications';
import { SurveyGetStartedButton } from '@/components/SurveyGetStartedButton';

interface Props {
  data: ProductTypesResponseData;
  renderImage?: (image?: string | StaticImageData | null) => ReactNode;
}

type PlanBucket = {
  id: string;
  title?: string;
  badge?: string;
  subtitle?: string;
  priceDisplay: string;
  priceSuffix?: string;
  priceNote?: string;
  bullets: string[];
  product: ProductType;
};

function getActivePrice(product: ProductType): ProductPrice | undefined {
  return product.prices?.find((price) => price.isActive) ?? product.prices?.[0];
}

function toCurrency(value: number | undefined): string {
  if (!value) return '$0';
  return `$${getRoundedPrice(value)}`;
}

const sortOrder = ['starter', 'value', 'monthly'];

function getPlanLabel(product: ProductType): string {
  const tier = product.metadata?.planTier;
  if (tier) {
    return tier.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  }

  if (product.planType === PlanType.ONE_TIME) return 'Starter';
  if (product.metadata?.intervalCount === 3) return 'Value';
  return 'Monthly';
}

function getPlanKey(product: ProductType, index: number): string {
  return product.id || product.name || product.durationText || `plan-${index}`;
}

function getSubtitle(product: ProductType): string | undefined {
  if (product.featureText) {
    return product.featureText;
  }
  if (product.tagline) {
    return product.tagline;
  }
  return `${GLP1_GIP_PRODUCT_NAME} ${GLP1_GIP_LABEL} injection`;
}

function getDefaultTitle(product: ProductType): string | undefined {
  return product.durationText || product.name || undefined;
}

type PlanBucketWithSort = PlanBucket & { sortRank: number };

function getSortRank(product: ProductType): number {
  const metadataTier = (product.metadata?.planTier || '').toLowerCase();
  const mappedTier =
    metadataTier && sortOrder.includes(metadataTier)
      ? metadataTier
      : product.planType === PlanType.ONE_TIME
      ? 'starter'
      : product.metadata?.intervalCount === 3
      ? 'value'
      : 'monthly';

  return sortOrder.indexOf(mappedTier);
}

function buildPlanBuckets(category: PlanProduct | undefined): PlanBucket[] {
  if (!category?.products?.length) {
    return [];
  }

  const buckets: PlanBucketWithSort[] = category.products
    .filter((product): product is ProductType => Boolean(product))
    .map((product, index) => {
      const activePrice = getActivePrice(product);
      const amount = activePrice?.amount ?? 0;
      const intervalCount = product.metadata?.intervalCount ?? 1;
      const isRecurring = product.planType === PlanType.RECURRING;
      const perMonth = isRecurring && intervalCount > 1 ? product.dividedAmount : amount;

      const badge = getPlanLabel(product);
      const formattedBadge = badge;
      const id = getPlanKey(product, index);
      const subtitle = getSubtitle(product);

      const priceSuffix = isRecurring && intervalCount <= 1 ? '/mo' : undefined;

      const priceNote =
        isRecurring && intervalCount > 1
          ? `${toCurrency(amount)} upfront - ${toCurrency(product.dividedAmount)}/mo equivalent`
          : product.planType === PlanType.ONE_TIME
          ? `${toCurrency(amount)} upfront - ${toCurrency(product.dividedAmount)}/mo equivalent`
          : product.featureText || undefined;

      return {
        id,
        title: getDefaultTitle(product),
        badge: formattedBadge,
        subtitle,
        priceDisplay: String(getRoundedPrice(perMonth)),
        priceSuffix,
        priceNote,
        bullets: (product.bulletDescription || []).slice(0, 4),
        product,
        sortRank: getSortRank(product),
      };
    });

  return buckets
    .sort((a, b) => a.sortRank - b.sortRank)
    .map((bucket) => {
      const { sortRank: _sortRank, ...bucketRest } = bucket;
      void _sortRank;
      return bucketRest;
    });
}

export default function PlanCard2({ data, renderImage }: Readonly<Props>) {
  const category = data?.glp_1_plans;
  const fallbackImage = category?.image;

  const planBuckets = useMemo(() => buildPlanBuckets(category), [category]);

  if (!category || planBuckets.length === 0) {
    return null;
  }

  const handleTrackClick = (product: ProductType) => {
    const activePrice = getActivePrice(product);
    const amount = activePrice?.amount ?? 0;

    trackAddToCart({
      itemId: product.id ?? '',
      itemName: product.name ?? `${GLP1_GIP_PRODUCT_NAME} ${GLP1_GIP_LABEL}`,
      value: amount,
    });

    microsoftTrackAddToCart(product.id ?? '', product.name ?? '', amount, 'USD');
  };

  const renderPlanImage = (image?: string | null) => {
    if (renderImage) {
      return renderImage(image);
    }

    const source = image || fallbackImage;
    if (!source) {
      return null;
    }

    return (
      <Image
        src={source}
        alt='Compounded GLP-1/GIP medication bottles'
        fill
        sizes='320px'
        className='tw-object-contain tw-drop-shadow-[0_24px_60px_rgba(0,0,0,0.45)]'
        priority
      />
    );
  };

  return (
    <div className='tw-flex tw-flex-col tw-gap-8'>
      {planBuckets.map((plan) => (
        <div
          key={plan.id}
          className='tw-flex tw-flex-col lg:tw-flex-row tw-items-center lg:tw-items-stretch tw-gap-8 tw-rounded-[32px] tw-px-4 tw-py-8 md:tw-px-10 md:tw-py-10'
        >
          <div className='tw-relative tw-w-full lg:tw-w-[45%] tw-flex tw-items-center tw-justify-center'>
            <div className='tw-relative  tw-h-[250px] tw-w-[250px] md:tw-h-[280px] md:tw-w-[280px] lg:tw-h-[338px] lg:tw-w-[338px] xl:tw-h-[400px] xl:tw-w-[400px]'>
              {renderPlanImage(plan.product.image)}
            </div>
          </div>

          <div className='tw-flex tw-w-full lg:tw-w-[55%] tw-flex-col tw-gap-3 lg:tw-gap-4 xl:tw-gap-6 tw-text-left'>
            <div className='tw-space-y-2'>
              {plan.badge && (
                <span className='tw-text-[#6C361D] tw-text-[20px] lg:tw-text-[24px] xl:tw-text-[31px] tw-leading-[32px] lg:tw-leading-[44px] xl:tw-leading-[56px] tw-font-secondary tw-font-bold'>
                  {plan.badge} Plan
                </span>
              )}
            </div>

            <div className='tw-space-y-2'>
              <div className='tw-flex tw-items-end'>
                <span className='tw-text-[30px] lg:tw-text-[40px] xl:tw-text-[50px] tw-leading-[80px] lg:tw-leading-[100px] xl:tw-leading-[133px] tw-font-bold tw-text-[#6C361D] tw-font-secondary'>
                  $
                </span>
                <span className='tw-text-[60px] lg:tw-text-[80px] xl:tw-text-[100px] tw-font-bold tw-leading-[80px] lg:tw-leading-[100px] xl:tw-leading-[133px] tw-text-[#6C361D] tw-font-secondary tw-pb-3 lg:tw-pb-3.5 xl:tw-pb-4'>
                  {plan.priceDisplay}
                </span>
                <span className='tw-text-[20px] lg:tw-text-[30px] xl:tw-text-[40px] tw-leading-[80px] lg:tw-leading-[100px] xl:tw-leading-[133px] tw-font-bold tw-text-[#6C361D] tw-font-secondary'>
                  /mo
                </span>
              </div>
            </div>

            {plan.bullets.length > 0 && (
              <ul className='tw-flex tw-flex-col tw-gap-2 tw-px-0 tw-mb-0'>
                {plan.bullets.map((bullet, index) => (
                  <li
                    key={`${plan.id}-bullet-${index}`}
                    className='tw-flex tw-items-center tw-gap-3 tw-font-secondary tw-leading-none'
                  >
                    <span className='tw-text-[#6C361D] tw-text-[28px] lg:tw-text-[32px] xl:tw-text-[36px] tw-leading-[16px]'>
                      •
                    </span>
                    <span className='tw-text-[#6C361D] tw-text-[15px] lg:tw-text-[17px] xl:tw-text-[19px] tw-font-medium tw-leading-[24px] xl:tw-leading-[32px] tw-letter-spacing-[-0.19px]'>
                      {bullet}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <SurveyGetStartedButton
              product={plan.product}
              onClickCapture={() => handleTrackClick(plan.product)}
              className='tw-inline-flex tw-items-center tw-justify-center tw-gap-2 !tw-text-center !tw-rounded-[26px] !tw-bg-[#6C361D] !tw-text-[#E3A588] !tw-text-[16px] md:!tw-text-[19px] lg:!tw-text-[22px] xl:!tw-text-[27px] !tw-font-poppins !tw-leading-[133%] !tw-font-semibold !tw-px-6 md:!tw-px-8 lg:!tw-px-12 xl:!tw-px-16 !tw-py-1 md:!tw-py-1.5 lg:!tw-py-2 xl:!tw-py-2.5 hover:tw-bg-[#7c3f23] disabled:tw-opacity-60 disabled:tw-cursor-not-allowed max-lg:tw-mt-2'
              style={{ backgroundColor: '#6C361D', color: '#E3A588', borderRadius: '26px' }}
            >
              <span>Get Started</span>
            </SurveyGetStartedButton>
          </div>
        </div>
      ))}
    </div>
  );
}
