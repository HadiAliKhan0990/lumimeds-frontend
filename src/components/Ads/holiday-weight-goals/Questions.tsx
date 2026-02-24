'use client';
import GotQustion from '@/assets/ads/black-friday-sale/got-ques-banner.png';
import { AdsPageGetInTouchSection } from '../GetInTouchSection';

export default function Questions() {
  return (
    <div className='tw-flex tw-flex-col tw-items-center tw-justify-center tw-px-5 tw-max-w-[1640px] tw-mx-auto tw-w-full tw-mb-9'>
      <div
        className='tw-w-full tw-flex tw-bg-center xl:tw-h-[29.948vw] md:tw-h-[50vw] 2xl:tw-mb-0 md:tw-mb-8  tw-h-[auto] tw-rounded-2xl xl:tw-bg-contain tw-bg-cover tw-bg-no-repeat'
        style={{ backgroundImage: `url(${GotQustion.src})` }}
      >
        <AdsPageGetInTouchSection className='tw-w-full tw-flex tw-flex-col tw-justify-center tw-items-center tw-px-2 sm:tw-px-0' />
      </div>
    </div>
  );
}
