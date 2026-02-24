import { PlansCard } from '@/components/Cards/PlansCard';
import { PlanProduct, ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import { ProductModal } from '@/components/Products/ProductModal';
import { useState } from 'react';
import { trackAddToCart } from '@/lib/tracking';
import { microsoftTrackAddToCart } from '@/helpers/uetTracking';
import styles from './PlansSection.module.scss';

interface Props {
  data: ProductTypesResponseData;
}

export default function PlansSection({ data }: Readonly<Props>) {
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
    <section className='py-5 mt-5 mb-5'>
      <div className={`${styles.weightLossTreatmentContainer} container px-3 px-md-4`}>
        <h2 className={`${styles.headingRich} text-center fw-normal mx-auto mb-5`}>
          Discover the <span className={styles.transformativePower}>transformative power</span> of weight loss, whether
          you&apos;re just starting your journey or already making progress toward your goals.
        </h2>

        <div className='row g-4 justify-content-center'>
          {data.glp_1_plans && (
            <div className='col-lg-6 col-md-6 col-12'>
              <PlansCard categoryName='glp_1_plans' product={data.glp_1_plans} onSelect={handleSelection} />
            </div>
          )}
          {data.glp_1_gip_plans && (
            <div className='col-lg-6 col-md-6 col-12'>
              <PlansCard categoryName='glp_1_gip_plans' product={data.glp_1_gip_plans} onSelect={handleSelection} />
            </div>
          )}
        </div>

        <p className='text-center text-deep-midnight mt-5'>
          * Prescription required. Your provider will determine whether a compounded drug product is right for you.
          Compounded drug products are not FDA-approved as they have not been evaluated by FDA for safety,
          effectiveness, or quality.
        </p>
      </div>
      <ProductModal show={show} setShow={setShow} selectedProduct={selectedProduct} />
    </section>
  );
}
