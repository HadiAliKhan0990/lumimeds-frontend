import { SurveyGetStartedButton } from '@/components/SurveyGetStartedButton';
import { ProductType } from '@/store/slices/productTypeSlice';
import Image from 'next/image';
import styles from './styles.module.scss';
import { GLP1_PRODUCT_NAME, GLP1_LABEL } from '@/constants/factory';
import { getRoundedPrice } from '@/helpers/products';

interface Props {
  product: ProductType;
}

export default function ProductItemSustainable({ product }: Readonly<Props>) {
  const renderProductImage = () => {
    // If it's a 3-month plan, show multiple vials using the same product image
    if (
      product.durationText?.toLowerCase().includes('3-month') ||
      product.durationText?.toLowerCase().includes('3 month')
    ) {
      // Show 3 vials for 3-month subscription - all using the same product image
      return (
        <div className={styles.multipleVialsContainer}>
          <Image
            src={product.image || '/vial_olympia.png'}
            alt={`${product.name} Vial 1`}
            width={100}
            height={250}
            className={`${styles.vialImage} ${styles.vial1}`}
          />
          <Image
            src={product.image || '/vial_olympia.png'}
            alt={`${product.name} Vial 2`}
            width={100}
            height={250}
            className={`${styles.vialImage} ${styles.vial2}`}
          />
          <Image
            src={product.image || '/vial_olympia.png'}
            alt={`${product.name} Vial 3`}
            width={100}
            height={250}
            className={`${styles.vialImage} ${styles.vial3}`}
          />
        </div>
      );
    } else if (product.image) {
      // Show single vial for monthly subscription using Next.js Image component
      return (
        <div className={styles.singleVialContainer}>
          <Image
            src={product.image}
            alt={`${product.name} Vial`}
            width={100}
            height={250}
            className={styles.vialImage}
          />
        </div>
      );
    }
  };

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
    <div className={`card ${styles.productCard}`}>
      {/* GLP-1 Header */}
      <div className={styles.glpHeader}>
        <div className={styles.titleContainer}>
          <h2 className={styles.glpTitle}>
            {GLP1_PRODUCT_NAME} {GLP1_LABEL} Injections
          </h2>
          <span className={styles.popularTag}>Value</span>
        </div>
        <h2 className={styles.glpSubtitle}>Weight Loss Injections</h2>
      </div>

      {/* Product Image Section */}
      <div className={styles.productImageSection}>{renderProductImage()}</div>

      {/* Pricing Section */}
      <div className={styles.pricingSection}>
        <div className={styles.priceDisplay}>
          <span className={styles.priceAmount}>${getPriceDisplay()}</span>
          {shouldShowMonthlySuffix() && <span className={styles.pricePeriod}>/mo</span>}
        </div>
      </div>

      {/* CTA Button */}
      <div className='d-flex justify-content-center'>
        <SurveyGetStartedButton
          className={`btn btn-light rounded-pill text-lg ${styles.responsiveCta}`}
          product={product}
        />
      </div>
    </div>
  );
}
