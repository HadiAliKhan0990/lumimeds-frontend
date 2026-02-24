'use client';

import { PlanProduct, ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import { ProductCard } from '@/components/Products/ProductsList/ProductCard';
import { ProductsFaqSlider } from '@/components/Products/ProductsList/ProductsFaqSlider';
import { useState } from 'react';
import { ProductModal } from '@/components/Products/ProductModal';
import { trackAddToCart } from '@/lib/tracking';
import { microsoftTrackAddToCart } from '@/helpers/uetTracking';
import Certification from '@/components/Certification';
import CTA from '@/components/Home/CTA';
import 'swiper/css';
import 'swiper/css/navigation';
import { ProductCategoryKey } from '@/types/products';

interface Props {
  data: ProductTypesResponseData;
}

export default function ProductsList({ data }: Readonly<Props>) {
  const [show, setShow] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<PlanProduct>();

  function handleSelection(p: PlanProduct, categoryName?: ProductCategoryKey) {
    // Determine product category from categoryName or product data
    let productCategory: 'longevity' | 'weight_loss' = 'weight_loss';
    
    if (categoryName === 'nad_plans') {
      productCategory = 'longevity';
    } else if (categoryName === 'glp_1_plans' || categoryName === 'glp_1_gip_plans') {
      productCategory = 'weight_loss';
    } else if (p.categoryIds?.[0]?.toLowerCase().includes('nad')) {
      productCategory = 'longevity';
    }

    trackAddToCart({
      itemId: p.categoryIds[0],
      itemName: p.displayName || '',
      value: p.startingAmount,
      currency: 'USD',
      productCategory,
    });

    // Microsoft UET AddToCart tracking
    microsoftTrackAddToCart(
      p.categoryIds[0],
      p.displayName || '',
      p.startingAmount
    );

    setSelectedProduct(p);
    setShow(true);
  }

  return (
    <>
      <ProductModal show={show} setShow={setShow} selectedProduct={selectedProduct} />

      <section className='container medication_products'>
        <h1 className='tw-text-center tw-mb-5'>Explore Our Personalized Weight Loss & Wellness Plans</h1>
        {data.glp_1_plans && (
          <ProductCard
            categoryName='glp_1_plans'
            key={data.glp_1_plans.displayName}
            product={data.glp_1_plans}
            onSelectAction={handleSelection}
          />
        )}
        {data.glp_1_gip_plans && (
          <ProductCard
            categoryName='glp_1_gip_plans'
            key={data.glp_1_gip_plans.displayName}
            product={data.glp_1_gip_plans}
            onSelectAction={handleSelection}
          />
        )}
        {data.nad_plans && (
          <ProductCard
            categoryName='nad_plans'
            key={data.nad_plans.displayName}
            product={data.nad_plans}
            onSelectAction={handleSelection}
          />
        )}
      </section>
      <CTA />
      <ProductsFaqSlider />
      <Certification />
    </>
  );
}
