'use client';

import styles from './styles.module.scss';
import Image from 'next/image';
import similingWomen from '@/assets/ads/for-women/smiling-women.png';
import TestimonialsSection from '@/components/Ads/TestimonialsSection';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import { SurveyGetStartedButton } from '@/components/SurveyGetStartedButton';
import { ForWomenProductCard } from './includes/ForWomenProductCard';
import { GLP1_GIP_PRODUCT_NAME, GLP1_GIP_LABEL } from '@/constants/factory';

interface Props {
  data: ProductTypesResponseData;
}

export default function ForWomenAd({ data }: Readonly<Props>) {
  return (
    <div className={`${styles.pageRoot} pt-6-custom`}>
      <header className={styles.hero}>
        <h1 className={styles.title}>
          Your Weight Loss Journey, <br />
          <span className={styles.accent}>Redefined</span>
        </h1>

        <div className='tw-max-w-[900px] tw-mx-auto'>
          <div className={`row g-4 ${styles.heroCards}`}>
            <div className={`col-md-6`}>
              <div
                className={`tw-h-full tw-p-10 tw-flex tw-items-center tw-justify-center tw-rounded-xl tw-bg-primary`}
              >
                {data.glp_1_gip_plans?.products?.[0]?.image && (
                  <Image
                    src={data.glp_1_gip_plans.products[0].image}
                    alt={`${GLP1_GIP_PRODUCT_NAME} ${GLP1_GIP_LABEL} Vial`}
                    className={`!tw-static tw-min-h-72 tw-max-h-96 tw-max-w-52 tw-object-contain tw-w-full tw-h-auto`}
                    fill
                  />
                )}
              </div>
            </div>
            <div className={`col-md-6`}>
              <div className='tw-rounded-xl tw-bg-primary tw-h-full'>
                <Image
                  src={similingWomen}
                  alt='Smiling woman'
                  width={403}
                  height={604}
                  className='tw-object-contain tw-w-full tw-h-auto'
                />
              </div>
            </div>
          </div>
          <p className={`tw-text-xl tw-font-medium ${styles.subtitle}`}>
            More than weight loss—it&apos;s about finding balance, building confidence, and creating a healthier version
            of you.
          </p>
          <SurveyGetStartedButton className='btn-primary rounded-pill !tw-text-xl px-4 tw-w-full' />
        </div>
      </header>

      <section className='container tw-py-50 md:tw-pb-16 tw-bg-light-beige'>
        <div className='row g-4 justify-content-center'>
          {(data.glp_1_gip_plans?.products || [])
            .slice()
            .map((product, idx) => (
              <div className='col-md-6 col-lg-4' key={idx}>
                <ForWomenProductCard product={product} />
              </div>
            ))}
        </div>
      </section>

      <TestimonialsSection backgroundColor={'#f4f1ea'} paddingTop={20} showTitle />
    </div>
  );
}
