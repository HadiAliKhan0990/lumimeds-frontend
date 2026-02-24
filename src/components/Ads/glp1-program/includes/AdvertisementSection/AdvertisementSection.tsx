import Image, { StaticImageData } from 'next/image';
import GirlRaisedHands from '@/assets/glp1-program/girl_raised_hands.png';
import LmBrown from '@/assets/glp1-program/LmObject.png';
import Yellow from '@/assets/glp1-program/yellowObject.png';
import { SurveyGetStartedButton } from '@/components/SurveyGetStartedButton';
import styles from './styles.module.scss';

interface Props {
  leftShapeImage?: StaticImageData | string;
  rightShapeImage?: StaticImageData | string;
  buttonTextColor?: string;
}

export default function AdvertisementSection({ leftShapeImage = LmBrown, rightShapeImage = Yellow, buttonTextColor}: Readonly<Props>) {
  

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
                <SurveyGetStartedButton className={styles.ctaButton} style={buttonTextColor ? { color: buttonTextColor } : undefined} />
              </div>
            </div>

            {/* Right Column - Image Section */}
            <div className={styles.imageSection}>
              {/* Left part - Shapes container */}
              <div className={styles.shapesContainer}>
                <Image src={leftShapeImage} alt='Left shape' width={180} height={150} className={styles.lmShape} />
                <Image src={rightShapeImage} alt='Right shape' width={200} height={150} className={styles.mehroonShape} />
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
