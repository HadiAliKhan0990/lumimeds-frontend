'use client';

// import { IoMdSearch } from 'react-icons/io';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { shouldHideCalendlyFeature } from '@/helpers/featureFlags';

export default function HelpCenter() {
  const router = useRouter();
  const patientProfile = useSelector((state: RootState) => state.patientProfile);
  const hideCalendly = shouldHideCalendlyFeature(patientProfile?.email);

  const handleCardClick = (category: string) => {
    // You can customize the redirect logic based on the category
    switch (category) {
      case 'Medical/Clinical':
        window.open('https://lumimeds.telepath.clinic/chat', '_blank');
        break;
      case 'Billing':
        router.push('/patient/account?tab=payment');
        break;
      case 'My Account':
        router.push('/patient/account?tab=personal');
        break;
      case 'Shipping':
        router.push('/patient/messages?category=shipping');
        break;
      case 'Privacy & Security':
        router.push('/patient/messages?category=privacy');
        break;
      default:
        router.push('/patient/messages');
    }
  };

  return (
    <div className='container max-w-955'>
      <div className='text-center mb-4'>
        <h1 className='fw-bold'>Help Center</h1>
        <p className='fw-medium'>Find the answers you&apos;re looking for</p>
      </div>

      {/* <div className='d-flex align-items-center justify-content-between bg-white border rounded-pill px-3 py-2 mb-5 max-w-350 mx-auto my-auto'>
        <p className='mb-0 text-muted'>How can we help you?</p>
        <IoMdSearch size={20} />
      </div> */}

      <div className='row g-4'>
        {hideCalendly && (
          <div className='col-md-4'>
            <div 
              className='p-4 border rounded text-primary border-primary bg-white h-100 d-flex align-items-center justify-content-start cursor-pointer card-hover-border'
              onClick={() => handleCardClick('Medical/Clinical')}
            >
              <strong>Medical/Clinical</strong>
            </div>
          </div>
        )}
        <div className='col-md-4'>
          <div 
            className='p-4 border rounded bg-white h-100 d-flex align-items-center justify-content-start cursor-pointer card-hover-border'
            onClick={() => handleCardClick('Billing')}
          >
            <strong>Billing</strong>
          </div>
        </div>
        <div className='col-md-4'>
          <div 
            className='p-4 border rounded bg-white h-100 d-flex align-items-center justify-content-start cursor-pointer card-hover-border'
            onClick={() => handleCardClick('My Account')}
          >
            <strong>My Account</strong>
          </div>
        </div>
        <div className='col-md-4'>
          <div 
            className='p-4 border rounded bg-white h-100 d-flex align-items-center justify-content-start cursor-pointer card-hover-border'
            onClick={() => handleCardClick('Shipping')}
          >
            <strong>Shipping</strong>
          </div>
        </div>
        <div className='col-md-4'>
          <div 
            className='p-4 border rounded bg-white h-100 d-flex align-items-center justify-content-start cursor-pointer card-hover-border'
            onClick={() => handleCardClick('Privacy & Security')}
          >
            <strong>Privacy & Security</strong>
          </div>
        </div>
        <div className='col-md-4'>
          <div className='p-3 border rounded bg-white message-us-in-support h-100 d-flex align-items-center justify-content-start'>
            <p className='mb-1'>
              Can&apos;t find the answers you&apos;re looking for?{' '}
              <Link href='/patient/messages' className='fw-bold text-primary text-decoration-none'>
                Message us
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
