"use client";

import Image from 'next/image';
import RevitalizePara from '@/assets/revitalize-para.png';

export default function WhatIs503B() {
  return (
    <section
      className="rev1-what-503b position-relative text-white d-flex align-items-center"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.35)), url(${RevitalizePara.src})`,
      }}
    >
      <Image src={RevitalizePara} alt="background" priority className="d-none" />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 text-center">
            <h2 className="display-4 fw-normal rev1-what-title">What is 503-B?</h2>
            <p className="lead rev1-what-text mx-auto">
              503-B is a specialized pharmacy designation that ensures high-quality, safe, and reliable compounded
              medications. You get the benefits of innovative care, backed by strict standards, and tailored to help you
              reach your goals.
            </p>
            <div className="rev1-divider mx-auto" />
          </div>
        </div>
      </div>
    </section>
  );
}


