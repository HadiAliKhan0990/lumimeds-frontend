import Image from 'next/image';
import laptop from '@/assets/svg/aid.svg';
import aid from '@/assets/svg/aid.svg';
import chat from '@/assets/svg/chat.svg';
import calendar from '@/assets/svg/calendar.svg';

export default function PlansIncludeSection() {
  return (
    <div className='plans-include container py-5'>
      <h2 className='plans-title text-center mb-4 mb-md-5'>
        All <span className='muted'>Plans</span> Include
      </h2>

      <div className='row g-4 justify-content-center'>
        <div className='col-12 col-md-6 col-lg-3'>
          <div className='plan-card text-center d-flex flex-column align-items-center justify-content-center p-4'>
            <div className='plan-icon mb-3'>
              <Image src={laptop} alt='' width={40} height={40} />
            </div>
            <div className='plan-text'>Initial Telehealth Consult</div>
          </div>
        </div>

        <div className='col-12 col-md-6 col-lg-3'>
          <div className='plan-card text-center d-flex flex-column align-items-center justify-content-center p-4'>
            <div className='plan-icon mb-3'>
              <Image src={aid} alt='' width={40} height={40} />
            </div>
            <div className='plan-text'>Prescription + Medication</div>
          </div>
        </div>

        <div className='col-12 col-md-6 col-lg-3'>
          <div className='plan-card text-center d-flex flex-column align-items-center justify-content-center p-4'>
            <div className='plan-icon mb-3'>
              <Image src={chat} alt='' width={40} height={40} />
            </div>
            <div className='plan-text'>Real-Time Virtual Support</div>
          </div>
        </div>

        <div className='col-12 col-md-6 col-lg-3'>
          <div className='plan-card text-center d-flex flex-column align-items-center justify-content-center p-4'>
            <div className='plan-icon mb-3'>
              <Image src={calendar} alt='' width={40} height={40} />
            </div>
            <div className='plan-text'>Remote Monthly Check-Ins</div>
          </div>
        </div>
      </div>
    </div>
  );
}
