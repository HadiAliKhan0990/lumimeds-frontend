'use client';

import ProductItemBglp from '@/components/Ads/503-bglp-1/ProductCards/ProductItemBglp';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import styles from './styles.module.scss';

interface Props {
  productsData: ProductTypesResponseData;
}

export default function ProductListBglp({ productsData }: Readonly<Props>) {
  const bglp503Products = productsData.olympiaPlans?.products || [];
  const isSingleProduct = bglp503Products.length === 1;

  return (
    <section className={styles.productListSection}>
      <div className='container'>
        <div className={`row g-4 ${isSingleProduct ? 'justify-content-center' : ''}`}>
          {bglp503Products.length > 0 ? (
            bglp503Products.map((product) => (
              <div key={product.id} className={isSingleProduct ? 'col-lg-6 col-md-8 col-sm-10' : 'col-lg-6 col-md-12'}>
                <ProductItemBglp product={product} />
              </div>
            ))
          ) : (
            <div className='col-12 text-center'>
              <p className='text-white opacity-75 m-0'>No BGLP-503 products available</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
