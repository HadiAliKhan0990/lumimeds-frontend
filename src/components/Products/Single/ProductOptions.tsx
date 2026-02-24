'use client';

import { ProductPrice, ProductType, setProductType } from '@/store/slices/productTypeSlice';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { trackAddToCart } from '@/lib/tracking';
import { microsoftTrackAddToCart } from '@/helpers/uetTracking';
import { getRoundedPrice, getProductDetails, handleVerifyRedirectToCheckout } from '@/helpers/products';
import { PlanProduct } from '@/store/slices/productTypesApiSlice';
import { AllPlansInclude } from '@/components/Products/AllPlansInclude';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import '@/components/Products/Single/styles.css';

interface Props {
  product?: PlanProduct;
}

export default function ProductOptions({ product }: Readonly<Props>) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  const storedProduct = useSelector((state: RootState) => state.productType);
  const checkout = useSelector((state: RootState) => state.checkout);
  const { isSurveyCompleted, checkoutUser, surveyCategory } = checkout || {};

  const handleProductSurvey = async (productItem: ProductType, price: ProductPrice) => {
    // Determine product category from component's product prop (PlanProduct)
    let productCategory: 'longevity' | 'weight_loss' = 'weight_loss';
    if (product?.categoryName === 'nad_plans') {
      productCategory = 'longevity';
    } else if (product?.categoryName === 'glp_1_plans' || product?.categoryName === 'glp_1_gip_plans') {
      productCategory = 'weight_loss';
    } else if (productItem?.category?.toLowerCase().includes('nad')) {
      productCategory = 'longevity';
    } else if (
      productItem?.category?.toLowerCase().includes('weight_loss') ||
      productItem?.category?.toLowerCase().includes('glp')
    ) {
      productCategory = 'weight_loss';
    }

    trackAddToCart({
      itemId: productItem.id ?? '',
      itemName: productItem.displayName ?? productItem.name ?? '',
      value: price.amount ?? 0,
      productCategory,
    });

    // Microsoft UET AddToCart tracking
    microsoftTrackAddToCart(
      productItem.id ?? '',
      productItem.displayName ?? productItem.name ?? '',
      price.amount ?? 0,
      'USD',
      undefined
    );

    // Store product in Redux and localStorage
    dispatch(
      setProductType({
        ...productItem,
        prices: [price],
      })
    );

    await handleVerifyRedirectToCheckout({
      selectedProduct: storedProduct,
      product: productItem,
      dispatch,
      startTransition,
      router,
      isSurveyCompleted,
      checkoutUser,
      surveyCategory,
    });
  };
  return (
    <>
      <section id='sgltOptions' className='d-none d-lg-block'>
        <div className='container'>
          <div className='d-none d-lg-flex justify-content-between align-items-center border-0'>
            <p className='modal-title'>Choose a plan that fits your journey</p>
          </div>
          <div className='d-none d-lg-block gap-4'>
            <p className='modal-subtext mb-4'>
              Select a plan based on your goals and commitment level—whether you&apos;re just starting out or aiming for
              long-term results.
            </p>
            <div className='product-plans-container'>
              <div className='row'>
                <div className='col-8 border-end border-dark pe-0'>
                  <div className='product-plans'>
                    {product?.products.map((item, index) =>
                      (item.prices ?? []).map((price, cIndex) => {
                        const details = getProductDetails(price, item);

                        return (
                          <div
                            key={price.priceId ?? Math.random()}
                            className={`flex-grow-1 px-md-4 product-plan${
                              index > 0 || cIndex > 0 ? ' border-top border-dark' : ''
                            }`}
                          >
                            {/* Left section: button + plan name */}
                            <div className='product-plan-left'>
                              <button
                                className='btn btn-primary text-lg rounded-pill py-12 px-4 text-nowrap'
                                onClick={() => handleProductSurvey(item, price)}
                                disabled={!price.priceId || isPending}
                              >
                                Select
                              </button>
                              <div className='product-plan-header'>
                                <p className='product-plan-name'>{details.name}</p>
                                {details.subHeader && <span>{details.subHeader}</span>}
                              </div>
                            </div>
                            {/* Right section: price + description */}
                            <div className='product-plan-right'>
                              <span className='product-plan-price'>${getRoundedPrice(item.dividedAmount)} / mo.</span>
                              <p className='product-plan-desc text-center'>{details.description}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
                <div className='col-4'>
                  <AllPlansInclude />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id='sgltOptionsMobile' className='container d-lg-none'>
        <div className='d-flex justify-content-between align-items-center border-0 mb-5'>
          <p className='modal-title'>{product?.displayName}</p>
        </div>
        <div className='mb-5'>
          <p className='modal-subtext'>
            Select a plan based on your goals and commitment level—whether you&apos;re just starting out or aiming for
            long-term results.
          </p>
        </div>
        <div className='d-flex flex-column gap-3'>
          {product?.products.map((item) =>
            (item?.prices ?? []).map((price) => {
              const details = getProductDetails(price, item);
              return (
                <div
                  key={price.priceId ?? `price-${Math.random().toString(36).substring(2, 9)}`} // Fallback for missing priceId
                  className='d-flex flex-column justify-content-between p-3 border border-dark rounded-3 gap-4'
                >
                  <div className='d-flex flex-column align-items-center text-center tw-gap-y-5'>
                    <b className='m-0 fs-4'>{details.name}</b>
                    {details.subHeader && <span>{details.subHeader}</span>}
                  </div>
                  <div className='text-center'>
                    <b className='m-0 fs-2'>${getRoundedPrice(item.dividedAmount)} / mo.</b>
                    <p className='m-0'>{details.description}</p>
                  </div>
                  <button
                    className='btn btn-primary text-lg rounded-pill py-12 px-4 text-nowrap w-100'
                    onClick={() => handleProductSurvey(item, price)}
                    disabled={!price.priceId || isPending}
                  >
                    Select
                  </button>
                </div>
              );
            })
          )}
        </div>
      </section>
    </>
  );
}
