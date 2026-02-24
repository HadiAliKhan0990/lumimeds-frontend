import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import { GLP1_GIP_PRODUCT_NAME, GLP1_GIP_LABEL } from '@/constants/factory';
import { ProductType } from '@/store/slices/productTypeSlice';
import ProductItemWeightLoss from './ProductItemWeightLoss';
import styles from './styles.module.scss';

interface Props {
  productsData: ProductTypesResponseData;
}

export default function ProductListWeightLoss({ productsData }: Readonly<Props>) {
  // Use only GLP-1 GIP products as requested
  const glp1GipProducts = productsData?.glp_1_gip_plans?.products || [];

  // Don't render anything if no products
  if (glp1GipProducts.length === 0) {
    return null;
  }

  const tempProducts: ProductType[] = [];

  for (let i = 0; i < glp1GipProducts.length; i++) {
    if (glp1GipProducts?.[i]?.metadata?.planTier === 'starter') {
      tempProducts[0] = glp1GipProducts?.[i];
    } else if (glp1GipProducts?.[i]?.metadata?.planTier === 'value') {
      tempProducts[1] = glp1GipProducts?.[i];
    } else if (
      glp1GipProducts?.[i]?.metadata?.planTier === 'monthly' ||
      glp1GipProducts?.[i]?.metadata?.intervalCount === 1
    ) {
      const product = glp1GipProducts?.[i];
      tempProducts[2] = { ...product, metadata: { ...product.metadata, planTier: 'monthly' } };
    }
  }

  return (
    <section className={styles.productListSection}>
      <div className='tw-container tw-mx-auto tw-px-4'>
        <div className='row g-4 justify-content-center'>
          {tempProducts.length > 0 ? (
            tempProducts.map((product) => (
              <div key={product.id} className='col-lg-4 col-md-6 col-sm-10'>
                <ProductItemWeightLoss product={product} />
              </div>
            ))
          ) : (
            <div className='col-12 text-center'>
              <p>
                No {GLP1_GIP_PRODUCT_NAME} {GLP1_GIP_LABEL} products available
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
