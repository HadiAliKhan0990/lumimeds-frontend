import PlanCard from './PlanCard';
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
      <div className='text-center mb-5'>
        <div className='d-flex align-items-center justify-content-center' style={{ gap: '5rem' }}>
          <div className='flex-grow-1' style={{ height: '1px', backgroundColor: '#774116' }}></div>
          <h2 className='mx-4 mb-0' style={{ color: '#000', fontSize: '2rem', fontWeight: '400' }}>
            Our Plans
          </h2>
          <div className='flex-grow-1' style={{ height: '1px', backgroundColor: '#774116' }}></div>
        </div>
      </div>

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
