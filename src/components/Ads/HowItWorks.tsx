'use client';
import HowItWorksImg1 from '@/assets/ads/longevity-microdosages/work-01.png';
import HowItWorksImg3 from '@/assets/ads/longevity-microdosages/work-03.png';
import HowItWorksImg4 from '@/assets/ads/longevity-microdosages/work-04.png';
import Image from 'next/image';
import { useState, useRef, useCallback } from 'react';
import { ROUTES } from '@/constants';
import Link from 'next/link';

interface HowItWorksProps {
  productName?: string;
  receiveDescription?: string;
  backgroundColor?: string;
  buttonBackgroundColor?: string;
  buttonBackgroundColorMobile?: string;
  subtitleStartColor?: string;
  subtitleFinishColor?: string;
  numberColor?: string;
  numberColorDesktop?: string;
  formRoute?: string;
}

export default function HowItWorks({
  productName = 'microdosed',
  receiveDescription,
  backgroundColor = '',
  buttonBackgroundColor = 'tw-bg-black-22',
  buttonBackgroundColorMobile = 'tw-bg-blue-46',
  subtitleStartColor = 'md:tw-text-white tw-text-blue-46',
  subtitleFinishColor = 'md:tw-text-white tw-text-blue-46',
  numberColor = 'tw-text-[#4685F4]',
  numberColorDesktop = 'tw-text-white',
  formRoute = ROUTES.PATIENT_INTAKE,
}: Readonly<HowItWorksProps>) {
  const defaultReceiveDescription = `Receive your ${productName} injection: If ${
    productName === 'NAD+' ? 'NAD therapy' : 'microdosing'
  } is right for you, expect safe delivery to your door through a U.S.-licensed pharmacy.`;
  const finalReceiveDescription = receiveDescription || defaultReceiveDescription;

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [activeIndex, setActiveIndex] = useState(0);

  const slides = [
    {
      id: '01',
      title: ['QUALIFY'],
      description: 'Answer a quick health questionnaire: Your clinical review starts online, in minutes.',
      image: HowItWorksImg1,
      minHeight: 475,
    },
    {
      id: '02',
      title: ['RECEIVE'],
      description: finalReceiveDescription,
      image: HowItWorksImg3,
      minHeight: 460,
    },
    {
      id: '03',
      title: ['FOLLOW-UP'],
      description: 'Get ongoing support: Track progress and get guidance from your LumiMeds care team.',
      image: HowItWorksImg4,
      minHeight: 460,
    },
  ];

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;
    const cardWidth = container.offsetWidth;
    const newIndex = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.min(newIndex, slides.length - 1));
  }, [slides.length]);

  const handleIndicatorClick = (index: number) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current as HTMLElement;
    const cardWidth = container.offsetWidth;
    container.scrollTo({
      left: index * cardWidth,
      behavior: 'smooth',
    });
  };

  return (
    <div className={`tw-flex tw-flex-col tw-w-full xl:tw-p-28 md:tw-px-5 tw-py-20 ${backgroundColor}`}>
      <h2 className='lg:tw-text-[64px] md:tw-text-[54px] tw-leading-[100%] tw-text-4xl tw-font-lumitype tw-font-bold tw-text-[#222A3F] tw-text-center'>
        How It Works
      </h2>
      <h6 className='lg:tw-text-2xl tw-text-xl tw-font-lato tw-font-normal tw-text-[#222A3F] tw-text-center'>
        Fast and simple from <span className={`md:tw-font-normal tw-font-bold ${subtitleStartColor}`}>start</span> to{' '}
        <span className={`md:tw-font-normal tw-font-bold ${subtitleFinishColor}`}>finish.</span>
      </h6>
      <div className='md:tw-max-w-[930px] tw-w-full tw-mx-auto md:tw-mt-7 tw-mt-4 md:tw-px-5'>
        {/* Mobile View */}
        <div className='tw-relative tw-block md:tw-hidden'>
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className='tw-flex tw-overflow-x-auto tw-snap-x tw-snap-mandatory tw-gap-4 tw-scrollbar-hide tw-p-3 tw-w-full'
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {slides.map((slide) => (
              <div key={slide.id} className='tw-min-w-full tw-shrink-0 tw-snap-center'>
                <div className='tw-bg-white tw-max-w-[375px] tw-px-6 tw-mx-auto tw-rounded-xl tw-shadow-none tw-flex tw-flex-col tw-items-left tw-gap-3 tw-relative tw-min-h-[520px]'>
                  <div
                    className={`tw-font-lumitype tw-text-[65px] tw-absolute tw-top-4 tw-leading-[100%] ${numberColor}`}
                  >
                    {slide.id}
                  </div>

                  <Image
                    src={slide.image}
                    alt={`How It Works ${slide.id}`}
                    className='tw-w-full tw-max-w-full tw-relative tw-z-10 tw-ml-auto tw-mr-auto'
                  />
                  <h4 className='tw-font-lumitype tw-text-2xl tw-text-[#222A3F] tw-text-left tw-leading-tight tw-mb-0'>
                    {slide.title.map((line) => (
                      <span key={line} className='tw-block'>
                        {line}
                      </span>
                    ))}
                  </h4>
                  <div className='tw-text-base tw-text-left tw-text-[#222A3F] tw-font-lato tw-leading-snug'>
                    {slide.description}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dot indicators */}
          <div
            role='group'
            aria-label='Carousel navigation'
            className='tw-flex tw-justify-center tw-gap-2 tw-my-8 tw-mt-4'
          >
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type='button'
                onClick={() => handleIndicatorClick(index)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleIndicatorClick(index);
                  }
                }}
                aria-label={`Go to slide ${index + 1} of ${slides.length}`}
                aria-current={activeIndex === index ? 'true' : undefined}
                className={`tw-h-4 tw-w-4 tw-p-0 tw-rounded-full tw-transition-all tw-duration-300 tw-border-0 tw-outline-none focus-visible:tw-outline-2 focus-visible:tw-outline-blue-46 focus-visible:tw-outline-offset-2 ${
                  activeIndex === index ? 'md:tw-bg-white tw-bg-blue-46' : 'md:tw-bg-white/20 tw-bg-blue-46/30'
                }`}
              />
            ))}
          </div>
        </div>

        <div className='tw-hidden md:tw-grid md:tw-grid-cols-3 tw-gap-6'>
          {slides.map((slide) => (
            <div
              key={slide.id}
              className='lg:tw-min-w-[275px] md:tw-min-w-[180px] tw-mx-auto tw-relative tw-rounded-xl'
              style={{ minHeight: slide.minHeight || 460 }}
            >
              <div
                className={`tw-font-lumitype lg:tw-text-[64px] md:tw-text-[48px] tw-absolute lg:tw-top-2 md:tw-top-1 lg:tw-left-2 md:tw-left-1 tw-leading-[100%] ${numberColorDesktop}`}
              >
                {slide.id}
              </div>

              <Image src={slide.image} alt={`How It Works ${slide.id}`} className='tw-w-full' />

              <h4 className='tw-font-lumitype tw-text-2xl tw-text-[#222A3F] tw-mb-0 tw-leading-[100%] tw-mt-3'>
                {slide.title.join(' ')}
              </h4>

              <div className='tw-overflow-hidden tw-mt-2 tw-text-base tw-text-black-22 tw-font-lato tw-font-normal tw-leading-[100%]'>
                {slide.description}
              </div>
            </div>
          ))}
        </div>
        <div className='tw-mt-5 tw-hidden md:tw-block'>
          <Link
            href={formRoute}
            className={`tw-flex tw-items-center tw-justify-center tw-no-underline tw-w-full md:tw-h-12 ${buttonBackgroundColor} tw-font-bold tw-text-white tw-text-xl md:tw-text-xl tw-font-lumitype tw-rounded-full tw-transition-all tw-duration-300 hover:tw-shadow-lg`}
          >
            Start Your Online Evaluation
          </Link>
        </div>
        <div className='tw-mt-5 md:tw-hidden tw-block tw-px-6'>
          <Link
            href={formRoute}
            className={`tw-flex tw-items-center tw-justify-center tw-no-underline tw-w-full tw-h-[60px] ${buttonBackgroundColorMobile} tw-font-bold tw-text-white tw-text-[32px] tw-font-lumitype tw-rounded-full tw-transition-all tw-duration-300 hover:tw-shadow-lg`}
          >
            Start Now
          </Link>
        </div>
      </div>
    </div>
  );
}
