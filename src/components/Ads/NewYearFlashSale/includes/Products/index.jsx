'use client';
import semaglutide from '@/assets/ads/new-year-flash-sale/semaglutide.png';
import nadinjection from '@/assets/ads/new-year-flash-sale/nad-injection.png';
import glpplans from '@/assets/ads/new-year-flash-sale/glp-plans.png';
import Image from 'next/image';
import { Spinner } from 'react-bootstrap';
import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { handleVerifyRedirectToCheckout } from '@/helpers/products';

const products = [
  {
    id: 'compounded-semaglutide',
    plan: '3 Month Value Plan',
    title: ['Compounded', 'Semaglutide', '(GLP-1)'],
    subtitle: null,
    image: semaglutide,
    imageAlt: 'Semaglutide',
    oldPrice: '$133/mo.',
    newPrice: '$99/mo.',
    upfrontPayment: '$399 $299 upfront payment',
    medicineName: 'weight loss',
  },
  {
    id: 'nad-injections',
    plan: '3 Month Value Plan',
    title: ['NAD+ Injections'],
    subtitle: '(nicotinamide adenine dinucleotide)',
    image: nadinjection,
    imageAlt: 'NAD Injection',
    oldPrice: '$166/mo.',
    newPrice: '$133/mo.',
    upfrontPayment: '$499 $399 upfront payment',
    medicineName: 'longevity',
    redirectPath: '/products/nad-plans',
  },
  {
    id: 'compounded-tirzepatide-starter',
    plan: '3 Month Starter Supply',
    title: ['Compounded', 'Tirzepatide', '(GLP-1/GIP)'],
    subtitle: '(nicotinamide adenine dinucleotide)',
    image: glpplans,
    imageAlt: 'GLP Plans',
    oldPrice: '$133/mo.',
    newPrice: '$116/mo.',
    upfrontPayment: '$399 $349 upfront payment',
    medicineName: 'weight loss',
  },
  {
    id: 'compounded-tirzepatide-value',
    plan: '3 Month Value Plan',
    title: ['Compounded', 'Tirzepatide', '(GLP-1/GIP)'],
    subtitle: '(nicotinamide adenine dinucleotide)',
    image: glpplans,
    imageAlt: 'GLP Plans',
    oldPrice: '$216/mo.',
    newPrice: '$183/mo.',
    upfrontPayment: '$649 $549 upfront payment',
    medicineName: 'weight loss',
  },
];

export default function Products() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const [isPending, startTransition] = useTransition();
  const [loadingProductId, setLoadingProductId] = useState(null);

  const selectedProduct = useSelector((state) => state.productType);
  const checkout = useSelector((state) => state.checkout);
  const { isSurveyCompleted, checkoutUser, surveyCategory } = checkout || {};


  const handleProductClick = async (product) => {
    setLoadingProductId(product.id);
    const overrideTime = searchParams.get('overrideTime') === 'true';
    try {
      await handleVerifyRedirectToCheckout({
        selectedProduct,
        product,
        dispatch,
        startTransition,
        router,
        isSurveyCompleted,
        checkoutUser,
        surveyCategory,
        saleType: "flash_sale",
        overrideTime,
      });
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      setLoadingProductId(null);
    }
  };

  return (
    <div className='tw-max-w-[816px] tw-mx-auto tw-w-full tw-px-5'>
      <div className='tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-8'>
        {products.map((product) => (
          <div
            key={product.id}
            className='tw-bg-white tw-border-[rgba(234,234,234,0.93)] tw-border-2 tw-rounded-lg md:tw-px-8 tw-px-5 tw-py-6 tw-flex tw-flex-col tw-justify-center tw-items-center tw-relative'
          >
            {product.id === 'nad-injections' && (
              <div className='tw-bg-[#DFE7FF] tw-font-semibold tw-rounded-md tw-text-lg tw-text-[#3060FE] tw-px-5 tw-h-[38px] tw-flex tw-items-center tw-justify-center tw-uppercase tw-absolute tw-top-0 tw-left-0'>NEW</div>
            )}
            <h4 className='md:tw-text-2xl tw-text-xl tw-font-normal tw-text-[#212529] tw-mb-0'>
              {(product.id === 'compounded-semaglutide' || product.id === 'nad-injections') ? (
                <>
                  <span className='md:tw-hidden'>3 Months</span>
                  <span className='tw-hidden md:tw-inline'>3 Month Value Plan</span>
                </>
              ) : (
                product.plan
              )}
            </h4>
            <h3 className='tw-text-[32px] tw-flex tw-flex-col tw-items-center tw-justify-center tw-mb-0 tw-font-medium'>
              {product.title.map((line, index) => (
                <span key={index} className='tw-block'>
                  {line}
                </span>
              ))}
            </h3>
            {product.id === 'nad-injections' && (
              <div className='tw-text-xl tw-font-medium tw-mb-5 tw-text-center'>{product.subtitle}</div>
            )}
            <div className='tw-mt-10 tw-mb-6 tw-bg-[#DFE7FF] tw-p-5 tw-rounded-2xl tw-w-full tw-h-full tw-flex tw-items-center tw-justify-center'>
              <Image src={product.image} alt={product.imageAlt} className='tw-w-auto tw-h-auto' />
            </div>
            <div className='tw-relative'>
              <h2 className='tw-text-[44px] tw-text-black tw-font-semibold tw-mb-0 tw-leading-[133%]'>
                {product.oldPrice}
              </h2>
              <div className='tw-absolute tw-top-1/2 tw-left-1/2 tw-transform -tw-translate-x-1/2 -tw-translate-y-1/2'>
                <svg width="201" height="26" viewBox="0 0 201 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="0.299145" y1="22.9856" x2="200.299" y2="2.98559" stroke="#FE3030" strokeWidth="6" />
                </svg>
              </div>
            </div>
            <h2 className='md:tw-text-[67px] tw-text-[14.419vw] tw-text-[#3060FE] tw-font-semibold tw-mb-0 tw-leading-[133%]'>
              {product.newPrice}
            </h2>
            <p className='tw-text-sm tw-font-bold tw-mb-0'>
              <span className='tw-relative tw-inline-block'>
                {product.upfrontPayment.split(' ')[0]}
                <div className='tw-absolute tw-top-1/2 tw-left-0 tw-right-0'>
                  <svg width="100%" height="2" viewBox="0 0 100 2" fill="none" xmlns="http://www.w3.org/2000/svg" className='tw-w-full'>
                    <line x1="0" y1="1" x2="100" y2="1" stroke="#000000" strokeWidth="2" />
                  </svg>
                </div>
              </span>
              {' '}
              {product.upfrontPayment.split(' ').slice(1).join(' ')}
            </p>
            {product.id !== 'nad-injections' && (
              <p className='tw-text-[10px] tw-font-normal tw-mb-2 tw-text-[#888888]'>New Patients Only</p>
            )}
            {product.id === 'nad-injections' && (
              <p className='tw-text-[10px] tw-font-normal tw-mb-2 tw-text-[#888888]'>&nbsp;</p>
            )}
            <button
              type='button'
              onClick={() => handleProductClick(product)}
              disabled={loadingProductId === product.id || isPending}
              className='tw-text-xl tw-font-semibold tw-h-[52px] tw-w-full tw-flex tw-items-center tw-justify-center tw-rounded-lg tw-bg-[#3060FE] tw-text-white tw-shadow-[0_4px_4px_rgba(0,0,0,0.25)] tw-transition-all tw-duration-300 hover:tw-bg-black-600 hover:tw-shadow-lg hover:tw-scale-[1.02] disabled:tw-opacity-60 disabled:tw-cursor-not-allowed disabled:hover:tw-scale-100'
            >
              {(loadingProductId === product.id || (isPending && loadingProductId === product.id)) && (
                <Spinner animation="border" className='border-2 tw-mr-2' size='sm' />
              )}
              <span>Learn More</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
