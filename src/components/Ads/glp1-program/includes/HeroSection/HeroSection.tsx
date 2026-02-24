import Hero from '@/assets/glp1-program/Hero.png';
import Bottle from '@/assets/glp1-program/hero_medicine.png';
import Image from 'next/image';
import type { StaticImageData } from 'next/image';
import styles from './styles.module.scss';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { ROUTES } from '@/constants';
import { Spinner } from 'react-bootstrap';

export default function HeroSection() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const heroImageSrc: StaticImageData | string = Hero;
  const vialImageSrc: StaticImageData | string = Bottle;

  const handleTakeAssessment = () => {
    startTransition(() => {
      router.push(ROUTES.PATIENT_INTAKE);
    });
  };

  return (
    <div className={styles.heroSection}>
      <div className='tw-w-full mx-lg-0 px-lg-0'>
        <div className='row align-items-center gy-4 mx-lg-0 px-lg-0'>
          <div className='col-12 col-lg-6 px-lg-0 px-5'>
            <div className={styles.imageCard}>
              <div className={styles.imageInner}>
                {heroImageSrc ? (
                  <Image src={Hero} alt='Hero' fill sizes='(max-width: 991px) 100vw, 50vw' className={styles.image} />
                ) : (
                  <div className={styles.imagePlaceholder} />
                )}
              </div>
            </div>
          </div>
          <div className='col-12 col-lg-6 px-lg-5 px-5'>
            <div className={styles.copyWrapper}>
              <h1 className={styles.title}>We want you to sustain your progress.</h1>
              <div className={`${styles.ctaRow} d-flex align-items-center justify-content-between gap-lg-5`}>
                <div className='d-flex row align-items-center justify-content-center justify-content-lg-start gap-3 mt-3'>
                  <p className={styles.subtitle}>So we offer sustainable treatment plans.</p>
                  <button
                    type='button'
                    className={`btn ${styles.ctaBtn} d-flex align-items-center justify-content-center gap-2`}
                    onClick={handleTakeAssessment}
                    disabled={isPending}
                  >
                    {isPending && <Spinner className='border-2' size='sm' />}
                    Take assessment now
                  </button>
                </div>
                <div className={`d-none d-lg-block ${styles.productWrap}`}>
                  {vialImageSrc ? (
                    <Image src={Bottle} alt='GLP-1 vial' width={108} height={148} className={styles.productImage} />
                  ) : (
                    <div className={styles.productPlaceholder} />
                  )}
                </div>
              </div>
              <p className={styles.legalText}>
                HSA/FSA eligible. Use Klarna, Affirm, or Afterpay at checkout. Split your plan into smaller payments —
                no extra fees.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.statsBar}>
        <div className='container'>
          <div className='row text-center'>
            <div className={`col-4 ${styles.statCol}`}>
              <div className={styles.statValue}>92%</div>
              <div className={styles.statLabel}>Success</div>
            </div>
            <div className={`col-4 ${styles.statCol}`}>
              <div className={styles.statValue}>10k+</div>
              <div className={styles.statLabel}>Journeys</div>
            </div>
            <div className={`col-4 ${styles.statCol}`}>
              <div className={styles.statValue}>100%</div>
              <div className={styles.statLabel}>Online</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
