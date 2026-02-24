import MedSpa3ProductsList from './med-spa-3-pro-glp-list';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';

interface MedSpa3ProductsProps {
  readonly data: ProductTypesResponseData;
  readonly t: (key: string) => string;
}

export default function MedSpa3Products({ data, t }: Readonly<MedSpa3ProductsProps>) {
  return (
    <div>
      <MedSpa3ProductsList data={data} t={t} />
    </div>
  );
}
