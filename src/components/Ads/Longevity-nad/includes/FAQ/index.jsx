'use client';

import { useEffect, useRef, useState } from 'react';

const faqs = [
  {
    question: 'What is NAD Therapy?',
    answer:
      'Injectable NAD (nicotinamide adenine dinucleotide) is a form of vitamin B that occurs naturally in your body.',
  },
  {
    question: 'How long until I experience results?',
    answer:
      'It varies based on your age, current NAD levels, and overall health.',
  },
  {
    question: 'What are the side effects?',
    answer:
      'Reactions at the injection site, mild headaches, and gastrointestinal discomfort are the most common side effects.',
  },
  {
    question: 'Is this safe for everyone?',
    answer:
      'NAD therapy is designed for adults seeking wellness support, but it is not recommended for pregnant or breastfeeding individuals, people with certain medical conditions, or for treating diabetes. Your provider will review your health history to ensure it’s a safe fit for you. Our NAD injection is a compounded medication. Compounded medications are not FDA-approved and have not been evaluated for safety and efficacy.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(-1);
  const [contentHeights, setContentHeights] = useState([]);
  const contentRefs = useRef([]);

  const toggle = (idx) => {
    setOpenIndex((current) => (current === idx ? -1 : idx));
  };

  useEffect(() => {
    setContentHeights(
      contentRefs.current.map((el) => {
        if (!el) return 0;
        return el.scrollHeight;
      }),
    );
  }, [openIndex]);

  return (
    <div className='tw-px-5 xl:tw-pt-10 tw-pb-28'>
      <div className='tw-max-w-[1010px] tw-w-full tw-mx-auto tw-flex tw-flex-col md:tw-gap-14 tw-gap-6'>
        <div className='tw-text-center'>
          <h2 className='tw-font-lumitype tw-text-blue-46 tw-text-[24px] md:tw-text-[44px] tw-leading-[130%] tw-mb-0'>
            Commonly Asked Questions
            <span className='tw-text-black-22 tw-block'>about our Longevity Plans</span>
          </h2>
        </div>

        <div className='tw-flex tw-flex-col tw-gap-4'>
          {faqs.map((item, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={item.question}
                className={`tw-rounded-xl tw-overflow-hidden tw-transition-all tw-duration-300 tw-ease-in-out ${isOpen ? 'tw-bg-[white]' : 'tw-bg-[#EDF3FF] tw-border-0'
                  }`}
                style={{
                  transition: 'background 300ms ease-in-out, color 300ms ease-in-out, border-color 300ms ease-in-out',
                }}
              >
                <button
                  type='button'
                  onClick={() => toggle(idx)}
                  className={`tw-w-full tw-flex tw-items-center tw-justify-between tw-gap-4 md:tw-px-6 tw-px-4 md:tw-pl-10 tw-pl-4 md:tw-py-3 tw-py-2 md:tw-min-h-[70px] tw-h-full tw-min-h-14 tw-rounded-2xl tw-leading-normal ${isOpen ? 'tw-bg-blue-46' : ''}`}
                  aria-expanded={isOpen}
                >
                  <span
                    className={`tw-text-left md:tw-text-2xl tw-text-base tw-font-normal tw-transition-colors tw-duration-300 tw-ease-in-out ${isOpen ? 'tw-text-white' : 'tw-text-black-22'
                      }`}
                  >
                    {item.question}
                  </span>
                  <span className='tw-flex tw-transition-transform tw-duration-200' aria-hidden>
                    {isOpen ? <MinusIcon /> : <PlusIcon />}
                  </span>
                </button>

                <div
                  ref={(el) => {
                    contentRefs.current[idx] = el;
                  }}
                  className={`md:tw-text-xl tw-text-base md:tw-px-10 tw-px-4 tw-font-lato tw-font-normal tw-leading-[140%] tw-transition-all tw-duration-300 tw-ease-out ${isOpen ? 'tw-opacity-100 tw-text-black-22 md:tw-mb-4 tw-mb-0 md:tw-mt-8 tw-mt-4' : 'tw-opacity-0 tw-pointer-events-none'
                    }`}
                  style={{ maxHeight: isOpen ? `${contentHeights[idx] || 0}px` : '0px' }}
                >
                  {item.answer}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PlusIcon() {
  return (
    <>
      <div className='tw-hidden md:tw-block'>
        <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" fill="none"><rect width="44.578" height="44.578" fill="#EDF3FF" rx="22.289" /><path fill="#4685F4" d="m22.546 25.783 6.23-6.06a.73.73 0 0 0 0-1.053l-.458-.447a.782.782 0 0 0-1.084 0l-5.231 5.089-5.238-5.095a.772.772 0 0 0-.541-.217.773.773 0 0 0-.542.218l-.458.446a.73.73 0 0 0 0 1.053l6.235 6.066c.145.14.338.217.544.217.206 0 .399-.077.543-.217Z" /></svg>
      </div>
      <div className='tw-block md:tw-hidden'>
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none"><rect width="39.581" height="39.581" fill="#EDF3FF" rx="19.791" /><path fill="#4685F4" d="m20.02 22.893 5.531-5.38a.647.647 0 0 0 0-.936l-.407-.396a.695.695 0 0 0-.962 0l-4.645 4.518-4.65-4.523a.685.685 0 0 0-.481-.194.686.686 0 0 0-.481.194l-.407.396a.648.648 0 0 0 0 .935l5.537 5.386c.128.125.3.193.482.193a.686.686 0 0 0 .483-.193Z" /></svg>
      </div>
    </>
  );
}

function MinusIcon() {
  return (
    <>
      <div className='tw-hidden md:tw-block'>
        <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" fill="none"><rect width="44.578" height="44.578" fill="#EDF3FF" rx="22.289" /><path fill="#4685F4" d="m22.546 18.217 6.23 6.06a.73.73 0 0 1 0 1.053l-.458.447a.782.782 0 0 1-1.084 0l-5.231-5.089-5.238 5.095a.772.772 0 0 1-.541.217.773.773 0 0 1-.542-.218l-.458-.446a.73.73 0 0 1 0-1.053l6.235-6.066a.773.773 0 0 1 .544-.217c.206 0 .399.077.543.217Z" /></svg>
      </div>
      <div className='tw-block md:tw-hidden'>
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none"><rect width="39.581" height="39.581" fill="#EDF3FF" rx="19.791" /><path fill="#4685F4" d="m20.02 16.175 5.531 5.381a.647.647 0 0 1 0 .935l-.407.397a.695.695 0 0 1-.962 0l-4.645-4.519-4.65 4.524a.685.685 0 0 1-.481.193.686.686 0 0 1-.481-.193l-.407-.396a.648.648 0 0 1 0-.936l5.537-5.386a.685.685 0 0 1 .482-.192c.183 0 .354.068.483.192Z" /></svg>
      </div>
    </>
  );
}
