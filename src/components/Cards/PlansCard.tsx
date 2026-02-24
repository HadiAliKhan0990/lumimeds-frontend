'use client';

import { getRoundedPrice } from '@/helpers/products';
import { PlanProduct } from '@/store/slices/productTypesApiSlice';
import { Blur } from 'transitions-kit';
import { AsyncImage } from 'loadable-image';
import { ProductCategoryKey } from '@/types/products';
import AsyncImgLoader from '@/components/AsyncImgLoader';
import Link from 'next/link';
import { GLP1_GIP_PRODUCT_NAME, GLP1_GIP_LABEL } from '@/constants/factory';

interface ProductCardProps {
  product: PlanProduct;
  onSelect: (ag: PlanProduct, categoryName?: ProductCategoryKey) => void;
  categoryName: ProductCategoryKey;
}

export function PlansCard({ product, onSelect, categoryName }: Readonly<ProductCardProps>) {
  // Function to add <br> tag before brackets
  const formatDisplayName = (name: string | undefined) => {
    if (!name) return '';
    return name.replace(/\(/g, '<br>(');
  };

  return (
    <div className='card pt-3 pb-4 px-4 flex-grow-1 border-frosted-glass h-100 d-flex flex-column'>
      <div className='flex-grow-1 text-center'>
        <h4
          className='card-title fw-medium mb-3'
          dangerouslySetInnerHTML={{
            __html: formatDisplayName(product.displayName?.replace('Injections', 'Plans')),
          }}
        />
        {product.displayName?.includes(`${GLP1_GIP_PRODUCT_NAME} ${GLP1_GIP_LABEL}`) && (
          <span className='text-primary bg-cloud-blue rounded-1 py-1 px-12 text-xs fw-semibold'>Popular</span>
        )}
      </div>
      <div className='bg-cloud-blue rounded-12 py-3 my-5'>
        <AsyncImage
          src={product.image ?? ''}
          Transition={Blur}
          loader={<AsyncImgLoader />}
          alt={product.displayName ?? ''}
          className='w-64px h-160px mx-auto async-image-contain'
        />
      </div>
      <span className='text-black-50 align-self-center'>Starting at</span>
      <p className='text-primary fw-semibold text-3xl align-self-center mb-4'>
        {`$${getRoundedPrice(product.startingAmount)}/mo.`}
      </p>
      <div className='row g-3'>
        <div className='col-sm-6'>
          <button className='btn btn-primary w-100 fw-medium' onClick={() => onSelect(product, categoryName)}>
            Pricing
          </button>
        </div>
        <div className='col-sm-6'>
          <Link className='btn btn-primary w-100 fw-medium' href={`/products/${categoryName}`}>
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
}
