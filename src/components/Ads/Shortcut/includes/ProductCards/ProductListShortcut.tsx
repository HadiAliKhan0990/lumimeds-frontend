'use client';

import ProductItemShortcut from './ProductItemShortcut';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import styles from './styles.module.scss';

interface Props {
  productsData: ProductTypesResponseData;
}

export default function ProductListShortcut({ productsData }: Readonly<Props>) {
  return (
    <section className={styles.productListSection}>
      <div className='container'>
        <div className={styles.productListContainer}>
          {productsData.olympiaPlans?.products && productsData.olympiaPlans?.products.length > 0 ? (
            productsData.olympiaPlans?.products.map((product) => (
              <ProductItemShortcut key={product.id} product={product} />
            ))
          ) : (
            <div className='text-center'>
              <p>No products available</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
