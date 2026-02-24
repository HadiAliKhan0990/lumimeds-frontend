import React from 'react';
import './styles.css';
import Image from 'next/image';

export default function Certification() {
  return (
    <section className='certification-section'>
      <div className='container'>
        <div className='max-w-771 mx-auto'>
          <div className='row align-items-center justify-content-center g-5'>
            <div className='tw-flex tw-justify-center md:tw-flex-none md:tw-justify-normal md:text-center col-md-2'>
              {/* LegitScript Seal Script - must be included in _document.js or via next/head for SSR */}
              {/* <script src="https://static.legitscript.com/seals/25566443.js"></script> */}
              <a
                href='https://www.legitscript.com/websites/?checker_keywords=lumimeds.com'
                target='_blank'
                title='Verify LegitScript Approval for www.lumimeds.com'
                rel='noopener noreferrer'
              >
                <Image
                  src='https://static.legitscript.com/seals/25566443.png'
                  alt='Verify Approval for www.lumimeds.com'
                  width={73}
                  height={79}
                  style={{ maxWidth: '100%', height: 'auto' }}
                  data-no-retina=''
                />
              </a>
            </div>
            <div className='tw-text-center md:tw-text-start col-md-10'>
              <h5 className='mb-2 font-weight-600 text-dark certi-header'>We Are LegitScript Certified!</h5>
              <p className='text-extra-dark-gray mb-0 tw-text-center md:text-medium md:tw-text-start'>
                LegitScript only works with organizations that have ensured patients receive the highest quality of care.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
