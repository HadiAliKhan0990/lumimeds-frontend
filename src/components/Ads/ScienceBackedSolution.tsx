'use client';

import PrimaryVial from '@/assets/female-vial1.png';
import WhiteVial from '@/assets/male-vial.png';
import VialSglt from '@/assets/vial_sglt.png';
import VialTzpt from '@/assets/vial_tzpt.png';
import Image from 'next/image';
import { FaCheck } from 'react-icons/fa';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { handleVerifyRedirectToCheckout } from '@/helpers/products';
import { Spinner } from 'react-bootstrap';

type Variant = 'white' | 'primary';

interface Props {
  variant?: Variant;
  data: ProductTypesResponseData;
}

export default function ScienceBackedSolution({ variant = 'primary', data }: Readonly<Props>) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  const selectedProduct = useSelector((state: RootState) => state.productType);
  const checkout = useSelector((state: RootState) => state.checkout);

  const { isSurveyCompleted, checkoutUser } = checkout || {};

  const handleGetStarted = async () => {
    await handleVerifyRedirectToCheckout({
      selectedProduct,
      product: selectedProduct,
      dispatch,
      startTransition,
      router,
      isSurveyCompleted,
      checkoutUser,
    });
  };
  return (
    <section className={`science-backed-section ${variant === 'primary' ? 'bg-white' : 'bg-dark'}`}>
      <div className='container d-flex flex-column align-items-center science-backed-content'>
        <Image
          src={variant === 'primary' ? PrimaryVial : WhiteVial}
          alt=''
          width={500}
          height={500}
          className='science-backed-vial'
        />
        <p className='display-1 text-center science-backed-title'>
          Meet GLP-1: <br /> The Science-Backed Solution for Women.
        </p>
        <div className='d-flex flex-column flex-lg-row align-items-center science-backed-features'>
          <div className='d-flex align-items-start science-backed-feature gap-2'>
            <div className='icon-circle '>
              <FaCheck className='icon-check' aria-hidden='true' />
            </div>
            <p className='text-start h3 fw-semibold science-backed-feature-text mb-0'>
              Curbs cravings so you eat less without feeling deprived
            </p>
          </div>

          <div className='d-flex align-items-start science-backed-feature gap-2'>
            <div className='icon-circle '>
              <FaCheck className='icon-check' aria-hidden='true' />
            </div>
            <p className='text-start h3 fw-semibold science-backed-feature-text mb-0'>
              Balances blood sugar for steady energy &amp; fewer crashes
            </p>
          </div>

          <div className='d-flex align-items-start science-backed-feature gap-2'>
            <div className='icon-circle '>
              <FaCheck className='icon-check' aria-hidden='true' />
            </div>
            <p className='text-start h3 fw-semibold science-backed-feature-text mb-0'>
              Helps regulate hormones to make weight loss effortless
            </p>
          </div>
        </div>

        <div className='d-flex flex-column align-items-center flex-lg-row science-backed-pricing'>
          <div className='d-flex align-items-center align-items-lg-end science-backed-price-item'>
            <div className='text-end'>
              <p className='fw-bold science-backed-price-title'>GLP-1 Injections</p>
              <span className='h4 science-backed-price-subtitle'>As low as</span>
              <p className='fw-bold science-backed-price-amount'>${data?.glp_1_plans?.startingAmount}/mo</p>
            </div>
            <Image src={VialSglt} className='science-backed-price-vial flex-shrink-0' width={500} height={500} alt='' />
          </div>
          <div className='d-flex align-items-center align-items-lg-end science-backed-price-item'>
            <Image src={VialTzpt} className='science-backed-price-vial flex-shrink-0' width={500} height={500} alt='' />
            <div className='text-start'>
              <p className='fw-bold science-backed-price-title'>GLP-1/GIP Injections</p>
              <span className='h4 science-backed-price-subtitle'>As low as</span>
              <p className='fw-bold science-backed-price-amount'>${data?.glp_1_gip_plans?.startingAmount}/mo</p>
            </div>
          </div>
        </div>
        <button
          disabled={isPending}
          onClick={handleGetStarted}
          className='btn btn-primary science-backed-btn get-started-add d-inline-flex align-items-center justify-content-center gap-2'
        >
          {isPending && <Spinner className='border-2' size='sm' />}
          GET STARTED
        </button>
      </div>
    </section>
  );
}
