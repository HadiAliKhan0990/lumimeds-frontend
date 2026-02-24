'use client';

import { ProductType } from '@/store/slices/productTypeSlice';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { handleVerifyRedirectToCheckout } from '@/helpers/products';
import { Spinner } from 'react-bootstrap';
import Image from 'next/image';
import styles from './styles.module.scss';
import { GLP1_PRODUCT_NAME, GLP1_LABEL, GLP1_GIP_PRODUCT_NAME, GLP1_GIP_LABEL } from '@/constants/factory';

interface Props {
  product: ProductType | undefined;
}

export default function ProductCard({ product }: Readonly<Props>) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const checkout = useSelector((state: RootState) => state.checkout);
  const { isSurveyCompleted, checkoutUser } = checkout || {};

  if (!product) return null;

  const handleGetStarted = async () => {
    await handleVerifyRedirectToCheckout({
      selectedProduct: product,
      product: product,
      dispatch,
      startTransition,
      router,
      isSurveyCompleted,
      checkoutUser,
    });
  };

  const getProductTitle = () => {
    if (product.name?.toLowerCase().includes('glp-1/gip')) {
      return `${GLP1_GIP_PRODUCT_NAME} ${GLP1_GIP_LABEL}`;
    }
    return `${GLP1_PRODUCT_NAME} ${GLP1_LABEL}`;
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

      {/* CTA Button */}
      <div className={styles.ctaSection}>
        <button
          className={styles.ctaButton}
          onClick={handleGetStarted}
          disabled={isPending}
          data-tracking-id={`product-card-how-to-start-${
            product.id || product.name?.toLowerCase().replace(/\s+/g, '-')
          }`}
        >
          {isPending && <Spinner className='border-2 me-2' size='sm' />}
          Get Started
        </button>
      </div>
    </div>
  );
}
