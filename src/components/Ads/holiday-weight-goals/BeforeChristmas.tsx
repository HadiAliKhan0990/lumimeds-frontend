import Image from 'next/image';
import PlusIcon from '../../../assets/ads/christmas/plus-icon.svg';

const whyStartReasons = [
  'Start early to give your body time to adjust before the holidays',
  'Head into 2026 already ahead',
  'Avoid the January "new year, new me" panic',
];

const fitSections = [
  {
    title: "You're a great fit if:",
    items: [
      'You want support staying on track during the holidays',
      "You've tried dieting and felt stuck",
      'You want to go into January feeling proud and not overwhelmed',
    ],
  },
  {
    title: 'Not ideal if:',
    items: ['Pregnant or breastfeeding', 'Under 18', 'If you have certain medical conditions'],
  },
];

export default function BeforeChristmas() {
  return (
    <div className='tw-flex tw-flex-col tw-items-center tw-justify-center tw-px-4 lg:tw-max-w-[1640px] md:tw-max-w-full tw-mx-auto tw-w-full md:tw-mt-20 md:tw-pt-0 tw-pt-16'>
      <h2 className='tw-font-lumitype tw-font-bold tw-text-[#001B55] tw-uppercase lg:tw-text-[52px] md:tw-text-[40px] tw-text-[32px] md:tw-leading-[130%] tw-leading-[35px] tw-text-center tw-align-middle md:tw-mb-8 tw-mb-4'>
        Why Start Before Christmas?
      </h2>
      <div className='tw-grid md:tw-grid-cols-3 tw-grid-cols-1 xl:tw-gap-[72px] tw-gap-4'>
        {whyStartReasons.map((reason, index) => (
          <div
            key={index}
            className='tw-flex md:tw-flex-col tw-flex-row md:tw-gap-0 tw-gap-8 tw-items-center tw-justify-center tw-bg-[#001B55] md:tw-rounded-3xl tw-rounded-xl tw-font-lato tw-font-bold lg:tw-text-[2.135vw] md:tw-text-2xl tw-text-[23px] md:tw-leading-[127%] tw-leading-[127%] xl:tw-p-14 lg:tw-py-14 md:tw-px-4 tw-pl-11 tw-pr-8 tw-py-4 md:tw-py-8 tw-text-white md:tw-text-center tw-text-left xl:tw-min-h-[350px] tw-min-h-[120px]  md:tw-min-h-full'
          >
            <Image src={PlusIcon} alt='plus' className='tw-mt-4 md:tw-hidden' />
            {reason}
          </div>
        ))}
      </div>

      <div className='tw-w-full'>
        <h2 className='tw-font-lumitype tw-font-bold tw-text-[#001B55] tw-uppercase lg:tw-text-[52px] md:tw-text-[40px] tw-text-[32px] md:tw-leading-[130%] tw-leading-[100%] tw-text-center tw-align-middle md:tw-my-20 tw-my-16'>
          IS THIS RIGHT FOR YOU?
        </h2>
        <div className='tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-11'>
          {fitSections.map((section, sectionIndex) => (
            <div
              key={sectionIndex}
              className='tw-flex tw-flex-col tw-bg-[#001B55] tw-rounded-3xl tw-font-lato tw-font-bold lg:tw-px-14 md:tw-px-8 tw-px-8 lg:tw-py-[8.333vw] md:tw-py-10 tw-py-14 tw-text-white tw-text-center'
            >
              <div className='tw-text-left xl:tw-text-[2.135vw]  lg:tw-text-3xl md:tw-text-2xl tw-text-[27px] lg:tw-leading-[127%] '>
                <div className='tw-text-white tw-font-lato tw-font-bold lg:tw-mb-12 tw-mb-4'>{section.title}</div>
                {section.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className={`tw-text-white tw-font-lato tw-font-normal ${
                      itemIndex === section.items.length - 1 ? 'tw-mb-0' : 'lg:tw-mb-12 tw-mb-4'
                    }`}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
