'use client';

import GLP1_GIPCardSection from './GLP1_GIP';
import GLP1CardSection from './GLP1';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import styles from './styles.module.scss';

interface Props {
  data: ProductTypesResponseData;
}

export default function CardSection({ data }: Readonly<Props>) {
  return (
    <div>
      <div className={styles.findThePlanThatsContainer}>
        <span>
          <span>Find the plan </span>
          <b className={styles.thatsRightFor}>that&apos;s right for you.</b>
        </span>
      </div>
      <GLP1_GIPCardSection data={data} />
      <GLP1CardSection data={data} />
    </div>
  );
}
