'use client';

import { Modal, ModalProps } from 'react-bootstrap';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import { MdClose } from 'react-icons/md';
import { PricingCard } from '@/components/Dashboard/patient/subscriptions/includes/OtherPlans/includes/PricingPlanModal/includes/PricingCard';
import { ModalState } from '@/types/products';
import { Product } from '@/store/slices/patientAtiveSubscriptionSlice';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import 'swiper/css';
import 'swiper/css/pagination';
import '@/styles/subscriptionStyles.scss';

interface Props extends ModalProps {
  modalState: ModalState;
  setShowModal: (val: ModalState) => void;
  handlePlanSelect: (plan: Product) => void;
}

export default function PricingPlanModal({ modalState, setShowModal, handlePlanSelect, ...props }: Readonly<Props>) {
  const { selectedProduct } = modalState || {};

  const category = selectedProduct?.displayName.includes("NAD+") ? "Wellness" : "Weight Loss";

  const slideCount = selectedProduct?.products?.length || 0;

  const subscriptions = useSelector((state: RootState) => state.patientActiveSubscription);
  const { activeSubscriptions } = subscriptions || {};

  const initialSlideIndex = useMemo(() => {
    const productIds = (activeSubscriptions || []).map((subscription) => subscription.productId);
    const idx = (selectedProduct?.products || []).findIndex((plan) => productIds.includes(plan.id?.toString() || ''));
    return idx >= 0 ? idx : 0;
  }, [selectedProduct, activeSubscriptions]);

  const closeModal = () => setShowModal({ show: false, selectedProduct: undefined });
  return (
    <Modal {...props} show={modalState.show} onHide={closeModal} centered size='xl'>
      <Modal.Body className='px-4 py-4 productDetailModalBg'>
        <button className='btn btn-link border-none position-absolute top-0 end-0 m-3 p-0' onClick={closeModal}>
          <MdClose size={24} color='#000' />
        </button>

        <div className='text-center mb-3 px-4 pt-4 pb-2'>
          <h4 className='fw-normal fs-1 lh-2 mb-0 DM-sans'>Your Personalized Path to {category}</h4>
          <div className='mt-3 mx-auto custom-intro'>
            <p className='fw-normal fs-6'>{selectedProduct?.planText}</p>
            <p>
              It&apos;s the ideal choice for those ready to begin their transformation and experience the benefits of
              personalized medical support.
            </p>
          </div>
        </div>

        <div className='px-1 py-0 pricing-modal-swiper-wrapper'>
          <Swiper
            spaceBetween={16}
            breakpoints={{
              0: { slidesPerView: 1 },
              992: { slidesPerView: Math.min(slideCount, 2) },
            }}
            initialSlide={initialSlideIndex}
            modules={[Pagination]}
            pagination={{ clickable: false }}
          >
            {selectedProduct?.products?.map((plan) => (
              <SwiperSlide key={plan.id} className='h-100'>
                <PricingCard
                  className={'mx-auto' + (selectedProduct?.products?.length < 2 ? ' reduce-size' : '')}
                  plan={plan}
                  onSwitch={() => handlePlanSelect(plan)}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className='row pricing-modal-grid-wrapper justify-content-center g-4 px-2'>
          {selectedProduct?.products?.map((plan) => (
            <div key={plan.id} className='col-4'>
              <PricingCard plan={plan} onSwitch={() => handlePlanSelect(plan)} />
            </div>
          ))}
        </div>
      </Modal.Body>
    </Modal>
  );
}
