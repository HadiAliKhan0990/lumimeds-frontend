'use client';

import { ProductType } from '@/store/slices/productTypeSlice';
import { PlanProduct } from '@/store/slices/productTypesApiSlice';
import { useTransition } from 'react';
import { Spinner } from 'react-bootstrap';
import Image from 'next/image';
import Link from 'next/link';
import { ProductCategoryKey } from '@/types/products';
import styles from './styles.module.scss';
import { GLP1_PRODUCT_NAME, GLP1_LABEL, GLP1_GIP_PRODUCT_NAME, GLP1_GIP_LABEL } from '@/constants/factory';

interface Props {
  product: ProductType | undefined;
  plan: PlanProduct;
  onSelect: (plan: PlanProduct) => void;
  categoryName: ProductCategoryKey;
  weightLossBadgeClassName?: string;
  inStockBadgeClassName?: string;
  productTitleClassName?: string;
  productSubtitleClassName?: string;
  getStartedButtonClassName?: string;
  learnMoreButtonClassName?: string;
}

export default function ProductCard({
  product,
  plan,
  onSelect,
  categoryName,
  weightLossBadgeClassName,
  inStockBadgeClassName,
  productTitleClassName,
  getStartedButtonClassName,
  learnMoreButtonClassName,
}: Readonly<Props>) {
  const [isPending] = useTransition();

  if (!product) return null;

  const handleOpenPricing = () => {
    if (plan) {
      onSelect(plan);
    }
  };

  const getProductTitle = () => {
    if (product.name?.toLowerCase().includes('glp-1/gip')) {
      return `${GLP1_GIP_PRODUCT_NAME} ${GLP1_GIP_LABEL}`;
    }
    return `${GLP1_PRODUCT_NAME} ${GLP1_LABEL}`;
  };

  const getProductSubtitle = () => {
    if (product.name?.toLowerCase().includes('glp-1/gip')) {
      return `${GLP1_GIP_LABEL} Injection`;
    }
    return `${GLP1_LABEL} Injection`;
  };

  return (
    <div className={styles.productCard}>
      {/* Header Badges */}
      <div className={styles.cardHeader}>
        <div className={`${styles.weightLossBadge} ${weightLossBadgeClassName || ''}`}>Weight Loss</div>
        <div className={`${styles.inStockBadge} ${inStockBadgeClassName || ''}`}>In stock</div>
      </div>

      {/* Product Title */}
      <div className={styles.productTitleSection}>
        <h3 className={`${styles.productTitle} ${productTitleClassName || ''}`}>{getProductTitle()} Injections</h3>
        <p className={styles.productSubtitle + 'text-black'}>{getProductSubtitle()}</p>
      </div>

      {/* Product Image */}
      {product?.image && (
        <div className={styles.productImageSection}>
          <Image src={product.image} alt={getProductTitle()} width={150} height={150} className={styles.productImage} />
        </div>
      )}

      {/* CTA Buttons */}
      <div className={`${styles.ctaSection} max-lg:!tw-mt-6`}>
        <button
          className={`${styles.getStartedButton} ${getStartedButtonClassName || ''}`}
          onClick={handleOpenPricing}
          disabled={isPending}
        >
          {isPending && <Spinner className='border-2 me-2' size='sm' />}
          Get Started
        </button>
        <Link
          className={`${styles.learnMoreButton} ${learnMoreButtonClassName || ''}`}
          href={`/products/${categoryName}`}
        >
          Learn More
        </Link>
      </div>
    </div>
  );
}
