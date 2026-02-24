'use client';

import React, { useMemo } from 'react';
import { Blur } from 'transitions-kit';
import { AsyncImage } from 'loadable-image';
import { Card, Row, Col, Button } from 'react-bootstrap';
import { SubscriptionAlert } from '@/components/Dashboard/patient/subscriptions/includes/SubscriptionPlans/includes/SubscriptionAlert';
import { FaRegPauseCircle, FaRegPlayCircle } from 'react-icons/fa';
import { AiOutlineClose } from 'react-icons/ai';
import { pluralizeMonthInProductName } from '@/lib/helper';
import { PlanType } from '@/types/medications';
import { ActiveSubscriptionType } from '@/store/slices/patientAtiveSubscriptionSlice';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import {
  setSelectedPatientActiveSubscription,
  setSubscriptionModalOpenType,
} from '@/store/slices/patientSubscriptionSlice';
import AsyncImgLoader from '@/components/AsyncImgLoader';
import { formatCustom } from '@/helpers/dateFormatter';
import '@/styles/subscriptionStyles.scss';

interface Props {
  subscription: ActiveSubscriptionType;
  banner?: React.ReactNode;
}

export default function ActiveSubscription({ subscription, banner }: Readonly<Props>) {
  const dispatch = useDispatch<AppDispatch>();

  const patientSubscription = useSelector((state: RootState) => state.patientSubscription);
  const { isLoading } = patientSubscription || {};

  const isOneTime = subscription.subscriptionType === PlanType.ONE_TIME;

  const handlePause = () => {
    dispatch(setSelectedPatientActiveSubscription(subscription));
    dispatch(setSubscriptionModalOpenType('pause'));
  };

  const handleCancel = () => {
    dispatch(setSelectedPatientActiveSubscription(subscription));
    dispatch(setSubscriptionModalOpenType('cancellation-reason'));
  };

  const handleResume = () => {
    dispatch(setSelectedPatientActiveSubscription(subscription));
    dispatch(setSubscriptionModalOpenType('resume'));
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    return formatCustom(dateString, 'MMMM d, yyyy') || '-';
  };

  const isSubPaused = subscription?.status === 'pause_scheduled';
  const isSubCanceled = subscription?.status === 'cancel_scheduled';
  const pausedSub = subscription?.status === 'paused';

  const isResumeAvailable = useMemo(() => {
    return subscription?.status === 'pause_scheduled' || subscription?.status === 'paused';
  }, [subscription]);

  const isPauseDisabled = useMemo(() => {
    if (
      isSubPaused ||
      subscription?.status === 'pause_scheduled' ||
      subscription?.status === 'cancel_scheduled' ||
      subscription?.status === 'past_due' ||
      subscription?.status === 'renewal_in_progress' ||
      subscription?.status === 'update_scheduled' ||
      isLoading
    ) {
      return true;
    }
    return false;
  }, [isSubPaused, subscription, isLoading]);

  return (
    <Card className='subscription-card gap-4'>
      <div className='p-4 d-flex flex-column flex-lg-row align-items-center gap-5'>
        <div className='product-image-container d-flex justify-content-center align-items-center w-100 rounded-12 p-3'>
          <AsyncImage
            src={subscription?.productImage || ''}
            Transition={Blur}
            loader={<AsyncImgLoader />}
            alt={subscription.productName ?? ''}
            className='w-100 h-100 async-image-contain'
          />
        </div>
        <div className='flex-grow-1 ms-lg-2 mt-4 mt-lg-0'>
          <h3 className='text-4xl fw-normal mb-4 d-flex align-items-center text-center text-md-start'>
            {pluralizeMonthInProductName(subscription?.productName || '')}
          </h3>
          {/* Desktop/original layout */}
          <div className='d-none d-md-block'>
            <Row className='fs-6 fw-medium mb-4 gy-3'>
              <div className='d-flex col-md-6'>
                <span className='fw-bold label-width'>Start Date</span>
                <span className='ms-4'>{formatDate(subscription?.createdAt)}</span>
              </div>
              {subscription?.subscriptionType !== PlanType.ONE_TIME && !isSubPaused && (
                <div className='d-flex col-md-6'>
                  <span className='fw-bold label-width'>End Date</span>
                  <span className='ms-4'>{isOneTime || isSubPaused ? '-' : formatDate(subscription?.renewsAt)}</span>
                </div>
              )}

              {subscription?.subscriptionType !== PlanType.ONE_TIME && !isSubPaused && !isSubCanceled && (
                <div className='d-flex col-md-6'>
                  <span className='fw-bold label-width'>Renewal Date</span>
                  <span className='ms-4'>
                    {['past_due', 'paused', 'pause_scheduled', 'cancel_scheduled', 'renewal_in_progress'].includes(
                      subscription?.status || ''
                    )
                      ? '-'
                      : isOneTime
                        ? '-'
                        : formatDate(subscription?.renewsAt || '')}
                  </span>
                </div>
              )}
              {subscription?.subscriptionType !== PlanType.ONE_TIME && (
                <div className='d-flex col-md-6'>
                  <span className='fw-bold label-width'>Billing Interval</span>
                  <span className='ms-4'>
                    {isOneTime
                      ? '-'
                      : subscription?.metadata?.intervalCount
                        ? `${subscription.metadata?.intervalCount} Month${Number(subscription.metadata?.intervalCount) > 1 ? '(s)' : ''
                        }`
                        : '-'}
                  </span>
                </div>
              )}
              {pausedSub && (
                <div className='d-flex col-md-6'>
                  <span className='fw-bold label-width'>Resume Date</span>
                  <span className='ms-4'>{formatDate(subscription?.resumesAt || '')}</span>
                </div>
              )}
              <div className='d-flex col-md-6'>
                <span className='fw-bold label-width'>Status</span>
                <span className='ms-4'>
                  {subscription?.status
                    ? subscription.status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
                    : ''}
                </span>
              </div>
              {/* might need it for future don't remove */}
              {/* {activeSubscription?.status && (
                    <Col>
                      {['past_due', 'paused', 'pause_scheduled', 'cancel_scheduled', 'renewal_in_progress'].includes(
                        activeSubscription?.status || ''
                      ) ? (
                        ''
                      ) : (
                        <p className='text-white mt-2'>
                          Auto-renewal is ON. You will be charged{' '}
                          {matchedPrice?.amount && matchedPrice?.billingIntervalCount
                            ? `$${(matchedPrice.amount / matchedPrice.billingIntervalCount).toFixed(2)}`
                            : '-'}{' '}
                          on {fullFormatDate(activeSubscription?.renewsAt || '')}.
                        </p>
                      )}
                    </Col>
                  )} */}
            </Row>
          </div>
          {/* Mobile/table-like block layout */}
          <div className='d-block d-md-none'>
            <Row className='fs-6 fw-medium mb-4 g-0'>
              <Col xs={12} className='border-bottom p-3'>
                <div className='fw-bold text-secondary small'>Start Date</div>
                <div className='pt-1 text-white'>
                  {subscription?.createdAt ? formatDate(subscription?.createdAt) : '-'}
                </div>
              </Col>
              {subscription?.subscriptionType !== PlanType.ONE_TIME && !isSubPaused && (
                <Col xs={12} className='border-bottom p-3'>
                  <div className='fw-bold text-secondary small'>End Date</div>
                  <div className='pt-1 text-white'>{isOneTime ? '-' : formatDate(subscription?.renewsAt)}</div>
                </Col>
              )}

              {subscription?.subscriptionType !== PlanType.ONE_TIME && !isSubPaused && !isSubCanceled && (
                <Col xs={12} className='border-bottom p-3'>
                  <div className='fw-bold text-secondary small'>Renewal Date</div>
                  <div className='pt-1 text-white'>
                    {['past_due', 'paused', 'pause_scheduled', 'cancel_scheduled', 'renewal_in_progress'].includes(
                      subscription?.status || ''
                    ) || isOneTime
                      ? '-'
                      : formatDate(subscription?.renewsAt || '')}
                  </div>
                </Col>
              )}

              {!isOneTime && (
                <Col xs={12} className='border-bottom p-3'>
                  <div className='fw-bold text-secondary small'>Billing Interval</div>
                  <div className='pt-1 text-white'>
                    {isOneTime
                      ? '-'
                      : subscription?.metadata?.intervalCount
                        ? `${subscription.metadata?.intervalCount} Month${Number(subscription.metadata?.intervalCount) > 1 ? 's' : ''
                        }`
                        : '-'}
                  </div>
                </Col>
              )}
              {pausedSub && (
                <Col xs={12} className='border-bottom p-3'>
                  <div className='fw-bold text-secondary small'>Resume Date</div>
                  <div className='pt-1 text-white'>{formatDate(subscription?.resumesAt || '')}</div>
                </Col>
              )}
              <Col xs={12} className='p-3'>
                <div className='fw-bold text-secondary small'>Status</div>
                <div className='pt-1 text-white'>
                  {subscription?.status
                    ? subscription.status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
                    : ''}
                </div>
              </Col>
              {/* might need it for future don't remove */}
              {/* {activeSubscription?.status && (
                    <Col>
                      {['past_due', 'paused', 'pause_scheduled', 'cancel_scheduled', 'renewal_in_progress'].includes(
                        subscription?.status || ''
                      ) ? (
                        ''
                      ) : (
                        <p className='text-white mt-2'>
                          Auto-renewal is ON. You will be charged{' '}
                          {matchedPrice?.amount && matchedPrice?.billingIntervalCount
                            ? `$${(matchedPrice.amount / matchedPrice.billingIntervalCount).toFixed(2)}`
                            : '-'}{' '}
                          on {fullFormatDate(subscription?.renewsAt || '')}.
                        </p>
                      )}
                    </Col>
                  )} */}
            </Row>
          </div>
          {/* Alerts block aligned to ActiveSubscription styling */}
          <div className='mb-4'>
            <SubscriptionAlert subscription={subscription} />
          </div>
          {subscription.subscriptionType === PlanType.RECURRING && (
            <Row className='justify-content-center mt-0'>
              <Col xs={12} md={6} className='mb-3 mb-md-0'>
                {isResumeAvailable ? (
                  <Button
                    variant='primary'
                    className='d-flex align-items-center justify-content-center gap-2 w-100 rounded-1 fs-5 fw-normal py-1'
                    onClick={handleResume}
                  >
                    <FaRegPlayCircle /> Resume
                  </Button>
                ) : (
                  <Button
                    variant='primary'
                    className='d-flex align-items-center justify-content-center gap-2 w-100 rounded-1 fs-5 fw-normal py-1'
                    onClick={handlePause}
                    disabled={isPauseDisabled}
                  >
                    <FaRegPauseCircle /> Delay Renewal
                  </Button>
                )}
              </Col>
              <Col xs={12} md={6} className='mb-3 mb-md-0'>
                <Button
                  variant='primary'
                  className='d-flex align-items-center justify-content-center gap-2 w-100 rounded-1 fs-5 fw-normal py-1'
                  onClick={handleCancel}
                >
                  <AiOutlineClose /> Cancel
                </Button>
              </Col>
            </Row>
          )}
        </div>
      </div>
      {banner && <div className='px-4'>{banner}</div>}
    </Card>
  );
}
