import { PlanProduct } from '@/store/slices/productTypesApiSlice';
import { getRoundedPrice } from '@/helpers/products';
import Link from 'next/link';
import Image from 'next/image';
import { ProductCategoryKey } from '@/types/products';
import '@/components/Products/ProductsList/styles.css';
import { NAD_PRODUCT_NAME } from '@/constants/factory';

interface Props {
  product: PlanProduct;
  onSelectAction: (ag: PlanProduct, categoryName?: ProductCategoryKey) => void;
  categoryName: ProductCategoryKey;
}

export const ProductCard = ({ product, onSelectAction, categoryName }: Readonly<Props>) => {
  return (
    <div className='row medication_product_container'>
      <div className='col-lg-4 p-0'>
        <div className='medication_product_img'>
          <Image
            src={product.image}
            alt={product.displayName ?? 'Product Image'}
            width={180}
            height={360}
            className='h-360px w-180px object-fit-contain'
          />
        </div>
      </div>
      <div className='col-lg-8 medication_product_details'>
        <p className='medication_product_title'>{product.displayName}</p>
        <div>
          <span className='fw-bold text-xs text-uppercase'>AS LOW AS</span>
          <div className='d-flex align-items-center text-white fw-semibold gap-3'>
            <span>$</span>
            <span className='fs-58'>{getRoundedPrice(product.startingAmount)}</span>
            <span>/month</span>
          </div>
        </div>
        <div className='d-flex gap-3'>
          <button
            className='btn btn-light text-primary rounded-pill py-12 px-4 padding-10px-top padding-10px-bottom fw-medium'
            onClick={() => onSelectAction(product, categoryName)}
            data-tracking-id={`product-card-products-list-${product.displayName}`}
          >
            Get Started
          </button>
          <Link
            className='btn btn-outline-light py-12 px-4 padding-10px-top padding-10px-bottom fw-medium rounded-pill'
            href={`/products/${categoryName === 'glp_1_plans' ? 'glp-1-plans' : categoryName === 'glp_1_gip_plans' ? 'glp-1-gip-plans' : 'nad-plans'}`}
          >
            Learn More
          </Link>
          {/* <button data-toggle="modal" data-target="#sgltModal" style="border-radius:138px; background:white; color:#3060FE; border:0; width:30%">Get Started</button> */}
        </div>
        <p className='m-0 fw-bold fs-5'>Benefits</p>
        <ul className='d-flex flex-column gap-3 p-0'>
          {product.displayName === 'GLP-1/GIP Injections' ? (
            <>
              <li className='d-flex align-items-center gap-4'>
                <svg width={12} height={10} viewBox='0 0 12 10' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    d='M3.93869 9.85624L0 5.91755L1.79493 4.12262L3.93869 6.27273L10.2051 0L12 1.79493L3.93869 9.85624Z'
                    fill='white'
                  />
                </svg>
                <span>Reduces appetite and hunger</span>
              </li>
              <li className='d-flex align-items-center gap-4'>
                <svg width={12} height={10} viewBox='0 0 12 10' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    d='M3.93869 9.85624L0 5.91755L1.79493 4.12262L3.93869 6.27273L10.2051 0L12 1.79493L3.93869 9.85624Z'
                    fill='white'
                  />
                </svg>
                <span>Slows stomach emptying and helps you feel fuller, longer</span>
              </li>
              <li className='d-flex align-items-center gap-4'>
                <svg width={12} height={10} viewBox='0 0 12 10' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    d='M3.93869 9.85624L0 5.91755L1.79493 4.12262L3.93869 6.27273L10.2051 0L12 1.79493L3.93869 9.85624Z'
                    fill='white'
                  />
                </svg>
                <span>Helps control blood sugars</span>
              </li>
            </>
          ) : product.displayName.includes(NAD_PRODUCT_NAME) ? (
            <>
              <li className='d-flex align-items-center gap-4'>
                <svg width={12} height={10} viewBox='0 0 12 10' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    d='M3.93869 9.85624L0 5.91755L1.79493 4.12262L3.93869 6.27273L10.2051 0L12 1.79493L3.93869 9.85624Z'
                    fill='white'
                  />
                </svg>
                <span>Increased energy and reduced fatigue</span>
              </li>
              <li className='d-flex align-items-center gap-4'>
                <svg width={12} height={10} viewBox='0 0 12 10' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    d='M3.93869 9.85624L0 5.91755L1.79493 4.12262L3.93869 6.27273L10.2051 0L12 1.79493L3.93869 9.85624Z'
                    fill='white'
                  />
                </svg>
                <span>May increase metabolism for healthy weight management</span>
              </li>
              <li className='d-flex align-items-center gap-4'>
                <svg width={12} height={10} viewBox='0 0 12 10' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    d='M3.93869 9.85624L0 5.91755L1.79493 4.12262L3.93869 6.27273L10.2051 0L12 1.79493L3.93869 9.85624Z'
                    fill='white'
                  />
                </svg>
                <span>Can help boost your immune system</span>
              </li>
            </>
          ) : (
            <>
              <li className='d-flex align-items-center gap-4'>
                <svg width={12} height={10} viewBox='0 0 12 10' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    d='M3.93869 9.85624L0 5.91755L1.79493 4.12262L3.93869 6.27273L10.2051 0L12 1.79493L3.93869 9.85624Z'
                    fill='white'
                  />
                </svg>
                <span>Improves your energy, mood, and sleep</span>
              </li>
              <li className='d-flex align-items-center gap-4'>
                <svg width={16} height={10} viewBox='0 0 12 10' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    d='M3.93869 9.85624L0 5.91755L1.79493 4.12262L3.93869 6.27273L10.2051 0L12 1.79493L3.93869 9.85624Z'
                    fill='white'
                  />
                </svg>
                <span>Helps you feel fuller for longer by reducing appetite and hunger</span>
              </li>
              <li className='d-flex align-items-center gap-4'>
                <svg width={12} height={10} viewBox='0 0 12 10' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    d='M3.93869 9.85624L0 5.91755L1.79493 4.12262L3.93869 6.27273L10.2051 0L12 1.79493L3.93869 9.85624Z'
                    fill='white'
                  />
                </svg>
                <span>Reduces weight-related diseases</span>
              </li>
            </>
          )}
        </ul>
        <p className='m-0 fs-5 fw-bold'>Program Summary</p>
        <div id='program-summary'>
          <div className='d-flex align-items-center gap-3'>
            <svg width={18} height={13} viewBox='0 0 18 13' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <path
                d='M16.4988 10.4492H13.4988V5.19916H16.4988M17.2488 3.69916H12.7488C12.5499 3.69916 12.3591 3.77818 12.2184 3.91883C12.0778 4.05948 11.9988 4.25025 11.9988 4.44916V11.9492C11.9988 12.1481 12.0778 12.3388 12.2184 12.4795C12.3591 12.6201 12.5499 12.6992 12.7488 12.6992H17.2488C17.4477 12.6992 17.6385 12.6201 17.7791 12.4795C17.9198 12.3388 17.9988 12.1481 17.9988 11.9492V4.44916C17.9988 4.25025 17.9198 4.05948 17.7791 3.91883C17.6385 3.77818 17.4477 3.69916 17.2488 3.69916ZM2.99878 2.19916H16.4988V0.699158H2.99878C2.60095 0.699158 2.21942 0.857193 1.93812 1.1385C1.65681 1.4198 1.49878 1.80133 1.49878 2.19916V10.4492H-0.0012207V12.6992H10.4988V10.4492H2.99878V2.19916Z'
                fill='white'
              />
            </svg>
            <span>Initial Telehealth Visit</span>
          </div>
          <div className='d-flex align-items-center gap-3'>
            <svg width={18} height={18} viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <path
                d='M11.4991 2.03248V7.86581H3.30744L2.33244 8.84081V2.03248H11.4991ZM12.3324 0.365814H1.4991C1.27809 0.365814 1.06613 0.453612 0.909849 0.609892C0.753569 0.766172 0.665771 0.978134 0.665771 1.19915V12.8658L3.9991 9.53248H12.3324C12.5535 9.53248 12.7654 9.44468 12.9217 9.2884C13.078 9.13212 13.1658 8.92016 13.1658 8.69915V1.19915C13.1658 0.978134 13.078 0.766172 12.9217 0.609892C12.7654 0.453612 12.5535 0.365814 12.3324 0.365814ZM16.4991 3.69915H14.8324V11.1991H3.9991V12.8658C3.9991 13.0868 4.0869 13.2988 4.24318 13.4551C4.39946 13.6114 4.61142 13.6991 4.83244 13.6991H13.9991L17.3324 17.0325V4.53248C17.3324 4.31147 17.2446 4.09951 17.0884 3.94323C16.9321 3.78695 16.7201 3.69915 16.4991 3.69915Z'
                fill='white'
              />
            </svg>
            <span>Real-Time Physician Support</span>
          </div>
          <div className='d-flex align-items-center gap-3'>
            <svg width={18} height={16} viewBox='0 0 12 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <path
                d='M4.7491 10.1992H2.66577V7.69916H4.7491V5.61582H7.2491V7.69916H9.33244V10.1992H7.2491V12.2825H4.7491V10.1992ZM11.8324 4.36582V13.5325C11.8324 14.4492 11.0824 15.1992 10.1658 15.1992H1.83244C0.915771 15.1992 0.165771 14.4492 0.165771 13.5325V4.36582C0.165771 3.44916 0.915771 2.69916 1.83244 2.69916H10.1658C11.0824 2.69916 11.8324 3.44916 11.8324 4.36582ZM10.1658 4.36582H1.83244V13.5325H10.1658V4.36582ZM10.9991 0.199158H0.999105V1.86582H10.9991V0.199158Z'
                fill='white'
              />
            </svg>
            <span>Prescription + Medication</span>
          </div>
          <div className='d-flex align-items-center gap-3'>
            <svg width={20} height={19} viewBox='0 0 20 19' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <path
                d='M17.4985 13.8658V6.36583H5.83179V13.8658H17.4985ZM17.4985 2.19917C17.9405 2.19917 18.3644 2.37476 18.677 2.68732C18.9895 2.99988 19.1651 3.42381 19.1651 3.86583V13.8658C19.1651 14.3079 18.9895 14.7318 18.677 15.0443C18.3644 15.3569 17.9405 15.5325 17.4985 15.5325H5.83179C4.90679 15.5325 4.16512 14.7825 4.16512 13.8658V3.86583C4.16512 3.42381 4.34072 2.99988 4.65328 2.68732C4.96584 2.37476 5.38976 2.19917 5.83179 2.19917H6.66512V0.532501H8.33179V2.19917H14.9985V0.532501H16.6651V2.19917H17.4985ZM14.6068 8.91584L10.9068 12.6158L8.67345 10.3825L9.55679 9.49917L10.9068 10.8492L13.7235 8.0325L14.6068 8.91584ZM2.49845 17.1992H14.1651V18.8658H2.49845C1.57345 18.8658 0.831787 18.1158 0.831787 17.1992V7.19917H2.49845V17.1992Z'
                fill='white'
              />
            </svg>
            <span>Remote Monthly Check-Ins</span>
          </div>
        </div>
      </div>
    </div>
  );
};
