'use client';
import React from 'react';
import Contact from '@/assets/ads/easy-weight-loss/contact.png';
import { StaticImageData } from 'next/image';
import { AdsPageGetInTouchSection } from '@/components/Ads/GetInTouchSection';

interface Props {
  backgroundImage?: StaticImageData;
}

export default function ContactSection({ backgroundImage }: Readonly<Props>) {
  return (
    <section className='py-5 py-md-5'>
      <div className='container otp-container px-3 px-md-4'>
        <div
          className='otp-contact-card rounded-5 tw-p-1 sm:tw-p-0  mx-auto d-flex align-items-center justify-content-center'
          style={{ backgroundImage: `url(${(backgroundImage || Contact).src})` }}
        >
        <AdsPageGetInTouchSection />
        </div>
      </div>
    </section>
  );
}
