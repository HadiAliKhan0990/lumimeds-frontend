'use client';

import ProductItemSem from './ProductItemSem';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import styles from './styles.module.scss';
import { GLP1_PRODUCT_NAME, GLP1_LABEL } from '@/constants/factory';

interface Props {
  productsData: ProductTypesResponseData;
}

export default function ProductListSem({ productsData }: Readonly<Props>) {
  // Use only GLP-1 products as requested
  const glp1Products = productsData.glp_1_plans?.products || [];

  return (
    <section className={styles.productListSection}>
      <div className='container'>
        <div className='row g-4 justify-content-center'>
          {glp1Products.length > 0 ? (
            glp1Products.map((product) => (
              <div key={product.id} className='col-lg-6 col-md-6 col-sm-8 col-10'>
                <ProductItemSem product={product} />
              </div>
            ))
          ) : (
            <div className='col-12 text-center'>
              <p>
                No {GLP1_PRODUCT_NAME} {GLP1_LABEL} products available
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
