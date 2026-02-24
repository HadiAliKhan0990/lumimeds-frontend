import InjectionBg from '@/assets/injection-bg.jpeg';
import Logo from '@/assets/logo-footer.png';
import Image from 'next/image';

export default function InjectionHero() {
  return (
    <section
      className='w-100 p-0 pb-3 injection-bg injection-bg-responsive d-flex flex-column injection-hero'
      style={{
        backgroundImage: `url(${InjectionBg.src})`,
      }}
    >
      <Image src={Logo.src} className='mx-auto pt-5 pb-5 injection-logo' width={238} height={100} alt='' />
      <div className='container d-flex flex-column flex-lg-row align-items-center text-white flex-grow injection-content'>
        <div className='col-12 col-lg-6 d-flex justify-content-center justify-content-lg-end injection-title-container'>
          <p className='display-1 injection-title text-center text-lg-end'>One GLP-1 Injection a Week.</p>
        </div>
        <div className='col-12 col-lg-6 d-flex flex-column align-items-center injection-subtitle'>
          <p className='text-center'>WEIGHT LOSS PROGRAM&nbsp;</p>
        </div>
      </div>
      <p className='h5 injection-description'>
        Compounded medications are available by prescription only. They are not FDA approved and have not been evaluated
        for safety and effectiveness by the FDA.&nbsp;
      </p>
    </section>
  );
}
