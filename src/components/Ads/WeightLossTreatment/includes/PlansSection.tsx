import PlanCard from './PlanCard';
import { ProductType, ProductPrice } from '@/store/slices/productTypeSlice';
import styles from '../styles.module.scss';
import { GLP1_GIP_PRODUCT_NAME, GLP1_GIP_LABEL } from '@/constants/factory';

interface Props {
  data: ProductType[];
  planLabelClassName?: string;
  priceClassName?: string;
  ctaButtonClassName?: string;
  planTitleClassName?: string;
  planSubtitle?: string;
  planSubtitleClassName?: string;
}

export default function PlansSection({
  data,
  planLabelClassName,
  priceClassName,
  ctaButtonClassName,
  planTitleClassName,
  planSubtitle,
  planSubtitleClassName,
}: Readonly<Props>) {
  const activeProducts = data.filter(
    (product) => Array.isArray(product.prices) && product.prices.some((pr: ProductPrice) => pr.isActive)
  );

  return (
    <div className={`${styles.weightLossTreatmentPlans} container py-5`}>
      <h2 className={`${styles.plansHeading} text-center mb-2`}>Our Plans</h2>

      <div className='d-flex flex-column gap-4'>
        {activeProducts.length > 0 ? (
          activeProducts
            .slice()
            .reverse()
            .map((product, index) => (
              <PlanCard
                key={product.id || index}
                product={product}
                imageAlt={`${GLP1_GIP_PRODUCT_NAME} ${GLP1_GIP_LABEL} medication vial`}
                planLabelClassName={planLabelClassName}
                priceClassName={priceClassName}
                ctaButtonClassName={ctaButtonClassName}
                planTitleClassName={planTitleClassName}
                planSubtitle={planSubtitle}
                planSubtitleClassName={planSubtitleClassName}
              />
            ))
        ) : (
          <div className='text-center'>No plans available</div>
        )}
      </div>
    </div>
  );
}
