import PlanCard from './PlanCard';
import Glp3 from '@/assets/glow-up/Glp-3.png';
import { ProductType, ProductPrice } from '@/store/slices/productTypeSlice';
import { GLP1_PRODUCT_NAME, GLP1_LABEL } from '@/constants/factory';

interface Props {
  data: ProductType[];
}

export default function GLP1Medications({ data }: Readonly<Props>) {
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
              fallbackImage={Glp3}
              imageAlt={`${GLP1_PRODUCT_NAME} ${GLP1_LABEL} medication vial`}
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
