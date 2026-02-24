'use client';
import { AdsPageGetInTouchSection } from '@/components/Ads/GetInTouchSection';

export default function ContactSection() {
  return (
    <section className='py-5 py-md-5'>
      <div className='container otp-container px-3 px-md-4'>
        <div className='otp-contact-card rounded-5 tw-p-1 sm:tw-p-0 mx-auto d-flex align-items-center justify-content-center'>
          <AdsPageGetInTouchSection />
        </div>
      </div>
    </section>
  );
}
