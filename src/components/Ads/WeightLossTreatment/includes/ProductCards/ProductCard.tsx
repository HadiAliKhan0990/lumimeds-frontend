'use client';

import { ProductType } from '@/store/slices/productTypeSlice';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Spinner } from 'react-bootstrap';
import { SurveyGetStartedButton } from '@/components/SurveyGetStartedButton';
import Image from 'next/image';
import styles from './styles.module.scss';
import { GLP1_PRODUCT_NAME, GLP1_LABEL, GLP1_GIP_PRODUCT_NAME, GLP1_GIP_LABEL } from '@/constants/factory';

interface Props {
  product: ProductType | undefined;
}

export default function ProductCard({ product }: Readonly<Props>) {
  const router = useRouter();

  const [isLearnMorePending, startLearnMoreTransition] = useTransition();

  if (!product) return null;

  const getProductTitle = () => {
    if (product.name?.toLowerCase().includes('glp-1/gip')) {
      return `${GLP1_GIP_PRODUCT_NAME} ${GLP1_GIP_LABEL}`;
    }
    return `${GLP1_PRODUCT_NAME} ${GLP1_LABEL}`;
  };

  const handleLearnMore = async () => {
    // Determine the product category and redirect accordingly
    if (product.name?.toLowerCase().includes('glp-1/gip')) {
      startLearnMoreTransition(() => router.push('/products/glp_1_gip_plans'));
    } else {
      startLearnMoreTransition(() => router.push('/products/glp_1_plans'));
    }
  };

  return (
    <div className={styles.productCard}>
      {/* Header Badges */}
      <div className={styles.cardHeader}>
        <div className={styles.weightLossBadge}>Weight Loss</div>
        <div className={styles.inStockBadge}>In stock</div>
      </div>

      {/* Product Title */}
      <div className={styles.productTitleSection}>
        <h3 className={styles.productTitle}>{getProductTitle()} Injections</h3>
      </div>

      {/* Product Image */}
      {product?.image && (
        <div className={styles.productImageSection}>
          <Image src={product.image} alt={getProductTitle()} width={150} height={150} className={styles.productImage} />
        </div>
      )}

      {/* CTA Buttons */}
      <div className={`!tw-mt-5 md:!tw-mt-0 ${styles.ctaSection}`}>
        <SurveyGetStartedButton product={product} className={styles.getStartedButton} />
        <button className={styles.learnMoreButton} onClick={handleLearnMore} disabled={isLearnMorePending}>
          {isLearnMorePending && <Spinner className='border-2 me-2' size='sm' />}
          Learn More
        </button>
      </div>
    </div>
  );
}
