import React from 'react';
import Image from 'next/image';
import leftImage from '@/assets/glow-up/left.jpg';
import rightImage from '@/assets/glow-up/right.jpg';
import { GLP1_PRODUCT_NAME, GLP1_LABEL } from '@/constants/factory';

const Personalized: React.FC = () => {
  return (
    <section className='personalized-section py-5'>
      <div className='container'>
        <div className='personalized-content d-flex align-items-center justify-content-between gap-4'>
          {/* Left Image */}
          <div className='image-wrapper'>
            <Image src={leftImage} alt='Woman drinking water during workout' fill className='object-fit-cover' />
          </div>

          {/* Center Content */}
          <div className='text-content text-center flex-grow-1 mx-auto'>
            <h3 className='subheading mb-3'>Feel lighter. Live better.</h3>
            <h2 className='main-heading mb-4'>Personalized weight loss, backed by science.</h2>
            <p className='body-text mb-0'>
              Trusted {GLP1_PRODUCT_NAME} {GLP1_LABEL} treatments prescribed by licensed doctors and delivered
              discreetly from a certified pharmacy—because your health deserves expert care.
            </p>
          </div>

          {/* Right Image */}
          <div className='image-wrapper2'>
            <Image src={rightImage} alt='Person relaxing on grass' fill className='object-fit-cover' />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Personalized;
