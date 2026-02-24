'use client';

import { useEffect, useRef, useState } from 'react';

const faqs = [
  {
    question: 'What is included in the LumiMeds 3-Month Compounded Treatment Starter Pack?',
    answer:
      'The 3-month starter pack includes compounded medication prepared by a U.S.-licensed pharmacy, along with provider oversight throughout your introductory treatment period. You’ll also receive ongoing support resources, educational guidance, and access to your care team through the LumiMeds platform. This ensures you have everything you need to begin your treatment plan safely.',
  },
  {
    question: 'How does the LumiMeds online evaluation and treatment process work?',
    answer:
      'The LumiMeds process begins with a secure online medical evaluation. A licensed healthcare provider reviews your information to determine whether compounded GLP-1/GIP treatment is appropriate for you. If approved, your compounded medication is dispensed by a U.S.-licensed pharmacy and shipped directly to your home. Your provider remains available for check-ins and adjustments during your 3-month plan.',
  },
  {
    question: 'Can I pause or cancel my LumiMeds treatment plan?',
    answer:
      'Yes, LumiMeds allows you to pause or cancel your plan before your next billing cycle. This gives you flexibility and control over your 3-month starter pack and any future refills. If you need guidance before making changes, your provider can help advise based on your medical history.',
  },
  {
    question: 'What side effects can occur with compounded GLP-1/GIP treatment?',
    answer:
      'Some individuals may experience mild or temporary side effects such as nausea, digestive discomfort, or changes in appetite when starting compounded GLP-1/GIP treatment. A licensed provider will review all potential risks during your evaluation and will be available to support you throughout treatment. Always follow provider guidance to ensure safe use.',
  },
  {
    question: 'Is LumiMeds shipping discreet and secure?',
    answer:
      'Yes. LumiMeds uses unbranded, discreet packaging for all compounded medication shipments. There is no indication of the contents on the outside of the package, ensuring privacy and security throughout the delivery process.',
  },
  {
    question: 'Are compounded GLP-1/GIP medications the same as FDA-approved products?',
    answer:
      'Compounded GLP-1/GIP medications are not the same as FDA-approved products. These formulations are prepared by licensed compounding pharmacies to meet individual patient needs and are regulated under state and federal pharmacy compounding guidelines. Your LumiMeds provider will determine whether compounded medication is appropriate for your treatment plan.',
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
    <div className='tw-px-5 tw-py-16 tw-mt-16'>
      <div className='tw-max-w-[1010px] tw-w-full tw-mx-auto tw-flex tw-flex-col tw-gap-14'>
        <div className='tw-text-center'>
          <h2 className='tw-font-lumitype tw-text-[#222A3F] tw-text-[32px] md:tw-text-[44px] tw-leading-[110%] tw-mb-0'>
            Frequently Asked Questions
          </h2>
        </div>

        <div className='tw-flex tw-flex-col tw-gap-4'>
          {faqs.map((item, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={item.question}
                className={`tw-rounded-xl tw-border tw-overflow-hidden tw-transition-all tw-duration-300 tw-ease-in-out ${isOpen ? 'tw-bg-[linear-gradient(180deg,_#222A3F_0%,_#596EA5_100%)]' : 'tw-bg-white tw-border-[#C3C3C3]'
                  }`}
                style={{
                  transition: 'background 300ms ease-in-out, color 300ms ease-in-out, border-color 300ms ease-in-out',
                }}
              >
                <button
                  type='button'
                  onClick={() => toggle(idx)}
                  className='tw-w-full tw-flex tw-items-center tw-justify-between tw-gap-4 tw-px-6 tw-py-3'
                  aria-expanded={isOpen}
                >
                  <span
                    className={`tw-text-left md:tw-text-2xl tw-font-normal tw-transition-colors tw-duration-300 tw-ease-in-out ${isOpen ? 'tw-text-[#F3FF53]' : 'tw-text-black'
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
                  className={`tw-text-lg tw-px-6 tw-leading-[100%] tw-transition-all tw-duration-300 tw-ease-out ${isOpen ? 'tw-opacity-100 tw-text-white tw-mb-4' : 'tw-opacity-0 tw-pointer-events-none'
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
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="none"><path fill="#483CFF" d="M21.875 10.156h-7.031V3.125c0-.863-.7-1.563-1.563-1.563H11.72c-.863 0-1.563.7-1.563 1.563v7.031H3.125c-.863 0-1.563.7-1.563 1.563v1.562c0 .863.7 1.563 1.563 1.563h7.031v7.031c0 .863.7 1.563 1.563 1.563h1.562c.863 0 1.563-.7 1.563-1.563v-7.031h7.031c.863 0 1.563-.7 1.563-1.563V11.72c0-.863-.7-1.563-1.563-1.563Z" /></svg>
  );
}

function MinusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="5" fill="none"><path fill="#F3FF53" d="M20.313 0H1.563C.7 0 0 .7 0 1.563v1.562c0 .863.7 1.563 1.563 1.563h18.75c.862 0 1.562-.7 1.562-1.563V1.562C21.875.7 21.175 0 20.312 0Z" /></svg>
  );
}
