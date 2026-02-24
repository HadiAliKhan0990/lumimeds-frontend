import PlanListItem from './PlanListItem';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';

interface Props {
  data: ProductTypesResponseData;
}

export default function PlanList({ data }: Readonly<Props>) {
  return (
    <section className='plan-list-section'>
      <div className='container'>
        {/* Header Section */}
        <div className='plan-list-header'>
          <h1 className='plan-list-title'>Our Plans. Your Choice.</h1>
          <p className='plan-list-subtitle'>{`Find the plan that's right for you`}</p>
        </div>

        {/* Plans List */}
        <div className='plan-list-container'>
          {data?.olympiaPlans?.products && data.olympiaPlans?.products.length > 0 ? (
            data.olympiaPlans?.products.map((plan) => <PlanListItem key={plan.id} product={plan} />)
          ) : (
            <div className='text-center'>
              <p>No plans available</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
