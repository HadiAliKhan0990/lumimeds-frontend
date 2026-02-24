import CareBottle from '../../../assets/ads/christmas/care-bottles.png';
import Bullets from '../../../assets/ads/christmas/bullets.svg';
import snowflakeCarePlan from '../../../assets/ads/christmas/snowflake-care-plan.png';
import Image from 'next/image';

const carePlanItems = [
  'Full medical evaluation',
  'Unlimited messaging with your care team',
  'Fast, discreet delivery',
  'Ongoing provider support & dose adjustments',
  'Transparent monthly pricing',
];

export default function CarePlan() {
  return (
    <div className='tw-relative'>
      <div className='tw-flex tw-flex-col tw-items-center tw-justify-center xl:tw-px-12 tw-px-4 lg:tw-max-w-[1600px] tw-max-w-full tw-mx-auto tw-w-full md:tw-pt-8 tw-pt-16'>
        <h2 className='tw-font-lumitype tw-font-bold md:tw-text-[#001B55] tw-text-black xl:tw-text-[52px] md:tw-text-[40px] tw-text-[32px] xl:tw-leading-[100%] md:tw-leading-[50px] tw-leading-[100%] tw-uppercase tw-text-center tw-align-middle md:tw-mb-8 tw-mb-4'>
          Your LumiMeds Care Plan Includes:
        </h2>
        <div className='tw-grid md:tw-grid-cols-[45%_1fr] tw-grid-cols-1 lg:tw-gap-28 md:tw-gap-10 tw-w-full md:tw-pt-6 tw-pt-0'>
          <div className='tw-bg-[#719FFB] tw-min-h-[446px] tw-rounded-[26px] md:tw-flex tw-items-center tw-justify-center tw-hidden'>
            <Image src={CareBottle} alt='Care Bottles' className='xl:tw-w-[530px] lg:tw-w-96 md:tw-w-64' />
          </div>
          <div className='tw-flex tw-flex-col tw-justify-center'>
            <ul className='tw-list-none tw-p-0 tw-m-0 md:tw-mt-0 md:tw-mb-0 tw-mt-12 tw-mb-6'>
              {carePlanItems.map((item, index) => (
                <li
                  key={index}
                  className='tw-flex tw-items-center tw-gap-4 tw-text-[#232322] tw-font-lato md:tw-text-[23px] tw-text-[17px] tw-leading-[130%] md:tw-mb-8 tw-mb-5'
                >
                  <Image src={Bullets} alt='' aria-hidden='true' />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className='md:tw-text-xs tw-text-[9px] tw-text-[#737D97] md:tw-leading-normal tw-leading-[18px] tw-font-lato tw-text-center tw-mt-5'>
          Compounded medications are available by prescription only. They are not FDA approved and have not been
          evaluated for safety and effectiveness by the FDA.
        </div>
      </div>
      <div className='tw-absolute tw-top-0 tw-right-0 tw-z-index-[-1] tw-opacity-15 md:tw-block tw-hidden'>
        <Image src={snowflakeCarePlan} alt='snow flake Care Plan' aria-hidden='true' />
      </div>
      <div className='tw-absolute tw-bottom-0 -tw-left-36 tw-z-index-[-1] tw-opacity-15 md:tw-block tw-hidden'>
        <Image src={snowflakeCarePlan} alt='snow flake Care Plan' aria-hidden='true' />
      </div>
    </div>
  );
}
