'use client';

import { useEffect, useRef, useState } from 'react';

const faqs = [
  {
    question: 'What medications are available through LumiMeds?',
    answer:
      'LumiMeds providers may prescribe Compounded Semaglutide (GLP-1) injections or Compounded Tirzepatide (GLP-1/GIP) when clinically appropriate. A licensed provider reviews your medical history to determine eligibility.',
  },
  {
    question: 'Do I need to visit a clinic in person?',
    answer:
      'No. LumiMeds offers a fully online evaluation and follow-up care. All provider consultations, messaging, and prescription management happen through our secure digital platform.',
  },
  {
    question: 'How does shipping work if I’m prescribed medication?',
    answer:
      'If a provider determines that treatment is appropriate, your prescription is filled by a U.S.-licensed pharmacy and shipped directly to your home. Delivery timelines vary by location and pharmacy. Exclusions may apply based on the prescribed medication and state of residence. Check state eligibility.',
  },
  {
    question: 'Do I need insurance to use LumiMeds?',
    answer:
      'No insurance is required. LumiMeds operates on transparent, cash-pay pricing so you always know what to expect.',
  },
  {
    question: 'Can I contact my provider during treatment?',
    answer:
      'Yes. LumiMeds gives you secure message access to your care team so you can ask questions, request support, or discuss your treatment plan at any time.',
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
    <div className='tw-px-5 xl:tw-pt-24 tw-pb-28'>
      <div className='tw-max-w-[1010px] tw-w-full tw-mx-auto tw-flex tw-flex-col md:tw-gap-14 tw-gap-6'>
        <div className='tw-text-center'>
          <h2 className='tw-font-lumitype md:tw-text-black-22 tw-text-blue-46 md:tw-text-[44px] tw-text-[32px] tw-leading-[130%] tw-mb-0'>
            Commonly Asked Questions
          </h2>
        </div>

        <div className='tw-flex tw-flex-col tw-gap-4 tw-font-lato'>
          {faqs.map((item, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={item.question}
                className={`tw-rounded-xl tw-overflow-hidden tw-transition-all tw-duration-300 tw-ease-in-out ${isOpen ? 'tw-bg-transparent' : 'tw-bg-[#EDF3FF] tw-border-0'
                  }`}
                style={{
                  transition: 'background 300ms ease-in-out, color 300ms ease-in-out, border-color 300ms ease-in-out',
                }}
              >
                <button
                  type='button'
                  onClick={() => toggle(idx)}
                  className={`tw-w-full tw-flex tw-items-center tw-justify-between tw-gap-4 md:tw-px-6 tw-px-4 md:tw-pl-10 tw-pl-4 md:tw-py-3 tw-py-2 md:tw-min-h-[70px] tw-h-full tw-min-h-14 tw-rounded-2xl tw-leading-normal ${isOpen ? 'tw-bg-black-22' : 'tw-bg-white'}`}
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
                  className={`tw-text-base md:tw-px-10 tw-px-4 tw-font-normal tw-leading-[140%] tw-transition-all tw-duration-300 tw-ease-out ${isOpen ? 'tw-opacity-100 tw-text-black-22 md:tw-mb-4 tw-mb-0 md:tw-mt-8 tw-mt-4' : 'tw-opacity-0 tw-pointer-events-none'
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
