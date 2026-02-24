import Image from 'next/image';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import BackgroundImage from '../../../../assets/ads/weight-loss-thanksgiving/Plans2.png';
import PlanCard2 from './PlanCard2';

interface Props {
  data: ProductTypesResponseData;
}

export default function Plan2({ data }: Readonly<Props>) {
  const glp1Category = data?.glp_1_plans;

  if (!glp1Category) {
    return null;
  }

  // const title = glp1Category.displayName || 'Compounded Tirzepatide (GLP-1/GIP)';
  const subtitle = glp1Category.summaryText || 'Injection Plans';

  return (
    <section className='tw-w-full tw-flex tw-justify-center tw-px-6 md:tw-px-10 lg:tw-px-12 xl:tw-px-16 tw-pt-0 tw-pb-0'>
      <div className='tw-relative tw-w-full tw-rounded-[36px] tw-overflow-hidden'>
        <div className='tw-absolute tw-inset-0 tw-bg-[#E3A588]' />
        <div
          className='tw-absolute tw-inset-0 tw-bg-center tw-bg-no-repeat tw-bg-cover'
          style={{ backgroundImage: `url(${BackgroundImage.src})` }}
        />

        <div className='tw-relative tw-flex tw-flex-col tw-items-center tw-justify-center tw-space-y-8 md:tw-space-y-10 lg:tw-space-y-12 tw-px-6 md:tw-px-12 xl:tw-px-16 tw-py-12 md:tw-py-16 xl:tw-py-20'>
          <div className='tw-flex tw-flex-col tw-items-center tw-justify-center tw-text-center tw-max-w-[1117px]'>
            {/* <p className='tw-text-[#6C361D] tw-font-poppins tw-text-[20px] md:tw-text-[24px] lg:tw-text-[30px] xl:tw-text-[41px] tw-leading-[160%] tw-font-normal tw-text-center tw-mb-2 lg:tw-mb-4'>
              {title}
            </p> */}
            <p className='tw-text-[#6C361D] tw-font-poppins tw-text-[20px] md:tw-text-[24px] lg:tw-text-[30px] xl:tw-text-[41px] tw-leading-[110%] tw-font-bold tw-text-center tw-mb-2 lg:tw-mb-4'>
              {subtitle}<span> Plans</span>
            </p>
          </div>

          <PlanCard2
            data={data}
            renderImage={(productImage) => (
              <Image
                src={productImage || glp1Category.image}
                alt='Compounded GLP-1/GIP medication bottles'
                fill
                sizes='320px'
                className='tw-object-contain tw-drop-shadow-[0_24px_60px_rgba(0,0,0,0.45)]'
                priority
              />
            )}
          />
          <div className='tw-w-full tw-flex tw-items-center tw-justify-center'>
            <p className='tw-text-[#6C361D] tw-font-secondary tw-text-[8px] md:tw-text-[11px] lg:tw-text-[15px] xl:tw-text-[19px] tw-leading-none md:tw-leading-[32px] tw-font-medium tw-text-center tw-mb-2 lg:tw-mb-4'>
              *All plans include prescription & medication (if approved), remote physician support, and monthly
              follow-ups.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
