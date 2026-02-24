import OtpSupport from '@/assets/otp-support.jpg';
import OtpTreatment from '@/assets/otp-treatment.jpg';
import OtpGuidance from '@/assets/otp-guidance.jpg';
import { GLP1_PRODUCT_NAME, GLP1_LABEL } from '@/constants/factory';

export default function LoseWeightSection() {
  return (
    <section className='py-5 py-md-5'>
      <div className='container otp-container px-3 px-md-4'>
        <div className='text-center'>
          <h2 className='h1 fw-semibold text-dark'>Lose Weight. Your Way.</h2>
          <p className='text-muted mt-2 mb-0'>
            Personalized weight loss plans with GLP-1 medication <br /> and ongoing support to help you succeed.
          </p>
        </div>

        <div className='row g-3 g-md-4 mt-4 mt-md-5 row-cols-1 row-cols-md-3 align-items-stretch'>
          {/* Left large photo card */}
          <div className='col'>
            <div
              className='otp-photo-card otp-card-lg rounded-4 overflow-hidden position-relative'
              style={{ backgroundImage: `url(${OtpTreatment.src})` }}
            >
              <div className='otp-overlay'>
                <p className='mb-0'>
                  Tailored {GLP1_PRODUCT_NAME} {GLP1_LABEL} treatment
                  <br className='d-none d-lg-inline' /> plans for your goals
                </p>
              </div>
            </div>
          </div>

          {/* Center stack: small photo + highlight */}
          <div className='col d-grid gap-3'>
            <div
              className='otp-photo-card otp-card-sm rounded-4 overflow-hidden position-relative'
              style={{ backgroundImage: `url(${OtpGuidance.src})` }}
            >
              <div className='otp-overlay'>
                <p className='mb-0'>
                  Easy-to-follow guidance
                  <br className='d-none d-lg-inline' /> for a healthier lifestyle
                </p>
              </div>
            </div>
            <div className='otp-highlight rounded-4 d-flex align-items-center justify-content-center text-center p-4 p-md-5 h-100'>
              <div>
                <div className='display-6 fw-bold mb-1'>25%</div>
                <div className='small opacity-90'>faster results with plans designed just for you</div>
              </div>
            </div>
          </div>

          {/* Right tall photo card */}
          <div className='col'>
            <div
              className='otp-photo-card otp-card-lg rounded-4 overflow-hidden position-relative'
              style={{ backgroundImage: `url(${OtpSupport.src})` }}
            >
              <div className='otp-overlay'>
                <p className='mb-0'>
                  Continuous support to
                  <br className='d-none d-lg-inline' /> keep you on track
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
