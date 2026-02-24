import React from 'react';
import Image from 'next/image';
import GirlPlank from '@/assets/ads/free/girl_plank.png';
import './styles.css';
import { GLP1_GIP_PRODUCT_NAME, GLP1_GIP_LABEL } from '@/constants/factory';

const FreePlansSection = () => {
  return (
    <div className='free-plans-section'>
      <div className='container'>
        <div className='row'>
          <div className='col-12 d-flex justify-content-center'>
            <div className='free-plans-image-container'>
              <Image src={GirlPlank} alt='Woman performing plank exercise' className='free-plans-image' priority />
            </div>
          </div>
          <h2 className='free-plans-title tw-font-normal mb-0'>{GLP1_GIP_PRODUCT_NAME}</h2>
          <div className='col-12 d-flex justify-content-center gap-2'>
            <h2 className='free-plans-title tw-font-normal mb-0'>{GLP1_GIP_LABEL}</h2>
            <h2 className='free-plans-title tw-font-bold'>Weight Loss Injection Plans</h2>
          </div>
          <div className='col-12 d-flex justify-content-center'>
            <h3 className='free-plans-subtitle'>Leverage dual-action treatment for a stronger impact.</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreePlansSection;
