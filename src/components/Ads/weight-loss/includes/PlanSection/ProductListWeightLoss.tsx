'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProductItemWeightLoss from './ProductItemWeightLoss';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import styles from './styles.module.scss';
import { ProductType } from '@/store/slices/productTypeSlice';
import { GLP1_GIP_PRODUCT_NAME, GLP1_GIP_LABEL } from '@/constants/factory';

interface Props {
  productsData: ProductTypesResponseData;
}

export default function ProductListWeightLoss({ productsData }: Readonly<Props>) {
  const router = useRouter();

  // Use only GLP-1 GIP products as requested
  const glp1GipProducts = productsData?.glp_1_gip_plans?.products || [];

  // Sort products by effective displayed price (lowest first)
  const getEffectivePrice = (product: ProductType): number => {
    const duration = product?.durationText?.toLowerCase?.() || '';
    const isThreeMonth = duration.includes('3-month') || duration.includes('3 month');
    if (isThreeMonth) {
      return product?.dividedAmount || 0;
    }
    return product?.prices?.[0]?.amount || 0;
  };

  const sortedProducts = glp1GipProducts.slice().sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b));

  // Check if no products available and redirect to home
  useEffect(() => {
    if (glp1GipProducts.length === 0) {
      router.push('/');
    }
  }, [glp1GipProducts.length, router]);

  // Don't render anything if no products
  if (glp1GipProducts.length === 0) {
    return null;
  }

  return (
    <section className={styles.productListSection}>
      <div className='container'>
        <div className='row g-4 justify-content-center'>
          {glp1GipProducts.length > 0 ? (
            sortedProducts.map((product) => (
              <div key={product.id} className='col-lg-4 col-md-6 col-sm-8 col-10'>
                <ProductItemWeightLoss product={product} />
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
