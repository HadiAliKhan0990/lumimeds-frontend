"use client";

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import type { ProductType } from '@/store/slices/productTypeSlice';
import FeaturedProductSection from '@/components/Ads/Revitalize1Month/includes/FeaturedProduct';
import WhatIs503B from '@/components/Ads/Revitalize1Month/includes/WhatIs503B';
import Testimonials from '@/components/Home/Testimonials';
import ContactSection from '@/components/Ads/ContactSection';
import Revitalize1Contact from '@/assets/revitalize1-contact.png';
import '@/components/Ads/otp/style.scss';
import HeroBg from '@/assets/hero-revitalize1.png';
import '@/components/Ads/Revitalize1Month/style.scss';
import ArrowRight from '@/assets/svg/ico-arrow-right-circle.svg';

interface Props {
  featuredProduct?: ProductType | null;
}

export default function Revitalized1Month({ featuredProduct }: Readonly<Props>) {
  return (
    <>
      <section
        className="rev1-hero position-relative d-flex align-items-center justify-content-center text-white w-100"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.45)), url(${HeroBg.src})`,
        }}
      >
        {/* Fallback hidden image to ensure Next optimizes asset */}
        <Image src={HeroBg} alt="Revitalize background" className="d-none" priority />

        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-10 text-center">
              <h1 className="rev1-title display-2 display-md-1 fw-normal">
                <span className="rev1-title-line d-block">Revitalize Your Body.</span>
                <span className="rev1-title-line d-block">
                  Renew <em>Your Energy</em>.
                </span>
              </h1>

              <p className="rev1-subtitle mx-auto">
                Experience a holistic approach to weightloss. It&apos;s not about achieving
                the perfect body - it&apos;s about helping you feel your best.
              </p>

              <div className="mt-3">
                <Link href="/products/summary" className="rev1-cta d-flex align-items-center justify-content-center gap-2">
                  <span className="me-2">GET STARTED</span>
                  <Image src={ArrowRight} alt="Arrow right" width={36} height={36} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FeaturedProductSection product={featuredProduct} />
      <WhatIs503B />
      <div className='mt-5 pt-5'>
        <Testimonials />
      </div>
      <div className='my-5 pt-5'>
        <ContactSection backgroundImageSrc={Revitalize1Contact.src} />
      </div>
    </>
  );
};
