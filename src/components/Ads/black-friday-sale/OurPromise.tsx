import PlusIcon from '../../../assets/ads/black-friday-sale/plus-icon.svg';
import FollowGuid from '../../../assets/ads/black-friday-sale/follow-guid.png';
import TrustPilot from '../../../assets/ads/black-friday-sale/trustpilot-text.png';
import TrustStars from '../../../assets/ads/black-friday-sale/truststars.png';
import Image from 'next/image';
import { TrustpilotData } from '@/services/trustpilot';

interface Props {
  trustpilotData: TrustpilotData;
}

export default function OurPromise({ trustpilotData }: Readonly<Props>) {
  const rating = trustpilotData?.businessUnit?.trustScore || '4.6';
  return (
    <div className='tw-flex tw-flex-col tw-items-center tw-justify-center tw-px-5 md:tw-pt-20 tw-pt-10 lg:tw-max-w-[1640px] md:tw-max-w-[600px] tw-mx-auto tw-w-full'>
      <div>
        <h2 className='tw-font-[400] xl:tw-text-[52px] tw-text-4xl md:tw-leading-normal tw-leading-10 tw-text-black tw-text-center tw-mb-8'>
          Care Tailored to Your Goals
        </h2>
        <p className='tw-font-normal xl:tw-text-2xl md:tw-text-xl tw-text-base tw-leading-[100%] tw-text-[#4C4B4A] tw-text-center'>
          A program designed to bring structure and support to your weight-management routine, without pressure.
        </p>
      </div>

      <div className='tw-grid lg:tw-grid-cols-3 md:tw-grid-col-1 2xl:tw-gap-[60px] tw-gap-6 tw-w-full md:tw-mt-20 tw-mt-10'>
        <div className='lg:tw-px-[2.083vw] lg:tw-py-[2.5vw] md:tw-p-10 tw-p-8 tw-bg-[#001B55] tw-rounded-3xl tw-flex tw-flex-col tw-justify-evenly tw-items-start'>
          <Image src={PlusIcon} alt='PlusIcon' width={45} height={45} className='tw-h-[45px]' />
          <div className='tw-font-light xl:tw-text-[2.135vw] tw-text-2xl tw-leading-[127%] tw-text-[#FFFFFF] tw-pt-5'>
            Providing consistent support <span className='tw-opacity-30'>and</span> guidance{' '}
            <span className='tw-opacity-30'>to help you maintain steady progress</span> throughout your wellness journey
          </div>
        </div>

        <div className='tw-rounded-3xl'>
          <Image src={FollowGuid} alt='FollowGuid' className='tw-h-full' />
        </div>

        <div className='tw-rounded-3xl tw-bg-[#EAEAEA] lg:tw-px-[2.5vw] lg:tw-py-[4.167vw] md:tw-p-10 tw-p-8 tw-flex-col tw-justify-evenly'>
          <div>
            <div className='tw-font-normal md:tw-text-[5vw] tw-text-6xl tw-leading-[100%] tw-text-[#0D182A]'>
              {rating}
            </div>
            <div className='tw-font-light tw-text-[34px] tw-leading-[100%] tw-text-[#0D182A] tw-py-4'>Rating on</div>
            <Image src={TrustPilot} alt='TrustPilot' width={200} />
            <Image src={TrustStars} alt='Truststars' width={300} className='tw-mt-4' />
          </div>
        </div>
      </div>

      <div className='tw-text-[#737D97] tw-text-xs tw-w-full tw-text-center md:tw-pt-20 tw-pt-10'>
        Compounded medications are available by prescription only. They are not FDA approved and have not been evaluated
        for safety and effectiveness by the FDA.
      </div>
    </div>
  );
}
