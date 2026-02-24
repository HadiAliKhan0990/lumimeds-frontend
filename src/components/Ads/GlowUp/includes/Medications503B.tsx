import PlanCard from './PlanCard';
import { ProductType, ProductPrice } from '@/store/slices/productTypeSlice';

interface Props {
  data: ProductType[];
}

export default function Medications503B({ data }: Readonly<Props>) {
  const activeProducts = data.filter(
    (product) => Array.isArray(product.prices) && product.prices.some((pr: ProductPrice) => pr.isActive)
  );

  return (
    <div className='row g-4'>
      {activeProducts.length > 0 ? (
        activeProducts.map((product, index) => (
          <div className='col-12' key={product.id || index}>
            <PlanCard product={product} imageAlt='503-B medication vial' />
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
