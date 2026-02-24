'use client';

import Image from 'next/image';
import GirlSitting from '@/assets/ads/weight-loss-treatment/girl_sitting.png';
import GLP1GIP1 from '@/assets/ads/weight-loss-treatment/glp1-gip_1.png';
import GLP1GIP2 from '@/assets/ads/weight-loss-treatment/glp1-gip_2.png';
import { SurveyGetStartedButton } from '@/components/SurveyGetStartedButton';
import { TrustpilotData } from '@/services/trustpilot';
import styles from '../styles.module.scss';
import { GLP1_GIP_PRODUCT_NAME, GLP1_GIP_LABEL } from '@/constants/factory';
import CustomTrustpilotWidget from './CustomTrustpilotWidget';

interface Props {
  trustpilotData: TrustpilotData;
}

export default function HeroSection({ trustpilotData }: Readonly<Props>) {
  return (
    <section className='d-flex align-items-center justify-content-center position-relative overflow-hidden py-0'>
      <div className='container'>
        <div className='row align-items-center pt-5'>
          {/* Left Column - Visuals */}
          <div className='col-lg-6'>
            <div className={`${styles.heroVisuals} position-relative`}>
              {/* Main Girl Image */}
              <div className={styles.mainGirlImage}>
                <Image
                  src={GirlSitting}
                  alt={`Happy woman with ${GLP1_GIP_PRODUCT_NAME} ${GLP1_GIP_LABEL} results`}
                  width={300}
                  height={300}
                  className={`${styles.girlImage} img-fluid`}
                  priority
                />
              </div>

              {/* Vial Images Container - Vertical Stack */}
              <div className={styles.vialImagesContainer}>
                {/* Second Vial (glp1-gip_2) - Top */}
                <div className={styles.vialImageItem}>
                  <Image
                    src={GLP1GIP2}
                    alt={`${GLP1_GIP_PRODUCT_NAME} ${GLP1_GIP_LABEL} Compounded Medication Vial Close-up`}
                    width={300}
                    height={300}
                    className={`${styles.vialImage} img-fluid`}
                  />
                </div>

                {/* First Vial (glp1-gip_1) - Bottom */}
                <div className={styles.vialImageItem}>
                  <Image
                    src={GLP1GIP1}
                    alt={`${GLP1_GIP_PRODUCT_NAME} ${GLP1_GIP_LABEL} Compounded Medication Vial`}
                    width={300}
                    height={300}
                    className={`${styles.vialImage} img-fluid`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Content */}
          <div className='col-lg-6'>
            <div className={`${styles.heroContent} px-3 px-md-0`}>
              <h2 className={`${styles.heroTitle} display-3 mb-4`}>
                <h1>
                  Reach your goals with
                  <br />
                  {GLP1_GIP_PRODUCT_NAME} {GLP1_GIP_LABEL} treatment.
                </h1>
                All-in support—simple,
                <br />
                clear, and built for you.
              </h2>

              <p className={`${styles.heroSubtitle} fs-5 text-muted mb-4`}>
                From medical care to personalized lifestyle guidance, plus help with coverage and a community by your
                side—we keep it straightforward. No hidden fees, just real results.
              </p>

              <div className={`${styles.heroCta} mb-4`}>
                <SurveyGetStartedButton className={`${styles.heroCtaButton} rounded-pill fw-bold`} />
              </div>

              <p className={`${styles.pricingText} text-muted small mb-3`}>One price. No hidden fees.</p>

              {/* Custom Trustpilot Widget */}
              {trustpilotData && (
                <div className='tw-w-full tw-h-full tw-flex tw-flex-col tw-justify-start tw-items-start tw-mt-9'>
                  <CustomTrustpilotWidget trustpilotData={trustpilotData} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
