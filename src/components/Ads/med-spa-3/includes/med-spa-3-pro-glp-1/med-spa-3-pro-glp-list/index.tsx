import MedSpa3ProductsItem from '../med-spa-3-pro-glp-item';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';

interface MedSpa3ProductsListProps {
  readonly data: ProductTypesResponseData;
  readonly t: (key: string) => string;
}

export default function MedSpa3ProductsList({ data, t }: Readonly<MedSpa3ProductsListProps>) {
  const glp_1_gip_plans = data?.glp_1_gip_plans?.products || [];

  const sortedProducts = glp_1_gip_plans.slice().sort((a, b) => {
    const getPrice = (product: typeof a) => {
      if (
        product.durationText?.toLowerCase().includes('3-month') ||
        product.durationText?.toLowerCase().includes('3 month')
      ) {
        return product.dividedAmount || 0;
      }
      return product.prices?.[0]?.amount || 0;
    };

    const priceA = getPrice(a);
    const priceB = getPrice(b);
    return priceA - priceB;
  });

  return (
    <div className='tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-4 md:tw-gap-6 tw-w-full'>
      {sortedProducts.length > 0 ? (
        sortedProducts.map((product) => <MedSpa3ProductsItem key={product.id} product={product} t={t} />)
      ) : (
        <p className='tw-text-center tw-text-gray-500 tw-col-span-full'>{t('noProductsMessage')}</p>
      )}
    </div>
  );
}
