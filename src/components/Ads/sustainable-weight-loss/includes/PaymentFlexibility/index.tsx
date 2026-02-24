'use client';

import styles from './styles.module.scss';
import Image from 'next/image';
import CardVial from '@/assets/ads/sustainable-weight-loss/Card_Vial.png';
import CheckAll from '@/assets/ads/sustainable-weight-loss/check-all.png';
import KLARNA from '@/assets/ads/sustainable-weight-loss/klarna.png';

interface Props {
  plain?: boolean;
  backgroundColor?: string;
}

export default function PaymentFlexibility({ plain = false, backgroundColor }: Readonly<Props>) {
  return (
    <section
      className={`${styles.paymentFlexibilitySection} ${plain ? styles.plainSection : ''}`}
      style={backgroundColor ? { background: backgroundColor } : undefined}
    >
      <div className={`${styles.paymentCard} ${plain ? styles.plainCard : ''}`}>
        <div className='row align-items-center'>
          <div className='col-lg-6'>
            <div className={styles.contentSection}>
              <div className='tw-flex tw-items-center tw-justify-between tw-gap-4 tw-flex-wrap tw-mb-6'>
                <div className={styles.hsaTag}>
                  <Image src={CheckAll.src} alt='Check all' width={16} height={16} className={styles.checkIcon} />
                  <span>HSA/FSA eligible</span>
                </div>
                <Image src={KLARNA} alt='Klarna' width={99} height={66} />
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

          <div className='col-lg-6'>
            <div className={styles.visualSection}>
              <Image
                src={CardVial}
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
