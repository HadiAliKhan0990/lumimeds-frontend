import { ProductType } from '@/store/slices/productTypeSlice';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import Products, { MedicationType } from './Products';

interface Props {
  data: ProductTypesResponseData;
}

const plans = [
  { type: 'tirzepatide', name: 'Tirzepatide', suffix: '(GLP-1/GIP)' },
  { type: 'semaglutide', name: 'Semaglutide', suffix: '(GLP-1)' },
] as const;

export default function Plan({ data }: Readonly<Props>) {
  const getProductsByType = (type: MedicationType): ProductType[] => {
    if (type === 'tirzepatide') {
      return data?.glp_1_gip_plans?.products?.filter(
        (product) => product.prices?.some((price) => price.isActive)
      ) || [];
    }
    return (
      data?.glp_1_plans?.products?.filter((product) => product.prices?.some((price) => price.isActive)) || []
    );
  };

  return (
    <div className='tw-flex tw-flex-col tw-items-center tw-justify-center tw-px-4 lg:tw-max-w-[1640px] md:tw-max-w-full tw-mx-auto tw-w-full'>
      <div className='tw-w-full'>
        {plans.map(({ type, name, suffix }, index) => (
          <div key={type}>
            <div className='tw-flex tw-flex-col tw-items-center tw-justify-center tw-mb-0'>
              <div
                className={`tw-relative tw-w-full tw-text-center tw-flex tw-items-center tw-justify-center tw-mt-10 
                  ${index === 0 ? 'xl:tw-mt-20 md:tw-mt-10 tw-mt-16' : 'xl:tw-mt-44 md:tw-mt-20 tw-mt-16'}`}
              >
                <h2 className='tw-font-normal md:tw-uppercase tw-normal-case xl:tw-text-[52px] md:tw-text-[36px] tw-text-[32px] md:tw-leading-[123%] tw-leading[100%] tw-text-black tw-bg-[#F3E6D5] xl:tw-max-w-[790px] md:tw-max-w-md md:tw-w-2/3 tw-w-full tw-z-10 tw-m-0 md:tw-mb-0 tw-mb-8'>
                  Compounded <br className='tw-hidden md:tw-block' />
                  {name} {suffix} <br className='tw-hidden md:tw-block' />{' '}
                  <span className='tw-font-bold'>Injection Plans</span>
                </h2>
                <div
                  className="tw-w-full tw-h-[1px] tw-bg-[#001B55] tw-top-1/2 tw-left-0 tw-transform tw-translate-y-1/2
                  tw-before:tw-content-[''] tw-before:tw-absolute tw-before:tw-inset-0
                  tw-before:tw-border tw-before:tw-border-[#001B55] tw-before:tw-pointer-events-none tw-absolute md:tw-block tw-hidden"
                ></div>
              </div>
            </div>
            <div className='tw-flex tw-gap-6 md:tw-py-8 tw-w-full'>
              <Products products={getProductsByType(type)} type={type} />
            </div>
            <div className='tw-text-[15px] tw-text-[#737D97] tw-font-lato tw-text-center md:tw-block tw-hidden'>
              Prescription required. Your provider will determine whether a compounded drug product is right for you.
              Compounded drug products are not FDA-approved as they have not been evaluated by FDA for safety,
              effectiveness, or quality.
            </div>
            <div className='tw-text-xs tw-text-[#737D97] tw-leading-[100%] tw-font-lato tw-text-center md:tw-hidden tw-block tw-max-w-[300px] tw-w-full tw-mx-auto'>
              Prescription required. Your provider will determine whether a compounded drug product is right for you.
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
