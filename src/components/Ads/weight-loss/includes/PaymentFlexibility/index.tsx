'use client';

import styles from './styles.module.scss';
import Image from 'next/image';
import CardVial from '@/assets/ads/weight-loss/Card_Vial.png';
import CheckAll from '@/assets/ads/weight-loss/check-all.png';
export default function PaymentFlexibility() {
  return (
    <section className={styles.paymentFlexibilitySection}>
      <div className={styles.paymentCard}>
        <div className='row align-items-center'>
          <div className='col-lg-6 col-md-6'>
            <div className={styles.contentSection}>
              <div className={styles.hsaTag}>
                <Image src={CheckAll.src} alt='Check all' width={16} height={16} className={styles.checkIcon} />
                <span>HSA/FSA eligible</span>
              </div>

              <h2 className={styles.mainHeading}>
                Flexible ways to
                <br /> pay are here!
              </h2>

              <div className={styles.descriptionText}>
                <p>Use Klarna, Affirm, or Afterpay at checkout.</p>
                <p>Split your plan into smaller payments — no extra fees.</p>
              </div>
            </div>
          </div>

          <div className='col-lg-6 col-md-6'>
            <div className={styles.visualSection}>
              <Image
                src={CardVial.src}
                alt='Credit card and medical vial'
                width={700}
                height={500}
                className={styles.cardVialImage}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
