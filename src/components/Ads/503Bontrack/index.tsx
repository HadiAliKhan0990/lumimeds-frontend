'use client';

import Hero503Bontrack from '@/components/Ads/503Bontrack/includes/Hero503Bontrack';
import CustomerReviews from '@/components/Ads/503Bontrack/includes/CustomerReviews';
import GetStarted from '@/components/Ads/503Bontrack/includes/GetStarted';
import ProductList from '@/components/Ads/503Bontrack/includes/ProductList';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import './style.css';

interface Props {
  data: ProductTypesResponseData;
}

export default function Olympia503Bontrack({ data }: Readonly<Props>) {
  return (
    <>
      <Hero503Bontrack />
      <CustomerReviews />
      <GetStarted />
      <ProductList productsData={data} />
    </>
  );
}
