import Image from 'next/image';
import HeroImg from '@/assets/otp-hero.png';

export default function HeroSection() {
  return (
    <section className='otp-hero pb-5 pt-0'>
      <div className='container otp-container px-3 px-md-4'>
        <div className='row align-items-center g-5'>
          {/* Left copy */}
          <div className='col-12 col-lg-6 pt-5 pt-xl-0'>
            <h1 className='otp-hero-title fw-semibold text-dark lh-sm'>
              Your Weight Loss
              <br />
              Journey, <span className='text-primary fst-italic'>Redefined</span>
            </h1>

            <p className='mt-3 text-secondary mb-0 pe-lg-5'>
              More than weight loss—it’s about finding balance, building confidence, and creating a healthier version of
              you.
            </p>

            <div className='d-flex flex-wrap gap-4 mt-4'>
              <div>
                <div className='text-primary fs-5 fw-semibold'>10k+</div>
                <div className='text-muted small'>Journeys</div>
              </div>
              <div>
                <div className='text-primary fs-5 fw-semibold'>92%</div>
                <div className='text-muted small'>Success</div>
              </div>
              <div>
                <div className='text-primary fs-5 fw-semibold'>100%</div>
                <div className='text-muted small'>Online</div>
              </div>
            </div>
          </div>

          {/* Right image */}
          <div className='col-12 col-lg-6'>
            <Image src={HeroImg} alt='OTP Hero' className='img-fluid' />
          </div>
        </div>
      </div>
    </section>
  );
}
