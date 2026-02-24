import PlanCard from './PlanCard';
import { ProductType, ProductPrice } from '@/store/slices/productTypeSlice';
import GlpGip3 from '@/assets/glow-up/Glp-Gip-1.png';
import { GLP1_GIP_PRODUCT_NAME, GLP1_GIP_LABEL } from '@/constants/factory';

interface Props {
  data: ProductType[];
}

export default function GLP1GIPMedications({ data }: Readonly<Props>) {
  const activeProducts = data.filter(
    (product) => Array.isArray(product.prices) && product.prices.some((pr: ProductPrice) => pr.isActive)
  );

  return (
    <div className='row g-4'>
      {activeProducts.length > 0 ? (
        activeProducts.map((product, index) => (
          <div className='col-12' key={product.id || index}>
            <PlanCard
              product={product}
              fallbackImage={GlpGip3}
              imageAlt={`${GLP1_GIP_PRODUCT_NAME} ${GLP1_GIP_LABEL} dual-action medication vial`}
            />
          </div>
        ))
      ) : (
        <div className='col-12 text-center'>
          <p>No plans available</p>
        </div>
      )}
    </div>
  );
}
