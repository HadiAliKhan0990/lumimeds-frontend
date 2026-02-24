'use client';

import { Button, Card } from 'react-bootstrap';
import { AsyncImage } from 'loadable-image';
import { Blur } from 'transitions-kit';
import { IoIosStar } from 'react-icons/io';
import { capitalizeFirst, pluralizeMonthInProductName } from '@/lib/helper';
import { Product } from '@/store/slices/patientAtiveSubscriptionSlice';
import { PlanType } from '@/types/medications';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

interface Props {
  plan: Product;
  onSwitch: (id: string, name: string) => void;
  className?: string;
}

export const PricingCard = ({ plan, onSwitch, className = '' }: Readonly<Props>) => {
  const subscriptions = useSelector((state: RootState) => state.patientActiveSubscription);
  const { activeSubscriptions } = subscriptions || {};

  const isCurrent = useMemo(() => {
    const productIds = activeSubscriptions?.map((subscription) => subscription.productId);
    return productIds.includes(plan.id?.toString() || '');
  }, [plan, activeSubscriptions]);

  const recurringPlans = useMemo(() => {
    return activeSubscriptions?.filter((subscription) => subscription.subscriptionType === PlanType.RECURRING) || [];
  }, [activeSubscriptions]);

  const buttonText = useMemo(() => {
    if (recurringPlans?.length === 0) {
      return 'Buy Plan';
    } else if (plan.planType === PlanType.RECURRING) {
      if (isCurrent) {
        return 'Current Plan';
      } else if (!recurringPlans.map((plan) => plan.medicineName).includes(plan.medicineName)) {
        return 'Buy Plan';
      } else {
        return 'Switch Plan';
      }
    } else {
      return 'Buy Plan';
    }
  }, [isCurrent, plan.planType, recurringPlans]);

  return (
    <Card
      className={`text-center position-relative d-flex flex-column flex-grow-1 w-sm-100 h-100 custom-card ${className} ${isCurrent ? 'border-primary' : ''
        }`}
    >
      {/* Current Plan Pill */}
      <div
        className={
          'd-flex align-items-center position-absolute top-0 start-0 end-0 p-2' +
          (isCurrent && plan.planType === PlanType.ONE_TIME ? ' justify-content-between' : ' justify-content-end')
        }
      >
        {isCurrent && plan.planType === PlanType.ONE_TIME && (
          <div className='px-2 py-1 bg-cloud-blue text-primary text-xs fw-semibold rounded-pill'>Current Plan</div>
        )}

        <div>
          {`${plan.metadata?.intervalCount} ${capitalizeFirst(plan.metadata?.billingInterval || '')}${plan.metadata?.intervalCount > 1 ? 's' : ''
            }`}
        </div>
      </div>

      <Card.Body className='px-4 mt-5 pt-4 pb-4 d-flex flex-column flex-grow-1'>
        <AsyncImage
          src={plan?.image || ''}
          Transition={Blur}
          loader={<div className='bg-secondary-subtle' />}
          alt={plan?.name || ''}
          className='mx-auto mb-3 custom-image-product'
          objectFit='contain'
        />
        <h6 className='text-primary fs-5 fw-semibold mb-2'>{pluralizeMonthInProductName(plan.name)}</h6>
        <div className='text-dark fw-bold'>
          <span className='fs-1 text-primary fw-medium'>
            {plan.prices?.[0]?.checkoutType === 'subscription'
              ? `$${(plan.prices?.[0]?.amount / (plan.prices?.[0]?.billingIntervalCount || 1)).toFixed(0)}`
              : `$${plan.prices?.[0]?.amount.toFixed(0)}`}
            {plan.prices?.[0]?.checkoutType === 'subscription' && (
              <span className='text-muted fs-6 fw-normal'>{'/MO'}</span>
            )}
          </span>
        </div>

        <div>
          <h5 className='text-dark fw-bold mb-3'>
            <span className='fs-3 text-primary fw-medium'></span>
            <span className='text-primary fw-semibold subsType'>
              {plan.prices?.[0]?.checkoutType === 'subscription'
                ? `One payment of $${plan.prices?.[0]?.amount.toFixed(0)}`
                : 'One time Purchase'}
            </span>
          </h5>
        </div>
        <div className='d-flex flex-column align-items-center justify-content-center'>
          <ul className='list-unstyled ms-sm-2 small w-100 w-md-75 feature-list'>
            {plan.description?.map((feature, index) => (
              <li key={feature + index} className='d-flex align-items-start column-gap-2 mb-2 text-start fw-normal'>
                <IoIosStar color='#FFAD00' size={20} className='custom-star-size' />{' '}
                {feature.replace(/\\n/g, '').trim()}
              </li>
            ))}
          </ul>
        </div>
        <Button
          disabled={isCurrent && plan.planType === PlanType.RECURRING}
          variant={'outline-primary'}
          className={`mt-auto btn rounded-2 fw-medium w-100`}
          onClick={() => {
            if (isCurrent && plan.planType === PlanType.RECURRING) {
              return;
            }
            onSwitch(plan?.prices?.[0]?.priceId || '', plan.name || '');
          }}
        >
          {buttonText}
        </Button>
      </Card.Body>
    </Card>
  );
};
