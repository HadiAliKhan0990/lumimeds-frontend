import { Recipe } from '@/components/Icon/Recipe';
import { ProductCategory } from '@/store/slices/productCategoriesSlice';
import { PlanType } from '@/types/medications';
import { IoReload } from 'react-icons/io5';

interface Props {
  category: ProductCategory;
}

export const ProductPlanType = ({ category }: Readonly<Props>) => {
  return (
    <span className='d-flex align-items-center gap-2 text-capitalize text-nowrap'>
      {category.planType === PlanType.ONE_TIME ? (
        <>
          <Recipe size={16} />
          One Time Purchase
        </>
      ) : (
        <>
          <IoReload size={16} />
          Subscription
        </>
      )}
    </span>
  );
};
