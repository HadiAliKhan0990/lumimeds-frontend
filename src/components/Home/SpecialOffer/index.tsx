'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { OlympiaCard } from '@/components/Home/SpecialOffer/includes/OlympiaCard';
import './styles.css';
import { ProductType } from '@/store/slices/productTypeSlice';

export default function SpecialOffer() {
  const products = useSelector((state: RootState) => state.productTypes);

  // Only show products where billingInterval and billingIntervalCount are null
  const specialOfferProducts = products.filter(
    (product) => product.prices?.[0]?.billingInterval === null && product.prices?.[0]?.billingIntervalCount === null
  );

  // Helper to check if a product is Olympia (optional, update as needed)
  const isOlympia = (product: ProductType) => !!product.name && product.name.toLowerCase().includes('olympia');

  return (
    <section className='container olympia-plans'>
      <p className='text-center'>Specials Lumimeds 503B</p>
      <p className='text-center description'>Discover a more advanced approach to weight care.</p>
      <p className='text-center description'>
        Our exclusive GLP-1/GIP plan—compounded in a highly regarded 503B facility and fulfilled by Olympia&apos;s
        trusted 503A pharmacy.
      </p>
      {specialOfferProducts.map((product) => (
        <OlympiaCard product={product} key={product.id} isOlympia={isOlympia(product)} />
      ))}
      <p className='text-center mb-0' style={{ fontSize: 14 }}>
        Compounded medications are available by prescription only. They are not FDA approved and have not been evaluated
        for safety and effectiveness by the FDA.&nbsp;
      </p>
    </section>
  );
}
