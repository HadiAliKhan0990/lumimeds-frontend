'use client';

import LeftImage from '@/assets/ads/easy-weight-loss/herosection-left.png';
import CenterImage from '@/assets/ads/easy-weight-loss/herosection-mid.png';
import RightImage from '@/assets/ads/easy-weight-loss/herosection-right.png';
import { SurveyGetStartedButton } from '@/components/SurveyGetStartedButton';
import { GLP1_GIP_PRODUCT_NAME, GLP1_GIP_LABEL } from '@/constants/factory';

export default function HeroSection() {
  return (
    <section className='py-5 py-md-5'>
      <div className='container otp-container px-3 px-md-4'>
        <div className='text-center'>
          <h1 className='font-medium text-dark tw-text-2xl lg:tw-text-3xl xl:tw-text-4xl xl:tw-px-40'>
            Reach your goals with{' '}
            <span style={{ color: '#774116' }}>
              {GLP1_GIP_PRODUCT_NAME} {GLP1_GIP_LABEL} Injection treatment.{' '}
            </span>
            All-in support—simple, clear, and built for you.
          </h1>
        </div>

        <div className='row cards-container g-3 g-md-4 mt-4 mt-md-5 row-cols-1 row-cols-md-3 align-items-stretch'>
          {/* Left large photo card */}
          <div className='col' style={{ flex: '0 0 33%' }}>
            <div
              className='otp-photo-card otp-card-lg rounded-4 overflow-hidden position-relative'
              style={{ backgroundImage: `url(${LeftImage.src})` }}
            >
              <div className='tw-absolute tw-bottom-0 tw-left-0 tw-pb-4 tw-max-w-[100%] sm:tw-max-w-[100%] md:tw-max-w-[100%] lg:tw-max-w-[85%] xl:tw-max-w-[75%]'>
                <p className='tw-text-xs sm:tw-text-sm lg:tw-text-lg xl:tw-text-2xl tw-font-medium tw-text-white tw-mb-0 tw-px-2'>
                  Tailored GLP-1 treatment plans for your goals
                </p>
              </div>
            </div>
          </div>

          {/* Center stack: small photo + highlight */}
          <div className='col d-grid gap-3' style={{ flex: '0 0 25%' }}>
            <div
              className='otp-photo-card otp-card-sm rounded-4 overflow-hidden position-relative'
              style={{ backgroundImage: `url(${CenterImage.src})` }}
            >
              <div className='tw-absolute tw-bottom-0 tw-left-0 tw-right-0 tw-text-center tw-pb-4'>
                <p className='tw-text-xs sm:tw-text-sm lg:tw-text-lg xl:tw-text-2xl tw-font-medium tw-text-white tw-mb-0 tw-px-2'>
                  Easy-to-follow guidance for a healthier lifestyle
                </p>
              </div>
            </div>
            <div className='otp-highlight rounded-4 d-flex align-items-center justify-content-center text-center p-4 p-lg-5 h-100'>
              <div>
                <div className='display-6 fw-bold mb-1'>25%</div>
                <div className='small opacity-90'>faster results with plans designed just for you</div>
              </div>
            </div>
          </div>

          {/* Right tall photo card */}
          <div className='col' style={{ flex: '0 0 42%' }}>
            <div
              className='otp-photo-card otp-card-lg rounded-4 overflow-hidden position-relative'
              style={{ backgroundImage: `url(${RightImage.src})` }}
            >
              <div className='tw-absolute tw-bottom-0 tw-left-0 tw-pb-4 tw-max-w-[100%] sm:tw-max-w-[100%] md:tw-max-w-[65%] lg:tw-max-w-[100%] xl:tw-max-w-[100%]'>
                <p className='tw-text-xs sm:tw-text-sm lg:tw-text-lg xl:tw-text-2xl tw-font-medium tw-text-white tw-mb-0 tw-px-2'>
                  Continuous support to keep you on track
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className='text-center'>
          <h4 className='font-light mt-4 mb-0 md:tw-px-24 tw-text-lg lg:tw-text-2xl'>
            From medical care to personalized lifestyle guidance, plus help with coverage and a community by your
            side—we keep it straightforward. No hidden fees, just real results.
          </h4>
        </div>

        <div className='text-center'>
          <SurveyGetStartedButton
            className='mt-5 text-white tw-px-[64px] tw-py-[24px] tw-rounded-full mx-auto'
            style={{ backgroundColor: '#771618' }}
          />
          <p className='font-light tw-text-[12px] mt-1 mb-0'>One price. No hidden fees.</p>
        </div>

        <div className='text-center'>
          <div className='row g-4 mt-4'>
            <div className='col-6 col-md-3'>
              <div className='tw-text-[42px] fw-medium' style={{ color: '#774116' }}>
                10k+
              </div>
              <div className='tw-text-[24px] fw-light' style={{ color: '#2D2D2D' }}>
                Journeys
              </div>
            </div>
            <div className='col-6 col-md-3'>
              <div className='tw-text-[42px] fw-medium' style={{ color: '#774116' }}>
                92%
              </div>
              <div className='tw-text-[24px] fw-light' style={{ color: '#2D2D2D' }}>
                Success
              </div>
            </div>
            <div className='col-6 col-md-3'>
              <div
                className='tw-text-[42px] fw-medium tw-flex tw-items-center tw-justify-center'
                style={{ color: '#774116' }}
              >
                <div className='tw-text-[42px] fw-medium' style={{ color: '#774116' }}>
                  5
                </div>
                <svg className='tw-w-6 tw-h-6' fill='currentColor' viewBox='0 0 20 20'>
                  <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                </svg>
              </div>
              <div className='tw-text-[24px] fw-light' style={{ color: '#2D2D2D' }}>
                Trust Pilot
              </div>
            </div>
            <div className='col-6 col-md-3'>
              <div className='tw-text-[42px] fw-medium' style={{ color: '#774116' }}>
                100%
              </div>
              <div className='tw-text-[24px] fw-light' style={{ color: '#2D2D2D' }}>
                Online
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
