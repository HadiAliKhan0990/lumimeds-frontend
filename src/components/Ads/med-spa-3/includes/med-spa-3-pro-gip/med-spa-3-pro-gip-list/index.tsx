import MedSpa3ProductsItem from '../med-spa-3-pro-gip-item';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';

interface MedSpa3ProgipListProps {
  readonly data: ProductTypesResponseData;
  readonly t: (key: string) => string;
}

export default function MedSpa3ProgipList({ data, t }: Readonly<MedSpa3ProgipListProps>) {
  const glp_1_plans = data?.glp_1_plans?.products || [];
  const reverseProducts = glp_1_plans.slice().reverse();
  return (
    <section className='container tw-flex tw-flex-col md:tw-flex-row tw-justify-center tw-items-center tw-gap-6 md:tw-gap-10 tw-px-4 md:tw-px-0'>
      {reverseProducts.length > 0 ? (
        reverseProducts.map((product) => <MedSpa3ProductsItem key={product.id} product={product} t={t} />)
      ) : (
        <p className='tw-text-center tw-text-gray-500 tw-col-span-full'>{t('noProductsMessage')}</p>
      )}
    </section>
  );
}
