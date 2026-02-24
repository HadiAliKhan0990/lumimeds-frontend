import Image from 'next/image';
import lumimeds from '@/assets/ads/new-year-new-you/lumimeds.png';

const sections = [
  {
    svgPaths: [
      { stroke: "#1C274C", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "9.5", d: "m45.7 70.9 12.6 12.6L89.8 52" },
      { stroke: "#1C274C", strokeLinecap: "round", strokeWidth: "9.5", d: "M36.25 13.178c9.267-5.36 20.025-8.428 31.5-8.428 34.794 0 63 28.206 63 63s-28.206 63-63 63-63-28.206-63-63c0-11.475 3.068-22.233 8.428-31.5" }
    ],
    title: "It's perfect if you:",
    items: [
      "Want medical oversight while exploring wellness options",
      "Prefer online, discreet care",
      "Value clarity, structure, and support"
    ]
  },
  {
    svgPaths: [
      { stroke: "#1C274C", strokeLinecap: "round", strokeWidth: "9.5", d: "M83.5 52 52 83.5M52 52l31.5 31.5M36.25 13.178c9.267-5.36 20.025-8.428 31.5-8.428 34.794 0 63 28.206 63 63s-28.206 63-63 63-63-28.206-63-63c0-11.475 3.068-22.233 8.428-31.5" }
    ],
    title: "It may NOT be a fit if you:",
    items: [
      "Are pregnant or breastfeeding",
      "Have a history of contraindications",
      "Are seeking a quick or guaranteed outcome"
    ]
  }
];

export default function GoodFit() {
  return (
    <div className='tw-font-lumitype tw-font-bold lg:tw-py-32 tw-pt-0 tw-pb-20 tw-px-5'>
      <h2 className='lg:tw-text-5xl tw-text-4xl tw-text-center tw-flex tw-justify-center md:tw-flex-row tw-flex-col tw-items-center md:tw-gap-0 tw-gap-5'>
        Is <span className='tw-text-blue-46'><Image src={lumimeds} alt='Lumimeds' className='lg:tw-w-[273px] tw-w-[120px] tw-mx-3' /></span>a Good Fit for You?
      </h2>
      <div className='tw-max-w-[881px] tw-mx-auto tw-mt-24 md:tw-mb-0 tw-mb-20 tw-w-full tw-flex tw-flex-col tw-gap-24'>
        {sections.map((section, index) => (
          <div key={index} className='tw-flex md:tw-flex-row tw-flex-col tw-items-center md:tw-gap-24 tw-gap-12'>
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" width="136" height="136" fill="none">
                {section.svgPaths.map((path, pathIndex) => (
                  <path
                    key={pathIndex}
                    stroke={path.stroke}
                    strokeLinecap={path.strokeLinecap}
                    strokeLinejoin={path.strokeLinejoin}
                    strokeWidth={path.strokeWidth}
                    d={path.d}
                  />
                ))}
              </svg>
            </div>
            <div>
              <h4 className='tw-text-2xl tw-font-lato tw-black-22 tw-font-bold'>{section.title}</h4>
              <ul className='tw-list-disc tw-pl-6 tw-font-lato tw-text-2xl tw-font-normal'>
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
