'use client';

import Image from 'next/image';
import { PlanProduct } from '@/store/slices/productTypesApiSlice';
import { PriceCard } from './PriceCard';
import { ProductType } from '@/store/slices/productTypeSlice';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useEffect } from 'react';
import SupportIcon from '@/components/Icon/SupportIcon';
import ComputerIcon from '@/components/Icon/ComputerIcon';
import PrescriptionIcon from '@/components/Icon/PrescriptionIcon';
import CheckInsIcon from '@/components/Icon/CheckInsIcon';
import {
  WEIGHT_LOSS_INJECTIONS_LABEL,
  GLP1_PRODUCT_NAME,
  GLP1_GIP_PRODUCT_NAME,
  OLYMPIA_PRODUCT_NAME,
  GLP1_LABEL,
  GLP1_GIP_LABEL,
  NAD_PRODUCT_NAME,
  NAD_LABEL,
  LONGEVITY_INJECTIONS_LABEL,
} from '@/constants/factory';
import { ProductDiscounts } from '@/hooks/usePromoCoupons';
import { useGoogleMerchantConfig } from '@/hooks/useGoogleMerchantConfig';
import { TruckIcon } from '@/components/Icon/TruckIcon';
import {PatientLoveIcon} from '@/components/Icon/PatientLoveIcon';
import { usePathname } from 'next/navigation';
import ProductImage from '@/assets/ads/google-shopping/product.svg';
import { GOOGLE_MERCHANT_SOURCE } from '@/constants';


interface Props {
  product: PlanProduct;
  displayName: string;
  onSelect: (name: string, product?: ProductType) => void;
  selectedSummaryProduct?: ProductType;
  source?: string;
  discounts?: ProductDiscounts;
}

export const SummaryProductCard = ({ product, displayName, onSelect, selectedSummaryProduct, source, discounts }: Readonly<Props>) => {
  const selectedProduct = useSelector((state: RootState) => state.productType);

  const { isGoogleMerchant, renderTextWRTGoogleMerchant } = useGoogleMerchantConfig();

  const isAddPage = usePathname()?.includes('/ad');
  
  // Determine product type based on categoryIds, categoryName, displayName, or medicineName
  const getProductConstants = () => {
    const categoryIdsLower = product.categoryIds?.join(' ').toLowerCase() || '';
    const categoryNameLower = product.categoryName?.toLowerCase() || '';
    const displayNameLower = product.displayName?.toLowerCase() || '';
    const firstProductMedicineName = product.products[0]?.medicineName?.toLowerCase() || '';
    
    // Check for GLP-1/GIP (check category IDs, category name, display name, or medicine name)
    if (
      categoryIdsLower.includes('gip') ||
      categoryNameLower.includes('gip') ||
      displayNameLower.includes('gip') ||
      firstProductMedicineName.includes('tirzepatide')
    ) {
      return {
        productName: GLP1_GIP_PRODUCT_NAME,
        injectionLabel: WEIGHT_LOSS_INJECTIONS_LABEL,
        label: GLP1_GIP_LABEL,
      };
    }
    
    // Check for Olympia (check category IDs first - most reliable)
    // Olympia products have category IDs like 'weight_loss_glp_1_503b_injection_one_time'
    if (
      categoryIdsLower.includes('503b') ||
      categoryNameLower.includes('olympia') ||
      categoryNameLower.includes('503b') ||
      displayNameLower.includes('olympia') ||
      displayNameLower.includes('503b') ||
      firstProductMedicineName.includes('olympia')
    ) {
      return {
        productName: OLYMPIA_PRODUCT_NAME,
        injectionLabel: WEIGHT_LOSS_INJECTIONS_LABEL,
        label: '',
      };
    }
    
    if (
      categoryNameLower.includes('nad') ||
      displayNameLower.includes('nad') ||
      firstProductMedicineName.includes('longevity')
    ) {
      return {
        productName: NAD_PRODUCT_NAME,
        injectionLabel: LONGEVITY_INJECTIONS_LABEL,
        label: NAD_LABEL,
      };
    }

    // Default to GLP-1
    return {
      productName: GLP1_PRODUCT_NAME,
      label: GLP1_LABEL,
    };
  };

  const productConstants = getProductConstants();

  function handleSelect(prod: ProductType, name: string) {
    onSelect(name, prod);
  }

  // Check if the selected product belongs to this category
  const categorySelectedProduct = selectedSummaryProduct && product.products.some((p) => p.id === selectedSummaryProduct.id)
    ? selectedSummaryProduct
    : null;

  useEffect(() => {
    if (selectedProduct?.id && displayName) {
      const findProduct = product.products.find((p) => p.id === selectedProduct.id);
      if (findProduct) {
        onSelect(product.summaryText, findProduct);
      }
    }
  }, [selectedProduct, displayName]);

  const isGoogleMerchantImage = source === GOOGLE_MERCHANT_SOURCE;
  return (
    <div className='product-summary-main-container'>
      {/* Category Title - Top Left Corner */}
      <div className='product-summary-category-title product-summary-category-container'>
        <div>{productConstants.productName}</div>
        <div>
          {productConstants.label && `${productConstants.label} `}
          {source === 'google-merchant'
            ? productConstants.injectionLabel?.replace(/\s*Injections?/gi, '') || ''
            : productConstants.injectionLabel}
        </div>
      </div>

      <div className='product-summary-content'>
        <div className='row justify-content-end gy-5'>
          {/* Left column */}
          <div className='col-12 col-lg-4 col-xl-5 d-flex flex-column align-items-center justify-content-center product-summary-card-left'>
            <div className='product-summary-img-outer-wrapper'>
              {isGoogleMerchantImage && !product?.categoryName?.toLowerCase()?.includes('nad') ? (
                <Image
                  src={ProductImage}
                  alt='Month Product'
                  width={250}
                  height={350}
                  className='md:max-w-[250px] md:max-h-[350px] mb-3'
                />
              ) : (
                <Image
                  src={categorySelectedProduct?.image || product.image}
                  alt={categorySelectedProduct?.displayName || product.displayName || 'Product'}
                  width={220}
                  height={350}
                  className='product-summary-img mb-3'
                  unoptimized
                />
              )}
            </div>
          </div>
          {/* Right column */}
          <div className='col-12 col-lg-8 col-xl-7 d-flex align-items-center justify-content-center product-summary-card-right'>
            <div className='product-summary-right-inner product-summary-right-inner-custom w-100 mt-3'>
              {product.products.map((prodItem) => {
                const priceId = prodItem.prices?.[0]?.priceId;
                const discount = priceId ? discounts?.[priceId] : undefined;
                return (
                  <PriceCard
                    key={prodItem.id}
                    isSelected={prodItem.id === categorySelectedProduct?.id}
                    onSelect={(prod) => handleSelect(prod, product.summaryText)}
                    product={{
                      ...prodItem,
                      ...(isAddPage && isGoogleMerchant
                        ? {
                            bulletDescription: [
                              `Includes your first 3 starter doses: 2.22 mg for weeks 1-4, 4.45
                               mg for weeks 5-8, and 6.25/6.67mg mg for weeks 9-12.`,
                              `Includes everything you need to start your weight loss journey.`,
                              `Available for new patients beginning GLP-1/GIP treatment.`,
                              `Measurable results as you progress.`,
                            ],
                          }
                        : {}),
                    }}
                    source={source}
                    discount={discount}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {isGoogleMerchant ? (
          <div
            className='tw-py-1 tw-rounded-lg tw-text-center tw-text-white tw-font-sans tw-font-semibold'
            style={{ background: 'linear-gradient(120deg, #04208B 0%, #0577FE 100%), #002089' }}
          >
            {`What's Included:`}
          </div>
        ) : null}

        <div
          className={`${
            isGoogleMerchant ? '!tw-border-t-0 !tw-pt-4 !tw-pb-0' : 'tw-mt-4'
          } product-summary-program-box tw-pl-4 sm:tw-pl-0 `}
        >
          <div className='product-summary-program-content'>
            <div className='product-summary-program-item'>
              <ComputerIcon size={isGoogleMerchant ? 15 : 20} fill='#000' className='flex-shrink-0' />
              <span className={`product-summary-program-text ${isGoogleMerchant ? 'lg:!tw-text-[10px] xl:!tw-text-[14px]' : ''}`}>Initial Telehealth Consult</span>
              {isGoogleMerchant ? <RenderZeroDollar /> : null}
            </div>
            <div className='product-summary-program-item'>
              <PrescriptionIcon size={isGoogleMerchant ? 15 : 20} fill='#000' className='flex-shrink-0' />
              <span className={`product-summary-program-text ${isGoogleMerchant ? 'lg:!tw-text-[10px] xl:!tw-text-[14px]' : ''}`}>
                {renderTextWRTGoogleMerchant({
                  text: 'Prescription + Medication',
                  googleMerchantText: 'All 12 doses of medication',
                })}
              </span>
              {isGoogleMerchant ? <span> - <strong>$399</strong></span> : null}
            </div>
            <div className='product-summary-program-item'>
              {isGoogleMerchant ? <TruckIcon /> : <SupportIcon size={isGoogleMerchant ? 15 : 20} fill='#000' className='flex-shrink-0' />}
              <span className={`product-summary-program-text ${isGoogleMerchant ? 'lg:!tw-text-[10px] xl:!tw-text-[14px]' : ''}`}>
                {renderTextWRTGoogleMerchant({
                  text: 'Real-time Virtual Support',
                  googleMerchantText: 'Priority shipping from a U.S. pharmacy',
                })}
              </span>
              {isGoogleMerchant ? <RenderZeroDollar /> : null}
            </div>
            <div className='product-summary-program-item'>
              {isGoogleMerchant ? (
                <PatientLoveIcon />
              ) : (
                <CheckInsIcon size={isGoogleMerchant ? 15 : 20} fill='#000' className='flex-shrink-0' />
              )}
              <span className={`product-summary-program-text ${isGoogleMerchant ? 'lg:!tw-text-[10px] xl:!tw-text-[14px]' : ''}`}>
                {renderTextWRTGoogleMerchant({
                  text: 'Remote Monthly Check-Ins',
                  googleMerchantText: 'Patient Portal Access (Optional)',
                })}
              </span>
              {isGoogleMerchant ? <RenderZeroDollar /> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


const RenderZeroDollar = () => {
  return (
    <span className='tw-flex-shrink-0'>- <strong>$0</strong></span>
  );
};