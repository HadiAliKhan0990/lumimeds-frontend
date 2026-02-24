import CalendarIcon from '@/components/Icon/CalendarIcon';
import CoinIcon from '@/components/Icon/CoinIcon';
import PersonIcon from '@/components/Icon/PersonIcon';

export const PLANS = [
  {
    title: (
      <>
        <div className='fw-bold'>Personalized</div>
        <div className='font-instrument-serif'>Treatment Plans</div>
      </>
    ),
    icon: (
      <>
        <CalendarIcon fill={'primary'} className={'d-lg-none'} width={42} height={42} />
        <CalendarIcon fill={'white'} className={'d-none d-lg-block'} width={42} height={42} />
      </>
    ),
    description: 'Personalized for you by medical professionals, including medication when suitable.',
  },
  {
    title: (
      <>
        <div className='fw-bold'>Monthly</div>
        <div className='font-instrument-serif'>Follow-Ups</div>
      </>
    ),
    icon: <PersonIcon width={42} height={42} />,
    description:
      'Includes initial visit with our licensed medical professional and registered dietitian with monthly follow-ups.',
  },
  {
    title: (
      <>
        <div className='fw-bold'>Transparent</div>
        <div className='font-instrument-serif'>Pricing</div>
      </>
    ),
    icon: <CoinIcon width={42} height={42} />,
    description:
      "Fixed prices, no matter the dosage. No hidden fees, no surprises. Your health shouldn't break the bank.",
  },
];
