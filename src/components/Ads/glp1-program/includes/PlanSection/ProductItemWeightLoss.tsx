import Image from 'next/image';
import styles from './styles.module.scss';
import { ProductType } from '@/store/slices/productTypeSlice';
import { SurveyGetStartedButton } from '@/components/SurveyGetStartedButton';
import { useTranslations } from 'next-intl';
import { getBadgeText, getRoundedPrice } from '@/helpers/products';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
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
  getStartedButtonStyle?: {
    backgroundColor?: string;
    textColor?: string;
    hoverBackgroundColor?: string;
  };
  badgeStyle?: {
    background?: string;
    textColor?: string;
  };
  badgeClassName?: string;
  badgeTextClassName?: string;
  badgeTextSuffix?: string;
  glpHeaderClassName?: string;
  borderStyle?: {
    border?: string;
    borderImageSource?: string;
    borderImageSlice?: number;
    borderRadius?: string;
  };
  t?: ReturnType<typeof useTranslations>;
  headingColor?: string;
  subHeadingColor?: string;
  priceColor?: string;
  pricePeriodColor?: string;
  popularTagColor?: string;
}

export default function ProductItemWeightLoss({
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
  getStartedButtonStyle,
  badgeStyle,
  badgeClassName,
  badgeTextClassName,
  badgeTextSuffix,
  glpHeaderClassName,
  borderStyle,
  t,
  priceColor,
  pricePeriodColor,
  className,
  ...props
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
    <div
      {...props}
      className={`card ${styles.productCard} ${className}`}
      style={{
        ...(cardBackgroundColor ? { background: cardBackgroundColor } : {}),
        ...(borderStyle?.border ? { border: borderStyle.border } : {}),
        ...(borderStyle?.borderImageSource ? { borderImageSource: borderStyle.borderImageSource } : {}),
        ...(borderStyle?.borderImageSlice ? { borderImageSlice: borderStyle.borderImageSlice } : {}),
        ...(borderStyle?.borderRadius ? { borderRadius: borderStyle.borderRadius } : {}),
      }}
    >
      {/* GLP-1 Header */}
      <div className={`${styles.glpHeader} ${glpHeaderClassName || ''}`}>
        {/* Pill Badge */}
        <div
          className={`${styles.pillBadge} ${badgeClassName || ''}`}
          style={{
            background: badgeStyle?.background || '#FFFFFF',
          }}
        >
          <span
            className={`${styles.badgeText} ${badgeTextClassName || ''}`}
            style={{
              color: badgeStyle?.textColor || '#000000',
            }}
          >
            {getBadgeText(product, t)}
            {badgeTextSuffix}
          </span>
        </div>

        {showProductTitle && (
          <div className={styles.titleContainer}>
            <h2 className={`${styles.glpTitle} ${productTitleClassName || ''}`}>
              {productTitle || t?.('productTitle') || 'Compounded Tirzepatide'}
              {showProductTitleSuffix && (
                <>
                  {' '}
                  <br /> (GLP-1/GIP) Injections
                </>
              )}
            </h2>
            {/* <span className={styles.popularTag}>Value</span> */}
          </div>
        )}
        <h2 className={`${styles.glpSubtitle} ${productSubtitleClassName || ''}`}>
          {productSubtitle || t?.('productSubtitle') || 'Weight Loss Injections'}
        </h2>
      </div>

      {/* Product Image Section */}
      <div className={`${styles.productImageSection} ${productImageSectionClassName || ''}`}>
        {product.image && (
          showMultipleVials && 
          (product.metadata?.billingInterval === 'month' && product.metadata?.intervalCount === 3) ? (
            <div className={styles.multipleVialsContainer}>
              <Image
                src={product.image}
                alt={`${product.name} Vial`}
                width={100}
                height={250}
                className={`${styles.vialImage} ${styles.vial1}`}
              />
              <Image
                src={product.image}
                alt={`${product.name} Vial`}
                width={100}
                height={250}
                className={`${styles.vialImage} ${styles.vial2}`}
              />
              <Image
                src={product.image}
                alt={`${product.name} Vial`}
                width={100}
                height={250}
                className={`${styles.vialImage} ${styles.vial3}`}
              />
            </div>
          ) : (
            <div className={styles.singleVialContainer}>
              <Image src={product.image} alt={`${product.name} Vial`} fill className={`${styles.vialImage} !tw-static`} />
            </div>
          )
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
          <span className={styles.priceAmount} style={{ color: priceColor }}>
            ${getPriceDisplay()}
          </span>
          {shouldShowMonthlySuffix() && (
            <span className={styles.pricePeriod} style={{ color: pricePeriodColor || priceColor }}>
              {t?.('priceMonthSuffix') || '/mo'}
            </span>
          )}
        </div>
      </div>

      {/* CTA Button */}
      <div className={`${styles.ctaSection} d-flex justify-content-center`}>
        <SurveyGetStartedButton
          className={`btn rounded-pill tw-w-full text-lg ${styles.responsiveCta}`}
          product={product}
          style={{
            backgroundColor: getStartedButtonStyle?.backgroundColor || '#FFFFFF',
            color: getStartedButtonStyle?.textColor || '#000000',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = getStartedButtonStyle?.hoverBackgroundColor || '#FFFFF1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = getStartedButtonStyle?.backgroundColor || '#FFFFFF';
          }}
        >
          {t?.('buttonText') || 'Get Started'}
        </SurveyGetStartedButton>
      </div>
    </div>
  );
}
