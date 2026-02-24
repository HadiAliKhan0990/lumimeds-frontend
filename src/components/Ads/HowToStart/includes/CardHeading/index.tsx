import styles from './styles.module.scss';

export const CardHeading = () => {
  return (
    <div className={styles.cardHeadingContainer}>
      <p className={styles.cardHeadingText}>
        Discover the <span className={styles.accentText}>transformative power</span> of weight loss,
        <br />
        whether you&apos;re just starting your journey or already
        <br />
        making progress toward your goals.
      </p>
    </div>
  );
};
