import Icon1 from '../../../assets/ads/christmas/icon-1.svg';
import Icon2 from '../../../assets/ads/christmas/icon-2.svg';
import Icon3 from '../../../assets/ads/christmas/icon-3.svg';
import Icon4 from '../../../assets/ads/christmas/icon-4.svg';
import Image from 'next/image';

const benefits = [
  { icon: Icon1, alt: 'Icon showing extended satisfaction over time', text: ['Stay satisfied', 'longer'] },
  { icon: Icon2, alt: 'Icon depicting steady progress and results', text: ['See steady, real', 'results'] },
  { icon: Icon3, alt: 'Icon representing sustainable lifestyle habits', text: ['Build sustainable', 'eating habits'] },
  { icon: Icon4, alt: 'Icon illustrating appetite and craving management', text: ['Manage appetite and', 'cravings'] },
];

export default function PrescribedPatients() {
  return (
    <div className='tw-flex tw-flex-col tw-items-center tw-justify-center tw-px-4 lg:tw-max-w-[1640px] md:tw-max-w-full tw-mx-auto tw-w-full md:tw-pt-8 tw-pt-16'>
      <h2 className='tw-font-lumitype md:tw-normal-case tw-uppercase tw-font-bold tw-text-[#001B55] xl:tw-text-[57px] md:tw-text-[40px] tw-text-[21px] xl:tw-leading-[56px] md:tw-leading-[50px] tw-leading-[31px] tw-tracking-[-0.01em] tw-text-center tw-align-middle md:tw-mb-8 tw-mb-4'>
        Why Compounded GLP-1 Medications Are Prescribed for Some Patients
      </h2>
      <p className='tw-text-center md:tw-text-xs tw-text-[9px] tw-text-[#001B55] tw-font-lumitype tw-font-bold tw-mb-0'>
        Information below refers to FDA-approved GLP-1 class medications. Compounded medications have not been evaluated
        or approved by the FDA.
      </p>
      <div className='md:tw-mt-20 tw-mt-6 md:tw-mb-14 tw-mb-6 tw-text-center'>
        <h6 className='md:tw-text-[23px] tw-text-base tw-text-[#001B55] tw-font-lumitype md:tw-font-bold tw-font-normal md:tw-normal-case tw-uppercase'>
          These science-backed medications help you:
        </h6>
      </div>
      <div className='md:tw-flex tw-grid tw-grid-cols-2 tw-justify-between tw-gap-5 tw-w-full'>
        {benefits.map((benefit, index) => (
          <div
            key={'benifit-' + index}
            className='tw-font-lato md:tw-font-medium tw-font-bold tw-flex tw-flex-col tw-items-center tw-justify-between md:tw-gap-9 tw-gap-4 lg:tw-text-[23px] md:tw-text-lg tw-text-[17px] md:tw-leading-[31px] tw-leading-[24px] tw-tracking-[-0.01em] tw-text-center tw-text-[#001B55]'
          >
            <Image src={benefit.icon} alt={benefit.alt} className='md:tw-w-auto tw-w-[28px]' />
            {benefit.text[0]} <br /> {benefit.text[1]}
          </div>
        ))}
      </div>
    </div>
  );
}
