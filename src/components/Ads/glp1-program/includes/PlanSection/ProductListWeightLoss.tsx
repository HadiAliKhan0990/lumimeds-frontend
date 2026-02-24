import ProductItemWeightLoss from './ProductItemWeightLoss';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import styles from './styles.module.scss';
import { GLP1_GIP_PRODUCT_NAME, GLP1_GIP_LABEL } from '@/constants/factory';
import { ProductType } from '@/store/slices/productTypeSlice';
import { useTranslations } from 'next-intl';

interface Props {
  productsData: ProductTypesResponseData;
  backgroundColor?: string;
  sectionClassName?: string;
  sectionStyle?: React.CSSProperties;
  withBorders?: boolean;
  borderColor?: string;
  borderWidth?: number;
  cardBackgroundColor?: string;
  showHeading?: boolean;
  showSubheading?: boolean;
  showBottomSubheading?: boolean;
  plansHeading?: string;
  plansSubheading?: string;
  plansBottomSubheading?: string;
  textColor?: string;
  headingColor?: string;
  subHeadingColor?: string;
  headingFontSize?: string;
  headingFontFamily?: string;
  headingFontWeight?: string | number;
  subHeadingFontSize?: string;
  subHeadingFontFamily?: string;
  subHeadingFontWeight?: string | number;
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
  priceColor?: string;
  pricePeriodColor?: string;
  popularTagColor?: string;
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
  t?: ReturnType<typeof useTranslations>;
  excludeValueProducts?: boolean;
}

export default function ProductListWeightLoss({
  productsData,
  backgroundColor,
  sectionClassName,
  sectionStyle,
  withBorders,
  borderColor,
  borderWidth,
  cardBackgroundColor,
  showHeading = true,
  showSubheading = true,
  showBottomSubheading = true,
  plansHeading,
  plansSubheading,
  plansBottomSubheading,
  textColor,
  headingColor,
  subHeadingColor,
  headingFontSize,
  headingFontFamily,
  headingFontWeight,
  subHeadingFontSize,
  subHeadingFontFamily,
  subHeadingFontWeight,
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
  priceColor,
  pricePeriodColor,
  popularTagColor,
  getStartedButtonStyle,
  badgeStyle,
  badgeClassName,
  badgeTextClassName,
  badgeTextSuffix,
  glpHeaderClassName,
  t,
  excludeValueProducts = false,
}: Readonly<Props>) {
  // Use only GLP-1 GIP products as requested
  let glp1GipProducts = productsData?.glp_1_gip_plans?.products || [];

  // Filter out products with "value" badgeText if excludeValueProducts is true
  if (excludeValueProducts) {
    glp1GipProducts = glp1GipProducts.filter((product: ProductType) => product.metadata?.planTier !== 'value');
  }

  // Sort products by effective displayed price (lowest first)
  const getEffectivePrice = (product: ProductType): number => {
    const duration = product?.durationText?.toLowerCase?.() || '';
    const isThreeMonth = duration.includes('3-month') || duration.includes('3 month');
    if (isThreeMonth) {
      return product?.dividedAmount || 0;
    }
    return product?.prices?.[0]?.amount || 0;
  };

  const sortedProducts = glp1GipProducts.slice().sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b));

  // Don't render anything if no products
  if (glp1GipProducts.length === 0) {
    return null;
  }

  const tempProducts: ProductType[] = [];

  for (let i = 0; i < glp1GipProducts.length; i++) {
    if (glp1GipProducts?.[i]?.metadata?.planTier === 'starter') {
      tempProducts[0] = glp1GipProducts?.[i];
    } else if (glp1GipProducts?.[i]?.metadata?.planTier === 'value') {
      tempProducts[1] = glp1GipProducts?.[i];
    } else if (glp1GipProducts?.[i]?.metadata?.planTier === 'monthly') {
      tempProducts[2] = glp1GipProducts?.[i];
    }
  }

  return (
    <section
      className={`${styles.productListSection} ${sectionClassName || ''}`}
      style={{
        ...(backgroundColor ? { background: backgroundColor } : {}),
        ...(withBorders
          ? {
              borderTop: `${borderWidth ?? 2}px solid ${borderColor ?? '#000000'}`,
              borderBottom: `${borderWidth ?? 2}px solid ${borderColor ?? '#000000'}`,
            }
          : {}),
        ...sectionStyle,
      }}
    >
      {showHeading && (
        <h2
          className={`${styles['plans-heading']} text-center mb-2`}
          style={{
            ...(textColor || headingColor ? { color: textColor || headingColor } : {}),
            ...(headingFontSize ? { fontSize: headingFontSize } : {}),
            ...(headingFontFamily ? { fontFamily: headingFontFamily } : {}),
            ...(headingFontWeight ? { fontWeight: headingFontWeight } : {}),
          }}
          dangerouslySetInnerHTML={{
            __html: plansHeading || 'Compounded Tirzepatide <br /> (GLP-1/GIP) Injections',
          }}
        />
      )}
      {showSubheading && (
        <p
          className={`${styles['plans-subheading']} text-center mb-5`}
          style={{
            ...(textColor || subHeadingColor ? { color: textColor || subHeadingColor } : {}),
            ...(subHeadingFontSize ? { fontSize: subHeadingFontSize } : {}),
            ...(subHeadingFontFamily ? { fontFamily: subHeadingFontFamily } : {}),
            ...(subHeadingFontWeight ? { fontWeight: subHeadingFontWeight } : {}),
          }}
        >
          {plansSubheading || 'HSA/FSA eligible'}
        </p>
      )}
      <div className='container'>
        <div className='row g-4 justify-content-center'>
          {sortedProducts.length > 0 ? (
            sortedProducts.map((product) => {
              // Dynamic column classes based on number of products
              const columnClasses =
                sortedProducts.length === 2
                  ? 'col-10 col-sm-8 col-md-6 col-lg-6 col-xl-6'
                  : 'col-10 col-sm-8 col-md-6 col-lg-4 col-xl-4';

              return (
                <div key={product.id} className={columnClasses}>
                  <ProductItemWeightLoss
                    product={product}
                    cardBackgroundColor={cardBackgroundColor}
                    productTitle={productTitle}
                    productSubtitle={productSubtitle}
                    productTitleClassName={productTitleClassName}
                    productSubtitleClassName={productSubtitleClassName}
                    productDescription={productDescription}
                    productDescriptionClassName={productDescriptionClassName}
                    productDescriptionByTier={productDescriptionByTier}
                    showProductDescription={showProductDescription}
                    showMultipleVials={showMultipleVials}
                    productImageSectionClassName={productImageSectionClassName}
                    pricingSectionClassName={pricingSectionClassName}
                    showProductTitle={showProductTitle}
                    showProductTitleSuffix={showProductTitleSuffix}
                    getStartedButtonStyle={getStartedButtonStyle}
                    badgeStyle={badgeStyle}
                    badgeClassName={badgeClassName}
                    badgeTextClassName={badgeTextClassName}
                    badgeTextSuffix={badgeTextSuffix}
                    glpHeaderClassName={glpHeaderClassName}
                    t={t}
                    headingColor={headingColor}
                    subHeadingColor={subHeadingColor}
                    priceColor={priceColor}
                    pricePeriodColor={pricePeriodColor}
                    popularTagColor={popularTagColor}
                  />
                </div>
              );
            })
          ) : (
            <div className='col-12 text-center'>
              <p>
                No {GLP1_GIP_PRODUCT_NAME} {GLP1_GIP_LABEL} products available
              </p>
            </div>
          )}
        </div>
      </div>
      {showBottomSubheading && (
        <p
          className={`${styles['plans-subheading']} text-center mt-5 tw-px-8`}
          style={{
            ...(textColor || subHeadingColor ? { color: textColor || subHeadingColor } : {}),
            ...(subHeadingFontSize ? { fontSize: subHeadingFontSize } : {}),
            ...(subHeadingFontFamily ? { fontFamily: subHeadingFontFamily } : {}),
            ...(subHeadingFontWeight ? { fontWeight: subHeadingFontWeight } : {}),
          }}
        >
          {plansBottomSubheading ||
            'HSA/FSA eligible. Use Klarna, Affirm, or Afterpay at checkout. Split your plan into smaller payments — no extra fees.'}
        </p>
      )}
    </section>
  );
}
