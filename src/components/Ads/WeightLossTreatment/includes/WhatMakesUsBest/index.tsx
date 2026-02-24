'use client';

import Image from 'next/image';
import SproutIcon from '@/assets/ads/weight-loss-treatment/sprout.png';
import TimerCheckIcon from '@/assets/ads/weight-loss-treatment/timer-check-outline.png';
import FaceAgentIcon from '@/assets/ads/weight-loss-treatment/face-agent.png';
import styles from './styles.module.scss';
import { GLP1_GIP_PRODUCT_NAME, GLP1_GIP_LABEL } from '@/constants/factory';

export default function WhatMakesUsBest() {
  return (
    <div className={styles.whatMakesUsBestSection}>
      <div className={styles.container}>
        {/* Top Button */}
        <div className={styles.topButton}>
          <div className={styles.whyButton}>Why It&apos;s Worth It</div>
        </div>

        {/* Main Heading */}
        <h2 className={styles.mainHeading}>What makes us the best</h2>

        {/* Feature Cards */}
        <div className={styles.cardsContainer}>
          {/* Card 1: Personalized Care */}
          <div className={styles.featureCard}>
            <div className={styles.cardIcon}>
              <Image src={FaceAgentIcon} alt='Personalized Care' width={24} height={24} />
            </div>
            <h3 className={styles.cardTitle}>Personalized Care, Just for You</h3>
            <p className={styles.cardDescription}>
              Every body is different. Our {GLP1_GIP_PRODUCT_NAME} {GLP1_GIP_LABEL} treatments are tailored to your
              unique needs, ensuring you get a plan that works for your lifestyle and goals.
            </p>
          </div>

          {/* Card 2: Safe and Trusted */}
          <div className={styles.featureCard}>
            <div className={styles.cardIcon}>
              <Image src={SproutIcon} alt='Safe and Trusted' width={24} height={24} />
            </div>
            <h3 className={styles.cardTitle}>Safe, Proven, and Trusted</h3>
            <p className={styles.cardDescription}>
              All treatments are sourced from 503A/503B pharmacies, giving you peace of mind with medications that meet
              the highest standards of safety and quality.
            </p>
          </div>

          {/* Card 3: Lasting Results */}
          <div className={styles.featureCard}>
            <div className={styles.cardIcon}>
              <Image src={TimerCheckIcon} alt='Lasting Results' width={24} height={24} />
            </div>
            <h3 className={styles.cardTitle}>Results That Truly Last</h3>
            <p className={styles.cardDescription}>
              This isn&apos;t a quick fix—it&apos;s a sustainable path to better health. With the right support,
              you&apos;ll see real progress and lasting change in your weight and wellness.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
