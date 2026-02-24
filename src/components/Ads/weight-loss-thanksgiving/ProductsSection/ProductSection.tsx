import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import Plans from './Plan';
import Plan2 from './Plan2';

interface Props {
  data: ProductTypesResponseData;
}

export default function ProductsSection({ data }: Readonly<Props>) {
  return (
    <>
      <div className='tw-w-full tw-flex tw-flex-col tw-items-center tw-justify-center tw-gap-3 md:tw-gap-4 lg:tw-gap-5 xl:tw-gap-6 tw-pt-16 md:tw-pt-24 lg:tw-pt-36 xl:tw-pt-44 tw-py-12 md:tw-py-20 lg:tw-py-28 xl:tw-py-36'>
        <p className='tw-text-white tw-text-[14px] md:tw-text-[22px] lg:tw-text-[28px] xl:tw-text-[37px] tw-font-poppins tw-leading-[133%] tw-font-bold tw-text-center max-sm:tw-mb-1'>
          This Thanksgiving celebrate feeling confident, <br /> energized, and in control.
        </p>
        <p className='tw-text-white tw-text-[9px] md:tw-text-[16px] lg:tw-text-[22px] xl:tw-text-[27px] tw-font-poppins tw-leading-[133%] tw-font-normal tw-text-center'>
          LumiMeds offers science-backed GLP-1 and GLP-1/GIP injection plans with <br /> medical oversight, monthly
          follow-ups, and no insurance required. Choose a <br /> plan that fits you, and start your journey toward
          sustainable results.
        </p>
      </div>
      <Plans data={data} />
      <Plan2 data={data} />
    </>
  );
}
