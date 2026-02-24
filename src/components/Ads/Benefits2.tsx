import React from 'react';
import './styles.css';

const Benefits2 = () => {
  return (
    <div className='container benefits2-container'>
      <div className='row'>
        <div className='col-12 col-lg-6 d-flex flex-column justify-content-center'>
          <p className='benefits_title mb-5'>Benefits</p>
          <p className='benefits_subtext'>
            Begin your journey to a healthier life, with personalized support and guidance. We are with you every step
            of the way.
          </p>
        </div>
        <div className='col-12 col-lg-6 d-flex flex-column benefits_container'>
          <div className='d-flex flex-column benefits_content'>
            <p>
              Sustainable <span className='benefits-highlight'>Weight Loss</span>
            </p>
            <p className='m-0'>Convenient once-weekly injections can lead to significant weight loss</p>
          </div>
          <div className='d-flex flex-column benefits_content'>
            <p>
              Reduce <span className='benefits-highlight'>Appetite</span>
            </p>
            <p className='m-0'>
              Slow gastric emptying leads you to experience a prolonged feeling of fullness, so that you can easily
              manage your appetite.
            </p>
          </div>
          <div className='d-flex flex-column benefits_content'>
            <p>
              Long Term &nbsp;
              <span className='benefits-highlight'>Health</span>
            </p>
            <p className='m-0'>
              Weight loss improves energy levels, mood, and sleep quality, reduces the risk of heart disease,
              improvements in diabetes, and control blood sugar levels.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Benefits2;
