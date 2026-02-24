import PlanCard from '@/components/Ads/science/includes/PlanCard';
import scienceVial from '@/assets/science-product.png';
import { ProductType, ProductPrice } from '@/store/slices/productTypeSlice';
import { GLP1_GIP_PRODUCT_NAME, GLP1_GIP_LABEL } from '@/constants/factory';

interface Props {
  data: ProductType[];
}

export default function SciencePlansSection({ data }: Readonly<Props>) {
  const activeProducts = data.filter(
    (product) => Array.isArray(product.prices) && product.prices.some((pr: ProductPrice) => pr.isActive)
  );

  return (
    <div className='science-plans container py-5'>
      <h2 className='plans-heading text-center mb-2'>
        {GLP1_GIP_PRODUCT_NAME} {GLP1_GIP_LABEL} Plans
      </h2>
      <p className='plans-subheading text-center mb-5'>Select a plan that fits your journey</p>
      <div className='d-flex flex-column gap-4'>
        {activeProducts.length > 0 ? (
          activeProducts
            .slice()
            .reverse()
            .map((product, index) => (
              <PlanCard
                key={product.id || index}
                product={product}
                fallbackImage={scienceVial}
                imageAlt={`${GLP1_GIP_PRODUCT_NAME} ${GLP1_GIP_LABEL} medication vial`}
              />
            ))
        ) : (
          <div className='text-center'>No plans available</div>
        )}
      </div>
    </div>
  );
}
