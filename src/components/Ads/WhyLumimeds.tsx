interface WhyLumimedsProps {
  title: string;
  titleHighlight?: string;
  titleHighlightColor?: string;
  textColor?: string;
  padding?: string;
  healthJourneys?: string;
}

export default function WhyLumimeds({
  title,
  titleHighlight,
  titleHighlightColor = 'tw-text-blue-46',
  textColor = 'tw-text-black-22',
  padding = 'tw-pt-24 tw-pb-20',
  healthJourneys = '15k+',
}: WhyLumimedsProps) {
  return (
    <div
      className={`tw-flex tw-flex-col tw-items-center tw-justify-center tw-px-5 ${padding} lg:tw-max-w-[1640px] tw-mx-auto tw-w-full`}
    >
      <div className={`tw-max-w-[980px] tw-w-full ${textColor}`}>
        <h2 className='tw-font-normal tw-font-lumitype lg:tw-text-[44px] md:tw-text-[32px] tw-text-[10.233vw] md:tw-leading-[100%] tw-leading-[130%] tw-text-center'>
          {titleHighlight ? (
            <>
              {title} <span className={titleHighlightColor}>{titleHighlight}</span>
            </>
          ) : (
            title
          )}
        </h2>
        <div className='xl:tw-max-w-[884px] md:tw-max-w-[600px] tw-mx-auto tw-w-full tw-flex md:tw-flex-row tw-flex-col md:tw-gap-4 tw-gap-16 md:tw-pt-16 tw-pt-8 tw-justify-between tw-font-inter'>
          <div className='md:tw-gap-0 tw-gap-2 tw-flex tw-flex-col tw-font-lumitype tw-font-bold tw-text-center tw-text-[56px] tw-leading-[100%] tw-tracking-[-0.01em]'>
            <div className='tw-flex tw-items-center tw-gap-2 tw-justify-center'>4.6</div>
            <div className='tw-text-lg tw-font-lato tw-font-normal'>TrustPilot Rating</div>
          </div>
          <div className='md:tw-gap-0 tw-gap-2 tw-flex tw-flex-col tw-font-lumitype tw-font-bold tw-text-center tw-text-[56px] tw-leading-[100%] tw-tracking-[-0.01em]'>
            {healthJourneys}
            <div className='tw-text-lg tw-font-lato tw-font-normal'>Health Journeys</div>
          </div>
          <div className='md:tw-gap-0 tw-gap-2 tw-flex tw-flex-col tw-font-lumitype tw-font-bold tw-text-center tw-text-[56px] tw-leading-[100%] tw-tracking-[-0.01em]'>
            100%
            <div className='tw-text-lg tw-font-lato tw-font-normal'>Online Program</div>
          </div>
        </div>
      </div>
    </div>
  );
}
