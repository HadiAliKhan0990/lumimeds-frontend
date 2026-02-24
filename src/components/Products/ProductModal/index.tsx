'use client';

import { useTransition } from 'react';
import { Modal } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import { ProductPrice, ProductType, setProductType } from '@/store/slices/productTypeSlice';
import { trackAddToCart } from '@/lib/tracking';
import { microsoftTrackAddToCart } from '@/helpers/uetTracking';
import { getRoundedPrice, getProductDetails, handleVerifyRedirectToCheckout } from '@/helpers/products';
import { PlanProduct } from '@/store/slices/productTypesApiSlice';
import { AllPlansInclude } from '@/components/Products/AllPlansInclude';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { trackSurveyAnalytics } from '@/helpers/surveyTracking';
import { getProductCategory } from '@/lib/trackingHelpers';
import './styles.css';

interface Props {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  selectedProduct?: PlanProduct;
}

export function ProductModal({ show, setShow, selectedProduct }: Readonly<Props>) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [isPending, startTransition] = useTransition();

  const storedProduct = useSelector((state: RootState) => state.productType);
  const checkout = useSelector((state: RootState) => state.checkout);
  const { isSurveyCompleted, checkoutUser, surveyCategory } = checkout || {};

  const handleProductSurvey = async (product: ProductType, price: ProductPrice) => {
    // Determine product category from selectedProduct or product
    let productCategory: 'longevity' | 'weight_loss' = 'weight_loss';
    
    if (selectedProduct?.categoryName === 'nad_plans') {
      productCategory = 'longevity';
    } else if (selectedProduct?.categoryName === 'glp_1_plans' || selectedProduct?.categoryName === 'glp_1_gip_plans') {
      productCategory = 'weight_loss';
    } else {
      // Fallback to using getProductCategory helper with the product
      productCategory = getProductCategory(product);
    }

    trackAddToCart({
      itemId: product.id ?? '',
      itemName: product.displayName ?? product.name ?? '',
      value: price.amount ?? 0,
      productCategory,
    });

    // Microsoft UET AddToCart tracking
    microsoftTrackAddToCart(
      product.id ?? '',
      product.displayName ?? product.name ?? '',
      price.amount ?? 0
    );

    await trackSurveyAnalytics({
      event: 'survey_get_started',
      payload: { product_id: product.id ?? '', product_name: product.name ?? '', amount: price.amount ?? 0 },
    });

    // Store product in Redux and localStorage
    dispatch(
      setProductType({
        ...product,
        prices: [price],
      })
    );

    await handleVerifyRedirectToCheckout({
      selectedProduct: storedProduct,
      product,
      dispatch,
      startTransition,
      router,
      isSurveyCompleted,
      checkoutUser,
      surveyCategory
    });
  };

  return (
    <Modal show={show} size='xl' centered onHide={() => setShow(false)}>
      <Modal.Header closeButton className='modal-header justify-content-between align-items-start border-0'>
        <p className='modal-title'>Choose a plan that fits your journey</p>
      </Modal.Header>
      <Modal.Body className='pt-0'>
        <div className='p-3'>
          <div className='d-none d-lg-block'>
            <p className='modal-subtext mb-3 mx-auto'>
              Select a plan based on your goals and commitment level—whether you&apos;re just starting out or aiming for
              long-term results.
            </p>
            <div className='product-plans-container'>
              <div className='row product-plans-row'>
                <div className='col-lg-8 product-plans-col-left border-end border-dark pe-0'>
                  <div className='product-plans'>
                    {selectedProduct?.products.map((item, index) =>
                      item.prices?.map((price, cIndex) => {
                        const { name, subHeader, description } = getProductDetails(price, item);
                        const borderTopClass = index > 0 || cIndex > 0 ? ' border-top border-dark' : '';

                        return (
                          <div key={price.priceId} className={`flex-grow-1 product-plan${borderTopClass}`}>
                            <div className='row align-items-center w-100 m-0'>
                              <div className='col-md-7 d-flex align-items-center gap-3'>
                                <button
                                  disabled={isPending}
                                  className='btn btn-primary rounded-pill px-4 py-12 fw-medium text-nowrap text-lg'
                                  onClick={() => handleProductSurvey(item, price)}
                                >
                                  Select
                                </button>
                                <div>
                                  <div className='product-plan-header fw-bold mb-0'>{name}</div>
                                  {subHeader && <span>{subHeader}</span>}
                                </div>
                              </div>
                              <div className='col-md-5 text-md-end text-start'>
                                <div className='product-plan-price fw-bold fs-2'>
                                  ${getRoundedPrice(item.dividedAmount)} / mo.
                                </div>
                                <div className='product-plan-subs fs-5'>{description}</div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
                <div className='col-lg-4'>
                  <AllPlansInclude />
                </div>
              </div>
            </div>
          </div>

          <div className='d-lg-none'>
            <div className='mb-5'>
              <p className='modal-subtext mb-3'>
                Select a plan based on your goals and commitment level—whether you&apos;re just starting out or aiming
                for long-term results.
              </p>
            </div>
            <div className='d-flex flex-column gap-3'>
              {selectedProduct?.products.map((item) =>
                item.prices?.map((price) => {
                  const { name, subHeader, description } = getProductDetails(price, item);

                  return (
                    <div
                      key={price.priceId}
                      className='d-flex flex-column justify-content-between border border-dark rounded-3 p-4 gap-4'
                    >
                      <div className='d-flex flex-column align-items-center justify-content-center text-center'>
                        <span className='fw-bold fs-4'>{name}</span>
                        {subHeader && <span>{subHeader}</span>}
                      </div>
                      <div className='text-center'>
                        <b className='m-0 fs-2'>${getRoundedPrice(item.dividedAmount)} / mo.</b>
                        <p className='m-0'>{description}</p>
                      </div>
                      <button
                        className='btn btn-primary rounded-pill w-100 py-12 fw-medium'
                        disabled={isPending}
                        onClick={() => handleProductSurvey(item, price)}
                      >
                        Select
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
