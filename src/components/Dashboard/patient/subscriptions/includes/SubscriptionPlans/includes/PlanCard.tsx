import AsyncImgLoader from '@/components/AsyncImgLoader';
import { AsyncImage } from 'loadable-image';
import { Blur } from 'transitions-kit';
import { getRoundedPrice } from '@/helpers/products';
import { PlanProduct } from '@/store/slices/patientAtiveSubscriptionSlice';

interface Props {
  plan: PlanProduct;
  onLearnMore: (plan: PlanProduct) => void;
}

export function PlanCard({ plan, onLearnMore }: Readonly<Props>) {
  return (
    <div className='card flex-grow-1 rounded-12 p-4 d-flex flex-column border-frosted-glass'>
      <div className='mb-2 text-center flex-grow-1'>
        <h3 className='text-xl text-center'>{plan.displayName}</h3>
      </div>

      <div className='bg-cloud-blue rounded-12 p-3 my-4 overflow-hidden'>
        <AsyncImage
          src={plan.image}
          Transition={Blur}
          loader={<AsyncImgLoader />}
          alt={plan.displayName}
          className='w-64px h-160px async-image-contain mx-auto'
        />
      </div>

      <div className='text-center d-flex flex-column align-items-center'>
        <span className='text-black-50 align-self-center'>Starting at</span>
        <span className='text-primary fw-semibold text-3xl'>{`$${getRoundedPrice(plan.startingAmount)}/mo.`}</span>
        <span className='text-black-50'>{plan.planText}</span>
      </div>
      <div className='mt-4'>
        <button className='btn btn-primary py-2 w-100' onClick={() => onLearnMore(plan)}>
          See Plans
        </button>
      </div>
    </div>
  );
}
