import styles from './styles.module.scss';
import { SurveyGetStartedButton } from '@/components/SurveyGetStartedButton';

export default function SustainableWeightLossHero() {

  return (
    <section className={styles.heroSection}>
      <div className={'container ' + styles.heroContainer}>
        <div className={styles.containerTextContent}>
          <h1 className={`text-white fw-bold mb-4 ${styles.heroTitle}`}>
            Your willpower isn&apos;t the problem. Your body isn&apos;t your enemy. 
          </h1>
          <p className={`text-white ${styles.heroDescription}`}>Personalized weight management is key.</p>
          <div>
            <SurveyGetStartedButton className={`btn btn-light rounded-pill text-lg ${styles.responsiveCta}`} />
          </div>
        </div>
      </div>
    </section>
  );
}
