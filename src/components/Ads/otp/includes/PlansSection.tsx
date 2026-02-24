import { PlansCard } from '@/components/Cards/PlansCard';
import { PlanProduct, ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import { ProductModal } from '@/components/Products/ProductModal';
import { useState } from 'react';
import { trackAddToCart } from '@/lib/tracking';
import { ProductCategoryKey } from '@/types/products';

interface Props {
  data: ProductTypesResponseData;
}

export default function PlansSection({ data }: Readonly<Props>) {
  const [show, setShow] = useState(false);
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

    setSelectedProduct(p);
    setShow(true);
  }

  return (
    <section className="py-5 mt-5 mb-5">
      <div className="container otp-container px-3 px-md-4">
        <h2 className="otp-heading-rich text-center fw-normal mx-auto mb-5">
          Discover the{' '}
          <span className="otp-transformative-power">
            transformative power
          </span>{' '}
          of weight loss, whether you&apos;re just starting your journey or
          already making progress toward your goals.
        </h2>

        <div className="row g-4 justify-content-center">
          {data.glp_1_plans && (
            <div className='col-lg-6 col-md-6 col-12'>
              <PlansCard
                categoryName="glp_1_plans"
                product={data.glp_1_plans}
                onSelect={handleSelection}
              />
            </div>
          )}
          {data.glp_1_gip_plans && (
            <div className='col-lg-6 col-md-6 col-12'>
              <PlansCard
                categoryName="glp_1_gip_plans"
                product={data.glp_1_gip_plans}
                onSelect={handleSelection}
              />
            </div>
          )}
        </div>

        <p className="text-center text-deep-midnight mt-5">
          * Prescription required. Your provider will determine whether a
          compounded drug product is right for you. Compounded drug products
          are not FDA-approved as they have not been evaluated by FDA for
          safety, effectiveness, or quality.
        </p>
      </div>
      <ProductModal show={show} setShow={setShow} selectedProduct={selectedProduct} />
    </section>
  );
}
