'use client';

import { ConfirmationModalState } from '@/types/products';
import { Modal, Button, Spinner } from 'react-bootstrap';
import { MdClose } from 'react-icons/md';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useMemo } from 'react';
import { PlanType } from '@/types/medications';

type CouponDiscount = {
  originalAmount: string;
  amountAfterDiscount: string;
  discountAmount: string;
  couponCode: string;
};

type SwitchPlanModalProps = {
  isLoading: boolean;
  state: ConfirmationModalState;
  onClose: () => void;
  onConfirm: () => void;
  appliedDiscount?: CouponDiscount | null;
};

export default function SwitchPlanModal({ isLoading, state, onClose, onConfirm, appliedDiscount }: Readonly<SwitchPlanModalProps>) {
  const subscriptions = useSelector((state: RootState) => state.patientActiveSubscription);
  const { activeSubscriptions } = subscriptions || {};

  // Same logic as PricingCard.tsx
  const recurringPlans = useMemo(() => {
    return activeSubscriptions?.filter((subscription) => subscription.subscriptionType === PlanType.RECURRING) || [];
  }, [activeSubscriptions]);

  const isSwitch = useMemo(() => {
    const plan = state.selectedProduct;
    if (!plan) return false;
    
    // If no recurring plans, it's a buy
    if (recurringPlans?.length === 0) {
      return false;
    }
    
    // If plan type is RECURRING
    if (plan.planType === PlanType.RECURRING) {
      // If the medicineName is already in user's recurring plans, it's a switch
      if (recurringPlans.map((p) => p.medicineName).includes(plan.medicineName)) {
        return true;
      }
      // Otherwise it's a buy (new medicine)
      return false;
    }
    
    // For non-recurring plans, it's always a buy
    return false;
  }, [state.selectedProduct, recurringPlans]);

  const actionText = isSwitch ? 'Switch' : 'Buy';
  const actionVerb = isSwitch ? 'Switching' : 'Subscribing';

  return (
    <Modal show={state.show} onHide={onClose} backdrop='static' centered>
      <Modal.Body className='px-4 py-4'>
        <button
          className='btn btn-link border-none position-absolute top-0 end-0 m-3 p-0'
          onClick={onClose}
          aria-label='Close'
        >
          <MdClose size={24} color='#000' />
        </button>
        <h5 className='fw-semibold mb-3'>{actionText} Subscription?</h5>
        <p className='fs-6'>
          {actionVerb} to{' '}
          <span className='fw-semibold'>
            {state.selectedProduct?.name} for{' '}
            {appliedDiscount ? (
              <>
                <span className='text-decoration-line-through text-muted'>${parseFloat(appliedDiscount.originalAmount).toFixed(2)}</span>{' '}
                <span className='text-success'>${parseFloat(appliedDiscount.amountAfterDiscount).toFixed(2)}</span>
              </>
            ) : (
              `$${state.selectedProduct?.prices?.[0]?.amount?.toFixed(2)}`
            )}
          </span>
        </p>
        <div className='d-flex justify-content-center gap-3'>
          <Button
            variant='outline-dark'
            onClick={onClose}
            disabled={isLoading}
            className='px-4 py-1 rounded-2 w-100 fw-medium border-1'
          >
            No
          </Button>
          <Button
            variant='primary'
            onClick={() => onConfirm()}
            className='px-4 py-1 rounded-2 w-100 fw-medium'
            disabled={isLoading}
          >
            {isLoading && <Spinner size='sm' className='me-2' />}
            Yes
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
