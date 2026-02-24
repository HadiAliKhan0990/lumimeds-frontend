import HowItWorksImg1 from '@/assets/ads/google-shopping/work-01.png';
import HowItWorksImg2 from '@/assets/ads/google-shopping/work-02.png';
import HowItWorksImg3 from '@/assets/ads/google-shopping/work-03.png';
import HowItWorksImg4 from '@/assets/ads/google-shopping/work-04.png';
import Lbs from '@/assets/ads/google-shopping/lbs-img.png';
import Hey from '@/assets/ads/google-shopping/hey-img.png';
import ViewPlan from '@/assets/ads/google-shopping/view-plan.png';
import Provider from '@/assets/ads/google-shopping/provider.png';
import OrderArrived from '@/assets/ads/google-shopping/order-arrived.png';
import NewMessage from '@/assets/ads/google-shopping/new-msg.png';
import Image from 'next/image';
import { useState } from 'react';

export default function HowItWorks() {
  const slides = [
    {
      id: '01',
      title: ['Quick online', 'evaluation'],
      description: 'Tell us your goals. It takes under 5 minutes.',
      image: HowItWorksImg1,
      overlays: [
        {
          src: Lbs,
          alt: 'Lbs',
          baseClass: 'tw-overflow-hidden tw-max-w-[144px] tw-rounded-md tw-absolute tw-top-[115px] tw-left-1',
          desktopHoverClass:
            'md:tw-opacity-0 md:group-hover:tw-opacity-100 md:tw-transition-all md:tw-duration-700 md:tw-ease-in-out md:tw-pointer-events-none',
        },
        {
          src: Hey,
          alt: 'Hey',
          baseClass: 'tw-overflow-hidden tw-max-w-[212px] tw-rounded-md tw-absolute tw-top-56 tw-right-0',
          desktopHoverClass:
            'md:tw-opacity-0 md:group-hover:tw-opacity-100 md:tw-transition-all md:tw-duration-700 md:tw-ease-in-out md:tw-pointer-events-none',
        },
      ],
      minHeight: 475,
    },
    {
      id: '02',
      title: ['Provider-guided', 'treatment plan'],
      description: 'A licensed clinician reviews your info and designs a personalized GLP-1/GIP plan.',
      image: HowItWorksImg2,
      overlays: [
        {
          src: ViewPlan,
          alt: 'View Plan',
          baseClass: 'tw-overflow-hidden tw-max-w-[144px] tw-rounded-md tw-absolute tw-top-[115px] tw-left-1',
          desktopHoverClass:
            'md:tw-opacity-0 md:group-hover:tw-opacity-100 md:tw-transition-all md:tw-duration-700 md:tw-ease-in-out md:tw-pointer-events-none',
        },
        {
          src: Provider,
          alt: 'Licensed Provider',
          baseClass: 'tw-overflow-hidden tw-max-w-[212px] tw-rounded-md tw-absolute tw-top-56 tw-right-0',
          desktopHoverClass:
            'md:tw-opacity-0 md:group-hover:tw-opacity-100 md:tw-transition-all md:tw-duration-700 md:tw-ease-in-out md:tw-pointer-events-none',
        },
      ],
      minHeight: 460,
    },
    {
      id: '03',
      title: ['Delivery to your door'],
      description: 'Your medication ships quickly and securely.*',
      image: HowItWorksImg3,
      note: '*If medication is prescribed.',
      overlays: [
        {
          src: OrderArrived,
          alt: 'Order Arrived',
          baseClass: 'tw-overflow-hidden tw-max-w-[212px] tw-rounded-md tw-absolute tw-top-56 tw-right-0',
          desktopHoverClass:
            'md:tw-opacity-0 md:group-hover:tw-opacity-100 md:tw-transition-all md:tw-duration-700 md:tw-ease-in-out md:tw-pointer-events-none',
        },
      ],
      minHeight: 460,
    },
    {
      id: '04',
      title: ['Follow up'],
      description: 'Your care team checks in regularly and helps you stay consistent.',
      image: HowItWorksImg4,
      overlays: [
        {
          src: NewMessage,
          alt: 'New Message',
          baseClass: 'tw-overflow-hidden tw-max-w-[144px] tw-rounded-md tw-absolute tw-top-[115px] tw-left-1',
          desktopHoverClass:
            'md:tw-opacity-0 md:group-hover:tw-opacity-100 md:tw-translate-x-4 md:group-hover:tw-translate-x-0 md:tw-transition-all md:tw-duration-700 md:tw-ease-in-out md:tw-pointer-events-none',
        },
      ],
      minHeight: 460,
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const goToSlide = (idx) => setCurrentSlide(idx);

  return (
    <div className='md:tw-bg-[#CCDFFF] tw-flex tw-flex-col tw-w-full tw-py-11'>
      <h2 className='md:tw-text-[64px] tw-text-[54px] tw-font-lumitype tw-font-bold tw-text-[#222A3F] tw-text-center'>How It Works</h2>
      <h6 className="md:tw-text-2xl tw-text-[21px] tw-font-lato md:tw-font-bold sm:tw-font-normal tw-text-[#222A3F] tw-text-center">Fast and simple from <span className='tw-text-[#4685F4] md:font-normal tw-font-bold'>start</span> to <span className='tw-text-[#4685F4] md:font-normal tw-font-bold'>finish.</span></h6>
      <span className='tw-text-center'>Included in your purchase:</span>
      <div className='md:tw-max-w-[1360px] tw-w-full tw-mx-auto md:tw-mt-16 tw-mt-8 md:tw-px-5'>
        {/* Mobile View */}
        <div className='tw-relative tw-block md:tw-hidden'>
          <div className='tw-overflow-hidden tw-rounded-xl'>
            <div
              className='tw-flex tw-transition-transform tw-duration-500 tw-ease-in-out'
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map((slide) => (
                <div key={slide.id} className='tw-w-full tw-shrink-0'>
                  <div className='tw-bg-[#E2ECFF] tw-max-w-[308px] tw-mx-auto tw-rounded-xl tw-shadow-sm tw-px-4 tw-py-6 tw-flex tw-flex-col tw-items-left tw-gap-3 tw-relative tw-min-h-full'>
                    <div className='tw-font-lumitype tw-text-[56px] tw-absolute tw-top-2 tw-text-[#4685F4]'>{slide.id}</div>

                    {slide.overlays?.map((overlay) => (
                      <div
                        key={`${slide.id}-${overlay.alt}-mobile`}
                        className={`${overlay.baseClass} tw-opacity-100 tw-pointer-events-none tw-z-50`}
                      >
                        <Image src={overlay.src} alt={overlay.alt} className='tw-w-full' />
                      </div>
                    ))}

                    <Image src={slide.image} alt={`How It Works ${slide.id}`} className='tw-w-full tw-max-w-[260px] tw-relative tw-z-10 tw-ml-auto tw-mr-auto' />
                    <h4 className='tw-font-lumitype tw-text-2xl tw-text-[#222A3F] tw-text-left tw-leading-tight tw-mb-0'>
                      {slide.title.map((line) => (
                        <span key={line} className='tw-block'>
                          {line}
                        </span>
                      ))}
                    </h4>
                    <div className='tw-text-base tw-text-left tw-text-[#222A3F] tw-font-lato tw-leading-snug'>
                      {slide.description}
                      <div className='tw-text-xs tw-text-[#5C6479] tw-mt-2'>{slide.note}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type='button'
            aria-label='Previous step'
            onClick={prevSlide}
            className='tw-absolute tw-top-[45%] tw-left-2 sm:tw-left-6 tw-w-[22px] tw-h-[29px] tw-flex tw-items-center tw-justify-center tw-p-0'
          >
            <span aria-hidden>
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="36" fill="none"><path stroke="#222A3F" stroke-linecap="round" stroke-linejoin="round" stroke-width="7" d="M18.5 32.5 3.5 18l15-14.5" /></svg>
            </span>
          </button>

          <button
            type='button'
            aria-label='Next step'
            onClick={nextSlide}
            className='tw-absolute tw-top-[45%] tw-right-2 sm:tw-right-6 tw-w-[22px] tw-h-[29px] tw-flex tw-items-center tw-justify-center tw-p-0'
          >
            <span aria-hidden>
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="36" fill="none"><path stroke="#222A3F" stroke-linecap="round" stroke-linejoin="round" stroke-width="7" d="m3.5 3.5 15 14.5-15 14.5" /></svg>
            </span>
          </button>

          <div className='tw-flex tw-justify-center tw-gap-2 tw-mt-4'>
            {slides.map((slide, idx) => {
              const isActive = idx === currentSlide;
              return (
                <button
                  key={slide.id}
                  type='button'
                  aria-label={`Go to step ${slide.id}`}
                  aria-current={isActive}
                  onClick={() => goToSlide(idx)}
                  className={`tw-h-[18px] tw-p-0 tw-w-[18px] tw-rounded-full tw-transition-colors tw-duration-200 ${isActive ? 'tw-bg-[#4685F4] tw-border-2 tw-border-[#4685F4] tw-border-solid' : 'tw-bg-white tw-border-2 tw-border-solid tw-border-[#4685F4]'
                    }`}
                />
              );
            })}
          </div>
        </div>

        <div className='tw-hidden md:tw-grid xl:tw-grid-cols-4 md:tw-grid-cols-2 lg:tw-gap-16 md:tw-gap-10'>
          {slides.map((slide) => (
            <div
              key={slide.id}
              className='tw-max-w-[275px] tw-mx-auto tw-px-4 tw-py-6 tw-relative tw-group tw-rounded-xl tw-transition-all tw-duration-700 tw-ease-out hover:tw-bg-white/30 hover:tw--translate-y-2'
              style={{ minHeight: slide.minHeight || 460 }}
            >
              <div className='tw-font-lumitype tw-text-[64px] tw-absolute tw-top-3 tw-left-2 tw-leading-[100%] tw-text-[#4685F4]'>{slide.id}</div>

              {slide.overlays?.map((overlay) => (
                <div
                  key={overlay.alt}
                  className={`${overlay.baseClass} ${overlay.desktopHoverClass || ''}`}
                >
                  <Image src={overlay.src} alt={overlay.alt} className='tw-w-full' />
                </div>
              ))}

              <Image src={slide.image} alt={`How It Works ${slide.id}`} className='tw-w-full' />

              <h4 className='tw-font-lumitype tw-text-2xl tw-text-[#222A3F] tw-mb-0 tw-leading-[100%] tw-mt-2'>
                {slide.title.map((line) => (
                  <span key={line} className='tw-block'>
                    {line}
                  </span>
                ))}
              </h4>

              {slide.note ? (
                <div className='tw-inline-block tw-text-xs tw-text-[#5C6479] tw-font-lato tw-font-medium tw-transition-opacity tw-duration-300 group-hover:tw-opacity-0 group-hover:tw-invisible'>
                  {slide.note}
                </div>
              ) : null}

              <div className='tw-overflow-hidden tw-text-sm tw-mt-6 tw-max-h-0 group-hover:tw-max-h-full tw-opacity-0 group-hover:tw-opacity-100 tw-transition-all tw-duration-700 tw-ease-in-out tw-pointer-events-none'>
                {slide.description}
                {slide.note ? <div className='tw-pt-3 tw-text-xs tw-text-[#5C6479] tw-font-lato tw-font-medium'>{slide.note}</div> : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
