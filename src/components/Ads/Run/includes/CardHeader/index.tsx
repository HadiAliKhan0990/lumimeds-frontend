import React from 'react';
import styles from './styles.module.scss';
export const CardHeader = () => {
  return (
    <div className={styles.cardHeaderContainer}>
      <div className={styles.cardHeaderTitle}>Our exclusive GLP-1 plan</div>
      <div className={styles.cardHeaderDescription}>
        GLP-1 weight loss injections compounded in a highly regarded 503B facility and <br />
        fulfilled by Olympia&apos;s trusted 503A pharmacy.
      </div>
    </div>
  );
};
