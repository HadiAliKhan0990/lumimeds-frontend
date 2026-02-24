'use client';

import { useState } from 'react';
import { ProductTypesResponseData, PlanProduct } from '@/store/slices/productTypesApiSlice';
import { trackAddToCart } from '@/lib/tracking';
import { microsoftTrackAddToCart } from '@/helpers/uetTracking';
import { ProductModal } from '@/components/Products/ProductModal';
import ProductCard from './ProductCard';
import { CardHeading } from './CardHeading';
import styles from './styles.module.scss';

interface Props {
  data: ProductTypesResponseData;
  weightLossBadgeClassName?: string;
  inStockBadgeClassName?: string;
  productTitleClassName?: string;
  productSubtitleClassName?: string;
  getStartedButtonClassName?: string;
  learnMoreButtonClassName?: string;
}

export default function ProductCards({
  data,
  weightLossBadgeClassName,
  inStockBadgeClassName,
  productTitleClassName,
  getStartedButtonClassName,
  learnMoreButtonClassName,
}: Readonly<Props>) {
  const [show, setShow] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<PlanProduct>();

  function handleSelection(p: PlanProduct) {
    trackAddToCart({
      itemId: p.categoryIds[0],
      itemName: p.displayName || '',
      value: p.startingAmount,
      currency: 'USD',
    });

    // Microsoft UET AddToCart tracking
    microsoftTrackAddToCart(
      p.categoryIds[0],
      p.displayName || '',
      p.startingAmount,
      'USD'
    );

    setSelectedProduct(p);
    setShow(true);
  }

  return (
    <div className={styles.productCardsSection}>
      <CardHeading />
      <div className='container'>
        <div className={styles.cardsContainer}>
          {data.glp_1_plans && (
            <div className={styles.cardWrapper}>
              <ProductCard
                product={data.glp_1_plans?.products?.[0]}
                plan={data.glp_1_plans}
                onSelect={handleSelection}
                categoryName={'glp_1_plans'}
                weightLossBadgeClassName={weightLossBadgeClassName}
                inStockBadgeClassName={inStockBadgeClassName}
                productTitleClassName={productTitleClassName}
                getStartedButtonClassName={getStartedButtonClassName}
                learnMoreButtonClassName={learnMoreButtonClassName}
              />
            </div>
          )}
          {data.glp_1_gip_plans && (
            <div className={styles.cardWrapper}>
              <ProductCard
                product={data.glp_1_gip_plans?.products?.[0]}
                plan={data.glp_1_gip_plans}
                onSelect={handleSelection}
                categoryName={'glp_1_gip_plans'}
                weightLossBadgeClassName={weightLossBadgeClassName}
                inStockBadgeClassName={inStockBadgeClassName}
                productTitleClassName={productTitleClassName}
                getStartedButtonClassName={getStartedButtonClassName}
                learnMoreButtonClassName={learnMoreButtonClassName}
              />
            </div>
          )}
        </div>

        <p className={styles.disclaimerText}>
          Prescription medication is available only after an online evaluation with a healthcare provider. Physicians
          can prescribe compounded medications to meet patient needs or address drug shortages. The FDA does not review
          or approve compounded medications for safety or effectiveness. Results may vary. Actual product packaging may
          differ from what is shown.
        </p>
      </div>

      <ProductModal show={show} setShow={setShow} selectedProduct={selectedProduct} />
    </div>
  );
}
