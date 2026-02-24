import Image from 'next/image';
import GirlCTA from '@/assets/ads/free/girl_CTA.png';
import { GLP1_GIP_PRODUCT_NAME, GLP1_GIP_LABEL } from '@/constants/factory';

export default function FreeHero() {
  return (
    <section className='w-100 p-0 free-hero-container'>
      <div className='container-fluid p-0'>
        <div className='row'>
          <div className='col-12 p-0 position-relative'>
            <Image src={GirlCTA} alt='Woman enjoying the outdoors' className='free-hero-image-fullscreen' priority />
            <div className='free-hero-text-overlay'>
              <h1>
              <h2 className='free-hero-title-text'>{GLP1_GIP_PRODUCT_NAME}</h2>
              <h2 className='free-hero-subtitle-text'>{GLP1_GIP_LABEL} Injections</h2>
              </h1>
              <p className='free-hero-description-text'>
                Whether you&apos;re starting out or leveling up, our {GLP1_GIP_PRODUCT_NAME} plans are personalized to
                your goals all guided by licensed medical providers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
