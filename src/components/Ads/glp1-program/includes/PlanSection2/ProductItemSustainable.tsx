import Image from 'next/image';
import styles from './styles.module.scss';
import { SurveyGetStartedButton } from '@/components/SurveyGetStartedButton';
import { ProductType } from '@/store/slices/productTypeSlice';
import { useTranslations } from 'next-intl';
import { getBadgeText, getRoundedPrice } from '@/helpers/products';

interface Props {
  product: ProductType;
  cardBackgroundColor?: string;
  productTitle?: string;
  productSubtitle?: string;
  productTitleClassName?: string;
  productSubtitleClassName?: string;
  productDescription?: string;
  productDescriptionClassName?: string;
  productDescriptionByTier?: Record<string, string>;
  showProductDescription?: boolean;
  showMultipleVials?: boolean;
  productImageSectionClassName?: string;
  pricingSectionClassName?: string;
  showProductTitle?: boolean;
  showProductTitleSuffix?: boolean;
  badgeStyle?: {
    background?: string;
    textColor?: string;
  };
  badgeClassName?: string;
  badgeTextClassName?: string;
  badgeTextSuffix?: string;
  glpHeaderClassName?: string;
  titleContainerClassName?: string;
  useHorizontalLayout?: boolean;
  headingColor?: string;
  subHeadingColor?: string;
  priceColor?: string;
  pricePeriodColor?: string;
  popularTagColor?: string;
  buttonStyle?: {
    backgroundColor?: string;
    textColor?: string;
    hoverBackgroundColor?: string;
  };
  buttonClassName?: string;
  customPricingText?: string;
  t?: ReturnType<typeof useTranslations>;
}

export default function ProductItemSustainable({
  product,
  cardBackgroundColor,
  productTitle,
  productSubtitle,
  productTitleClassName,
  productSubtitleClassName,
  productDescription,
  productDescriptionClassName,
  productDescriptionByTier,
  showProductDescription = false,
  showMultipleVials = false,
  productImageSectionClassName,
  pricingSectionClassName,
  showProductTitle = true,
  showProductTitleSuffix = true,
  badgeStyle,
  badgeClassName,
  badgeTextClassName,
  badgeTextSuffix,
  glpHeaderClassName,
  titleContainerClassName,
  useHorizontalLayout = false,
  headingColor,
  subHeadingColor,
  priceColor,
  pricePeriodColor,
  popularTagColor,
  buttonStyle,
  buttonClassName,
  customPricingText,
  t,
}: Readonly<Props>) {
  const getPriceDisplay = (): number => {
    if (
      product.durationText?.toLowerCase().includes('3-month') ||
      product.durationText?.toLowerCase().includes('3 month')
    ) {
      return getRoundedPrice(product.dividedAmount) || 0;
    }
    return getRoundedPrice(product.prices?.[0]?.amount) || 0;
  };

  const shouldShowMonthlySuffix = (): boolean => {
    return true; // Always show /mo for all products
  };

  return (
    <div className={`card ${styles.productCard}`} style={{ backgroundColor: cardBackgroundColor }}>
      {/* GLP-1 Header */}
      <div className={`${styles.glpHeader} ${glpHeaderClassName || ''}`}>
        {useHorizontalLayout ? (
          <div className={`${styles.titleContainer} tw-gap-2 ${titleContainerClassName || ''}`}>
            <span
              className={`${styles.popularTag} ${badgeClassName || ''}`}
              style={{
                ...(badgeStyle?.background ? { background: badgeStyle.background } : {}),
                ...(badgeStyle?.textColor || popularTagColor
                  ? { color: badgeStyle?.textColor || popularTagColor }
                  : {}),
              }}
            >
              <span className={badgeTextClassName || ''}>
                {product.metadata?.intervalCount && product.metadata?.billingInterval
                  ? `${product.metadata.intervalCount}-${
                      product.metadata.billingInterval.charAt(0).toUpperCase() +
                      product.metadata.billingInterval.slice(1)
                    }`
                  : product.durationText || getBadgeText(product, t)}
                {badgeTextSuffix}
              </span>
            </span>
            {showProductTitle && (
              <h2
                className={`${styles.glpTitle} ${productTitleClassName || ''}`}
                style={{ color: headingColor || '#3060FE' }}
              >
                {productTitle || t?.('productTitle') || 'Compounded Semaglutide'}
                {showProductTitleSuffix && <> (GLP-1) Injections</>}
              </h2>
            )}
            <h2
              className={`${styles.glpSubtitle} ${productSubtitleClassName || ''}`}
              style={{ color: subHeadingColor || '#3060FE' }}
            >
              {productSubtitle || t?.('productSubtitle') || 'Weight Loss Injections'}
            </h2>
          </div>
        ) : (
          <>
            <div className={`${styles.titleContainer} tw-gap-2`}>
              {showProductTitle && (
                <h2
                  className={`${styles.glpTitle} ${productTitleClassName || ''}`}
                  style={{ color: headingColor || '#3060FE' }}
                >
                  {productTitle || t?.('productTitle') || 'Compounded Semaglutide'}
                  {showProductTitleSuffix && <> (GLP-1) Injections</>}
                </h2>
              )}
              <span
                className={`${styles.popularTag} ${badgeClassName || ''}`}
                style={{
                  ...(badgeStyle?.background ? { background: badgeStyle.background } : {}),
                  ...(badgeStyle?.textColor || popularTagColor
                    ? { color: badgeStyle?.textColor || popularTagColor }
                    : {}),
                }}
              >
                <span className={badgeTextClassName || ''}>
                  {product.metadata?.intervalCount && product.metadata?.billingInterval
                    ? `${product.metadata.intervalCount}-${
                        product.metadata.billingInterval.charAt(0).toUpperCase() +
                        product.metadata.billingInterval.slice(1)
                      }`
                    : product.durationText || getBadgeText(product, t)}
                  {badgeTextSuffix}
                </span>
              </span>
            </div>
            <h2
              className={`${styles.glpSubtitle} ${productSubtitleClassName || ''}`}
              style={{ color: subHeadingColor || '#3060FE' }}
            >
              {productSubtitle || t?.('productSubtitle') || 'Weight Loss Injections'}
            </h2>
          </>
        )}
      </div>

      {/* Product Image Section */}
      <div className={`${styles.productImageSection} ${productImageSectionClassName || ''}`}>
        {showMultipleVials && product.metadata?.billingInterval === 'month' && product.metadata?.intervalCount === 3 ? (
          <div className={styles.multipleVialsContainer}>
            <Image
              src={product.image || ''}
              alt={`${product.name} Vial`}
              width={100}
              height={250}
              className={`${styles.vialImage} ${styles.vial1}`}
            />
            <Image
              src={product.image || ''}
              alt={`${product.name} Vial`}
              width={100}
              height={250}
              className={`${styles.vialImage} ${styles.vial2}`}
            />
            <Image
              src={product.image || ''}
              alt={`${product.name} Vial`}
              width={100}
              height={250}
              className={`${styles.vialImage} ${styles.vial3}`}
            />
          </div>
        ) : (
          <div className={styles.singleVialContainer}>
            <Image
              src={product.image || ''}
              alt={`${product.name} Vial`}
              fill
              className={`${styles.vialImage} !tw-static`}
            />
          </div>
        )}
      </div>

      {/* Product Description */}
      {showProductDescription &&
        (productDescription ||
          (productDescriptionByTier && (product.metadata?.planTier || 'monthly')
            ? productDescriptionByTier[product.metadata?.planTier || 'monthly']
            : null) ||
          product.description) && (
          <div className={`${productDescriptionClassName || ''}`}>
            {productDescription ||
              (productDescriptionByTier && (product.metadata?.planTier || 'monthly')
                ? productDescriptionByTier[product.metadata?.planTier || 'monthly']
                : null) ||
              product.description}
          </div>
        )}

      {/* Pricing Section */}
      <div className={`${styles.pricingSection} ${pricingSectionClassName || ''}`}>
        <div className={styles.priceDisplay}>
          <span className={styles.priceAmount} style={{ color: priceColor || '#3060FE' }}>
            ${getPriceDisplay()}
          </span>
          {shouldShowMonthlySuffix() && (
            <span className={styles.pricePeriod} style={{ color: pricePeriodColor || priceColor || '#3060FE' }}>
              {t?.('priceMonthSuffix') || '/mo'}
            </span>
          )}
        </div>
        {customPricingText &&
          (product.durationText?.toLowerCase().includes('3-month') ||
            product.durationText?.toLowerCase().includes('3 month')) && (
            <div className='text-center mt-2'>
              <span style={{ color: priceColor || '#3060FE', fontSize: '14px', fontWeight: '500' }}>
                {customPricingText}
              </span>
            </div>
          )}
      </div>

      {/* CTA Button */}
      <div className='d-flex justify-content-center'>
        <SurveyGetStartedButton
          className={`survey_get_started_button btn rounded-pill text-lg tw-font-semibold ${styles.responsiveCta} ${
            buttonClassName || ''
          }`}
          product={product}
          style={{
            backgroundColor: buttonStyle?.backgroundColor || '#3060FE',
            color: buttonStyle?.textColor || '#FFFFFF',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = buttonStyle?.hoverBackgroundColor || '#1E4BCC';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = buttonStyle?.backgroundColor || '#3060FE';
          }}
        >
          {t?.('buttonText') || 'Get Started'}
        </SurveyGetStartedButton>
      </div>
    </div>
  );
}
