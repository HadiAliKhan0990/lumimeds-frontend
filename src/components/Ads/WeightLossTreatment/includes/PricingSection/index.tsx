'use client';

import Image from 'next/image';
import GirlRaisedHands from '@/assets/ads/weight-loss-treatment/girl_raised_hands.png';
import LmBrown from '@/assets/ads/weight-loss-treatment/Lm_Brown.png';
import Mehroon from '@/assets/ads/weight-loss-treatment/mehroon.png';
import styles from './styles.module.scss';
import { SurveyGetStartedButton } from '@/components/SurveyGetStartedButton';

export default function PricingSection() {
  return (
    <section className={styles.pricingSection}>
      <div className={styles.container}>
        <div className={styles.pricingCard}>
          <div className={styles.contentContainer}>
            {/* Left Column - Text Content */}
            <div className={styles.textSection}>
              <div className={styles.textContent}>
                <h2 className={styles.pricingTitle}>
                  One price.
                  <br />
                  No hidden fees.
                </h2>
                <SurveyGetStartedButton className={`text-white rounded-pill fw-semibold ${styles.ctaButton}`} />
              </div>
            </div>

            {/* Right Column - Image Section */}
            <div className={styles.imageSection}>
              {/* Left part - Shapes container */}
              <div className={styles.shapesContainer}>
                <Image src={LmBrown} alt='Lm Brown shape' width={180} height={150} className={styles.lmShape} />
                <Image src={Mehroon} alt='Mehroon shape' width={200} height={150} className={styles.mehroonShape} />
              </div>

              {/* Right part - Girl image */}
              <div className={styles.girlImageContainer}>
                <Image
                  src={GirlRaisedHands}
                  alt='Girl with raised hands'
                  width={200}
                  height={350}
                  className={styles.girlImage}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
