'use client';

import ProductItemTirz from './ProductItemTirz';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import styles from './styles.module.scss';
import { GLP1_GIP_PRODUCT_NAME, GLP1_GIP_LABEL } from '@/constants/factory';

interface Props {
  productsData: ProductTypesResponseData;
}

export default function ProductListTirz({ productsData }: Readonly<Props>) {
  // Focus on GLP-1/GIP plans as requested
  const glp1GipProducts = productsData.glp_1_gip_plans?.products || [];

  // Reverse the order of products
  const sortedProducts = glp1GipProducts.slice().reverse();

  return (
    <section className={styles.productListSection}>
      <div className='container'>
        <div className='row g-4 justify-content-center'>
          {sortedProducts.length > 0 ? (
            sortedProducts.map((product) => (
              <div key={product.id} className='col-lg-4 col-md-6 col-sm-8 col-10'>
                <ProductItemTirz product={product} />
              </div>
            ))
          ) : (
            <div className='col-12 text-center'>
              <p>
                No {GLP1_GIP_PRODUCT_NAME} {GLP1_GIP_LABEL} products available
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
