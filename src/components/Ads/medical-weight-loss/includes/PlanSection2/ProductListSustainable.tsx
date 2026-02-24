import ProductItemSustainable from './ProductItemSustainable';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import styles from './styles.module.scss';

interface Props {
  productsData: ProductTypesResponseData;
}

export default function ProductListSustainable({ productsData }: Readonly<Props>) {
  // Use only GLP-1 products as requested and reverse order
  const glp1Products = productsData?.glp_1_plans?.products || [];
  const reversedProducts = glp1Products.slice().reverse();
  if (reversedProducts.length === 0) {
    return null;
  }
  return (
    <section className={styles.productListSection}>
      <div className='container'>
        <div className='row g-4 justify-content-center'>
          {reversedProducts.map((product) => (
            <div key={product.id} className='col-lg-6 col-md-6 col-sm-8 col-10'>
              <ProductItemSustainable product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
