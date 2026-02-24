'use client';

import { useState } from 'react';
import { trackAddToCart } from '@/lib/tracking';
import { microsoftTrackAddToCart } from '@/helpers/uetTracking';
import { ProductModal } from '@/components/Products/ProductModal';
import { PlansCard } from '@/components/Cards/PlansCard';
import { PlanProduct, ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import { ProductCategoryKey } from '@/types/products';

interface Props {
  data: ProductTypesResponseData;
}

export function ProductsPlans({ data }: Readonly<Props>) {
  const [show, setShow] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<PlanProduct>();
  const isNadEnabled = process.env.NEXT_PUBLIC_NAD_ENABLED === 'true';

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

  // Check if any products are available
  const hasGLP1Products = data.glp_1_plans?.products && data.glp_1_plans.products.length > 0;
  const hasGLP1GIPProducts = data.glp_1_gip_plans?.products && data.glp_1_gip_plans.products.length > 0;
  const hasAnyProducts = hasGLP1Products || hasGLP1GIPProducts;

  // Don't render the entire component if no products are available
  if (!hasAnyProducts) {
    return null;
  }

  return (
    <>
      {/* Weight Loss Injection Plans Section */}
      <section className='container-fluid py-5 my-4'>
        <div className='tw-max-w-[1200px] tw-mx-auto'>
          <h2 className='font-playfair mb-4 text-center display-2'>Personalized Products.</h2>
          <h2 className='font-playfair mb-4 text-center display-2'>Proven Results.</h2>


        <p className='text-lg mb-5 text-center title-description-for-cards'>

          Lumimeds offers weight loss and longevity injectables tailored to you, meaning every shot <br /> 
          works with your body. Think of it as healthier living through chemistry.
          </p>

          <div className='row g-4 justify-content-center'>
            {data.glp_1_plans && (
              <div className='col-lg-4 col-md-6 col-12'>
                <PlansCard categoryName='glp_1_plans' product={data.glp_1_plans} onSelect={handleSelection} />
              </div>
            )}
            {data.glp_1_gip_plans && (
              <div className='col-lg-4 col-md-6 col-12'>
                <PlansCard categoryName='glp_1_gip_plans' product={data.glp_1_gip_plans} onSelect={handleSelection} />
              </div>
            )}
            
            {isNadEnabled && data.nad_plans && (
              <div className='col-lg-4 col-md-6 col-12'>
                <PlansCard categoryName='nad_plans' product={data.nad_plans} onSelect={handleSelection} />
              </div>
            )}
          </div>

            <p className='text-center text-deep-midnight mt-5'>
              * Prescription required. Your provider will determine whether a compounded drug product is right for you.
              Compounded drug products are not FDA-approved as they have not been evaluated by FDA for safety,
              effectiveness, or quality.
            </p>
          </div>
        </section>

      <ProductModal show={show} setShow={setShow} selectedProduct={selectedProduct} />
    </>
  );
}
