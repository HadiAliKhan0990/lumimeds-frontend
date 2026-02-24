'use client';

import ProductItem from './ProductItem';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';

interface Props {
  productsData: ProductTypesResponseData;
}

export default function ProductList({ productsData }: Readonly<Props>) {
  return (
    <section className='product-list-section'>
      <div className='container'>
        <div className='product-list-container'>
          {productsData.olympiaPlans?.products && productsData.olympiaPlans?.products.length > 0 ? (
            productsData.olympiaPlans?.products.map((product) => <ProductItem key={product.id} product={product} />)
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
