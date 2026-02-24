export default function TrustBadges() {
  return (
    <div className='tw-bg-[#222A3F] tw-h-[70px] tw-w-full tw-flex'>
      <div className='tw-w-full tw-px-5 tw-mx-auto tw-flex tw-items-center tw-justify-around tw-font-lumitype tw-text-lg tw-text-[#F3FF53] tw-max-w-[1560px] xl:tw-justify-between tw-gap-5 2xl:tw-text-xl lg:tw-text-base tw-font-bold tw-whitespace-nowrap lg:tw-animate-none tw-animate-marquee'>
        <div>4.6/5 from 250+ patients</div>
        <div className='tw-flex tw-items-center tw-gap-2'>
          LegitScript Certified
          <div>
            <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none'>
              <path
                fill='#F3FF52'
                d='M.273 8.94 4 12.667l.94-.947L1.22 8m13.607-4.28-7.054 7.06L5 8l-.953.94 3.726 3.727 8-8m-3.773 0-.94-.947-4.233 4.233.946.94L12 4.667Z'
              />
            </svg>
          </div>
        </div>
        <div>U.S.-Licensed Providers & Pharmacy</div>
      </div>
    </div>
  );
}
