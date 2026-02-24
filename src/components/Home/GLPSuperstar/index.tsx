import React from 'react';
import './styles.css';
import DoctorImg from '@/assets/glp-superstar-1.png';
import Image from 'next/image';
import FooterLogo from '@/assets/logo-footer.png';

export default function GLPSuperstar() {
  return (
    <div className="bg-primary">
      <div className="container-lg glp-superstar-container position-relative">
        <div className="row gx-lg-5">
          <div className="col-12 bg-white text-center d-lg-none">
            <div className="text-2xl text-primary fw-bold py-2 py-sm-4">
              We work with GLP-1{' '}
              <span className="fw-normal underline-wavy font-instrument-serif">
                superstars
              </span>
            </div>
          </div>
          <div className="col-lg-5 pt-lg-3">
            <div className="glp-superstar-card_wrapper pt-5 pb-4 pb-lg-5 px-lg-4">
              <div className={'glp-superstar-card'}>
                <Image
                  className="glp-superstar-card-img object-fit-cover mb-4"
                  src={DoctorImg}
                  alt=""
                />
                <div className="text-white">
                  <p className="text-2xl fw-bold">Education</p>
                  <p className="text-xl fw-normal">
                    Bachelor of Science in Nursing Degree - University of South
                    Florida
                  </p>
                  <p className="text-xl fw-normal">
                    Master of Science in Nursing Degree - South University
                  </p>
                  <p className="text-xl fw-normal">
                    Master&apos;s Degree in Healthcare Law - University of
                    Oklahoma
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-7 bg-white">
            <div className="py-5 pb-lg-0 ps-lg-4">
              <p className="glp-superstar-title d-none d-lg-block mb-5">
                We work with GLP-1{' '}
                <span
                  style={{
                    fontFamily: 'Instrument Serif, serif',
                    fontWeight: 400,
                    fontStyle: 'italic',
                  }}
                >
                  superstars
                </span>
              </p>
              <p className="glp-superstar-name d-none d-lg-block">
                Nicole Baldwin
              </p>
              <p
                className="d-lg-none"
                style={{ fontSize: '24px', fontWeight: 'bold' }}
              >
                Nicole Baldwin
              </p>
              <p className="glp-superstar-subtext m-0 text-2xl">
                Nicole is a Board-Certified Family Nurse Practitioner currently
                providing telehealth services to patients across the United
                States. She is a GLP-1 superstar and one of the earliest
                prescribers of GLP-1 medications, with over four years of
                experience. She has treated thousands of patients and possesses
                a deep understanding of best practices for using these
                medications effectively, consistently achieving successful
                outcomes for her patients. She has extensive experience working
                with a diverse range of patients, including those with complex
                medical histories.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="content-wavy">
        <div className="container reliability-container">
          <div className="row text-white" style={{ position: 'relative' }}>
            <div
              className="col-12 col-lg-6 d-flex flex-column justify-content-center"
              style={{ rowGap: '16px' }}
            >
              <div className="content-wavy-img">
                <Image src={FooterLogo} quality={100} alt="" />
                <p className="m-0">is #1 IN RELIABILITY</p>
              </div>
              <p className="reliability-subtext text-small fw-normal">
                We partner exclusively with the best pharmacies, ensuring our
                patients receive safe and effective medication. Most orders are
                approved in less than 24 hours and delivered 2-3 days
                thereafter.
              </p>
            </div>
            <div className="col-12 col-lg-6 d-flex flex-column">
              <p className="reliability-pros">Best practice pharmacies</p>
              <p className="reliability-pros">Timely delivery</p>
              <p className="reliability-pros m-0">No hidden fees</p>
            </div>
          </div>
        </div>
        <svg
          style={{
            position: 'absolute',
            bottom: '-1px',
            left: 0,
            width: '100%',
          }}
          className="wave"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
        >
          <path
            fill="#FFFFFF"
            fillOpacity="1"
            d="M0,256 C120,224 240,160 360,144 C480,128 600,160 720,176 C840,192 960,192 1080,176 C1200,160 1320,128 1440,96 L1440,320 L0,320 Z"
          ></path>
        </svg>
      </div>
    </div>
  );
}
