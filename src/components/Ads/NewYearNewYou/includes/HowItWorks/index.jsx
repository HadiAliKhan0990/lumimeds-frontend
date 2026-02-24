'use client';
import HowItWorksImg1 from '@/assets/ads/new-year-new-you/work-01.png';
import HowItWorksImg3 from '@/assets/ads/new-year-new-you/work-03.png';
import HowItWorksImg4 from '@/assets/ads/new-year-new-you/work-04.png';
import Image from 'next/image';
import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants';
import { Spinner } from 'react-bootstrap';

export default function HowItWorks() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const scrollContainerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const slides = [
    {
      id: '01',
      description: 'Complete your online evaluation to learn whether treatment may be appropriate.',
      image: HowItWorksImg1,
    },
    {
      id: '02',
      description: 'Connect with a licensed provider who creates a personalized care plan.',
      image: HowItWorksImg3,
    },
    {
      id: '03',
      description: 'Receive your medication shipment quickly from a U.S.-licensed pharmacy (if prescribed).',
      image: HowItWorksImg4,
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

  const handleIndicatorClick = (index) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const cardWidth = container.offsetWidth;
    container.scrollTo({
      left: index * cardWidth,
      behavior: 'smooth',
    });
  };

  return (
    <div className='tw-flex tw-flex-col tw-w-full xl:tw-p-28 md:tw-px-5 tw-py-20'>
      <h2 className='lg:tw-text-[64px] md:tw-text-[54px] tw-leading-[100%] tw-text-4xl tw-font-lumitype tw-font-bold tw-text-black-22 tw-text-center'>How It Works</h2>
      <h6 className="lg:tw-text-2xl tw-text-xl tw-font-lato tw-font-normal tw-text-black-22 tw-text-center">Fast and simple from <span className='md:tw-text-blue-46 tw-text-blue-46 md:font-normal tw-font-bold'>start</span> to <span className='md:tw-text-blue-46 tw-text-blue-46 md:font-normal tw-font-bold'>finish.</span></h6>
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
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {slides.map((slide) => (
              <div key={slide.id} className='tw-min-w-full tw-shrink-0 tw-snap-center'>
                <div className='tw-bg-white tw-max-w-[375px] tw-px-6 tw-mx-auto tw-rounded-xl tw-shadow-none tw-flex tw-flex-col tw-items-left tw-gap-3 tw-relative tw-min-h-[520px]'>
                  <div className='tw-font-lumitype tw-text-[65px] tw-absolute tw-top-4 tw-leading-[100%] tw-text-blue-46'>{slide.id}</div>

                  <Image src={slide.image} alt={`How It Works ${slide.id}`} className='tw-w-full tw-max-w-full tw-relative tw-z-10 tw-ml-auto tw-mr-auto' />
                  <div className='tw-text-base tw-text-left tw-text-black-22 tw-font-lato tw-leading-snug'>
                    {slide.description}
                    {slide.note && <div className='tw-text-xs tw-text-[#5C6479] tw-mt-2'>{slide.note}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dot indicators */}
          <div
            role="group"
            aria-label="Carousel navigation"
            className='tw-flex tw-justify-center tw-gap-2 tw-my-8 tw-mt-4'
          >
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => handleIndicatorClick(index)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleIndicatorClick(index);
                  }
                }}
                aria-label={`Go to slide ${index + 1} of ${slides.length}`}
                aria-current={activeIndex === index ? 'true' : undefined}
                className={`tw-h-4 tw-w-4 tw-p-0 tw-rounded-full tw-transition-all tw-duration-300 tw-border-0 tw-outline-none focus-visible:tw-outline-2 focus-visible:tw-outline-blue-46 focus-visible:tw-outline-offset-2 ${activeIndex === index ? 'md:tw-bg-white tw-bg-blue-46' : 'md:tw-bg-white/20 tw-bg-blue-46/30'
                  }`}
              />
            ))}
          </div>
        </div>

        <div className='tw-hidden md:tw-grid md:tw-grid-cols-3 tw-gap-6 tw-mb-20'>
          {slides.map((slide) => (
            <div
              key={slide.id}
              className='lg:tw-min-w-[275px] md:tw-min-w-[180px] tw-mx-auto tw-relative tw-rounded-xl'
              style={{ minHeight: slide.minHeight || 400 }}
            >
              <div className='tw-font-lumitype lg:tw-text-[64px] md:tw-text-[48px] tw-absolute lg:tw-top-2 md:tw-top-1 lg:tw-left-2 md:tw-left-1 tw-leading-[100%] tw-text-blue-46'>{slide.id}</div>

              <Image src={slide.image} alt={`How It Works ${slide.id}`} className='tw-w-full' />

              <div className='tw-overflow-hidden tw-mt-6 md:tw-text-xl tw-text-base tw-text-black-22 tw-font-lato tw-font-normal !tw-leading-[100%]'>
                {slide.description}
              </div>
            </div>
          ))}
        </div>
        <div className='tw-hidden md:tw-block'>
          <button
            type='button'
            onClick={() => {
              setIsLoading(true);
              router.push(ROUTES.PATIENT_INTAKE).catch(() => setIsLoading(false));
            }}
            disabled={isLoading}
            className='tw-flex tw-items-center tw-justify-center tw-w-full md:tw-h-12 tw-bg-blue-46 tw-font-bold tw-text-white tw-text-xl md:tw-text-xl tw-font-lumitype tw-rounded-full tw-transition-all tw-duration-300 hover:tw-bg-black-600 hover:tw-shadow-lg hover:tw-scale-[1.02] disabled:tw-opacity-60 disabled:tw-cursor-not-allowed disabled:hover:tw-scale-100'
          >
            {isLoading && <Spinner className='border-2 tw-mr-2' size='sm' />}
            <span>Begin Your Online Evaluation</span>
          </button>
        </div>
        <div className='tw-mt-5 md:tw-hidden tw-block tw-mx-6'>
          <button
            type='button'
            onClick={() => {
              setIsLoading(true);
              router.push(ROUTES.PATIENT_INTAKE).catch(() => setIsLoading(false));
            }}
            disabled={isLoading}
            className='tw-flex tw-items-center tw-justify-center tw-w-full tw-h-[60px] tw-bg-blue-46 tw-font-bold tw-text-white tw-text-[32px] tw-font-lumitype tw-rounded-full tw-transition-all tw-duration-300 hover:tw-bg-blue-600 hover:tw-shadow-lg hover:tw-scale-[1.02] disabled:tw-opacity-60 disabled:tw-cursor-not-allowed disabled:hover:tw-scale-100'
          >
            {isLoading && <Spinner className='border-2 tw-mr-2' size='sm' />}
            <span>Start Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
