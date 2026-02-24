import ProductItemSustainable from './ProductItemSustainable';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import styles from './styles.module.scss';
import { useTranslations } from 'next-intl';

interface Props {
  productsData: ProductTypesResponseData;
  backgroundColor?: string;
  sectionClassName?: string;
  sectionStyle?: React.CSSProperties;
  cardBackgroundColor?: string;
  sectionHeadingColor?: string;
  headingColor?: string;
  subHeadingColor?: string;
  priceColor?: string;
  pricePeriodColor?: string;
  popularTagColor?: string;
  showHeading?: boolean;
  showSubheading?: boolean;
  showBottomSubheading?: boolean;
  plansHeading?: string;
  plansSubheading?: string;
  plansBottomSubheading?: string;
  textColor?: string;
  headingFontSize?: string;
  headingFontFamily?: string;
  headingFontWeight?: string | number;
  subHeadingFontSize?: string;
  subHeadingFontFamily?: string;
  subHeadingFontWeight?: string | number;
  subHeadingLineHeight?: string;
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
  buttonStyle?: {
    backgroundColor?: string;
    textColor?: string;
    hoverBackgroundColor?: string;
  };
  buttonClassName?: string;
  customPricingText?: string;
  testimonialsIntroText?: string;
  t?: ReturnType<typeof useTranslations>;
}

export default function ProductListSustainable({
  productsData,
  backgroundColor,
  sectionClassName,
  sectionStyle,
  cardBackgroundColor,
  sectionHeadingColor,
  headingColor,
  subHeadingColor,
  priceColor,
  pricePeriodColor,
  popularTagColor,
  showHeading = true,
  showSubheading = true,
  showBottomSubheading = true,
  plansHeading,
  plansSubheading,
  plansBottomSubheading,
  textColor,
  headingFontSize,
  headingFontFamily,
  headingFontWeight,
  subHeadingFontSize,
  subHeadingFontFamily,
  subHeadingFontWeight,
  subHeadingLineHeight,
  productTitle,
  productSubtitle,
  productTitleClassName,
  productSubtitleClassName,
  productDescription,
  productDescriptionClassName,
  productDescriptionByTier,
  showProductDescription = false,
  showMultipleVials,
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
  buttonStyle,
  buttonClassName,
  customPricingText,
  testimonialsIntroText,
  t,
}: Readonly<Props>) {
  // Use only GLP-1 products as requested and reverse order
  const glp1Products = productsData?.glp_1_plans?.products || [];
  const reversedProducts = glp1Products.slice().reverse();
  if (reversedProducts.length === 0) {
    return null;
  }
  return (
    <section
      className={`${styles.productListSection} ${sectionClassName || ''}`}
      style={{ backgroundColor: backgroundColor, ...sectionStyle }}
    >
      {showHeading && (
        <h2
          className={`${styles['plans-heading']} text-center mb-2`}
          style={{
            ...(textColor || sectionHeadingColor
              ? { color: textColor || sectionHeadingColor || '#FFE682' }
              : { color: '#FFE682' }),
            ...(headingFontSize ? { fontSize: headingFontSize } : {}),
            ...(headingFontFamily ? { fontFamily: headingFontFamily } : {}),
            ...(headingFontWeight ? { fontWeight: headingFontWeight } : {}),
          }}
          dangerouslySetInnerHTML={{
            __html: plansHeading || 'Compounded Semaglutide <br /> (GLP-1) Injections',
          }}
        />
      )}
      {showSubheading && (
        <p
          className={`${styles['plans-subheading']} text-center mb-5`}
          style={{
            ...(textColor || sectionHeadingColor
              ? { color: textColor || sectionHeadingColor || '#FFE682' }
              : { color: '#FFE682' }),
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
          {reversedProducts.map((product) => (
            <div key={product.id} className='col-lg-6 col-md-6 col-sm-8 col-10'>
              <ProductItemSustainable
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
                badgeStyle={badgeStyle}
                badgeClassName={badgeClassName}
                badgeTextClassName={badgeTextClassName}
                badgeTextSuffix={badgeTextSuffix}
                glpHeaderClassName={glpHeaderClassName}
                titleContainerClassName={titleContainerClassName}
                useHorizontalLayout={useHorizontalLayout}
                headingColor={headingColor}
                subHeadingColor={subHeadingColor}
                priceColor={priceColor}
                pricePeriodColor={pricePeriodColor}
                popularTagColor={popularTagColor}
                buttonStyle={buttonStyle}
                buttonClassName={buttonClassName}
                customPricingText={customPricingText}
                t={t}
              />
            </div>
          ))}
        </div>
        {showBottomSubheading && (
          <p
            className={`${styles['plans-subheading']} text-center mt-5`}
            style={{
              ...(textColor || sectionHeadingColor
                ? { color: textColor || sectionHeadingColor || 'white' }
                : { color: 'white' }),
              ...(subHeadingFontSize ? { fontSize: subHeadingFontSize } : {}),
              ...(subHeadingFontFamily ? { fontFamily: subHeadingFontFamily } : {}),
              ...(subHeadingFontWeight ? { fontWeight: subHeadingFontWeight } : {}),
              ...(subHeadingLineHeight ? { lineHeight: subHeadingLineHeight } : {}),
            }}
          >
            {plansBottomSubheading ||
              'HSA/FSA eligible. Use Klarna, Affirm, or Afterpay at checkout. Split your plan into smaller payments — no extra fees.'}
          </p>
        )}

        {/* Testimonials Introduction Text */}
        {testimonialsIntroText && (
          <div className={styles.testimonialsIntroContainer}>
            <p className={styles.testimonialsIntro}>{testimonialsIntroText}</p>
          </div>
        )}
      </div>
    </section>
  );
}
