'use client';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import {
  setSubscriptionModalOpenType,
  setSelectedPatientActiveSubscription,
  setPatientSubscriptionLoading,
} from '@/store/slices/patientSubscriptionSlice';
import {
  cancellationReasonSchema,
  CancellationReasonSchema,
  CANCELLATION_REASONS,
} from '@/lib/schema/cancellationReason';
import { Form, Button, Spinner } from 'react-bootstrap';
import StarRatings from 'react-star-ratings';
import Modal from '@/components/elements/Modal';
import { useCancelSubscriptionMutation, subscriptionsApi, useGetActiveSubscriptionQuery } from '@/store/slices/subscriptionsApiSlice';
import { Error } from '@/lib/types';
import { isAxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export const CancellationReasonModal = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const patientSubscription = useSelector((state: RootState) => state.patientSubscription);
  const { subscriptionModalOpenType, selectedPatientActiveSubscription, isLoading } = patientSubscription || {};
  const { subscriptionId } = selectedPatientActiveSubscription || {};
  
  const isOpen = subscriptionModalOpenType === 'cancellation-reason';

  const [cancelSubscription] = useCancelSubscriptionMutation();
  const { refetch: refetchActiveSubscription } = useGetActiveSubscriptionQuery();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CancellationReasonSchema>({
    resolver: yupResolver(cancellationReasonSchema),
    defaultValues: {
      reasons: [],
      reason: '',
      productExperienceRating: 0,
      additionalComments: '',
    },
  });

  const selectedReasons = watch('reasons') || [];
  const showAdditionalComments = selectedReasons.includes('Other');

  const handleClose = () => {
    // Reset form to clear all data
    reset({
      reasons: [],
      reason: '',
      productExperienceRating: 0,
      additionalComments: '',
    });
    
    dispatch(setSubscriptionModalOpenType(undefined));
    dispatch(setSelectedPatientActiveSubscription(undefined));
  };

  const onSubmit = async (data: CancellationReasonSchema) => {
    try {
      dispatch(setPatientSubscriptionLoading(true));

      // Prepare cancellation reason - if "Other" is selected, use the custom reason
      let cancellationReason = '';
      if (data.reasons.includes('Other') && data.reason) {
        // If "Other" is selected, use the custom reason
        const otherReasons = data.reasons.filter(reason => reason !== 'Other');
        cancellationReason = [...otherReasons, data.reason].join(', ');
      } else {
        // Use selected reasons as is
        cancellationReason = data.reasons.join(', ');
      }

      // Call the cancellation API with the new fields
      const { success, message } = await cancelSubscription({ 
        subscriptionId: subscriptionId || '',
        rating: data.productExperienceRating,
        cancellationReason: cancellationReason
      }).unwrap();

      if (success) {
        toast.success(message || 'Subscription canceled successfully');
        
        // Reset form to clear all data
        reset({
          reasons: [],
          reason: '',
          productExperienceRating: 0,
          additionalComments: '',
        });
        
        // Close modal first
        handleClose();
        
        // Force refetch the latest subscription data
        try {
          await refetchActiveSubscription();
        } catch (error) {
          console.error('Failed to refetch subscription data:', error);
        }
        
        // Invalidate cache to ensure fresh data
        dispatch(subscriptionsApi.util.invalidateTags(['ActiveSubscription']));
        
        // Use router.refresh() for a softer refresh
        router.refresh();
      } else {
        toast.error(message || 'Failed to cancel subscription.');
      }
    } catch (err) {
      toast.error(
        isAxiosError(err)
          ? err.response?.data.message
          : (err as Error).data.message || 'Failed to cancel subscription.'
      );
    } finally {
      dispatch(setPatientSubscriptionLoading(false));
    }
  };

  return (
    <Modal
      size='xl'
      title='Cancel Subscription'
      isOpen={isOpen}
      onClose={handleClose}
      footer={
        <>
          <Button variant='outline-dark' onClick={handleClose} className='flex-fill' disabled={isLoading}>
            Keep Subscription
          </Button>
          <Button
            type='button'
            variant='dark'
            className='flex-fill d-flex align-items-center justify-content-center gap-2'
            disabled={isLoading}
            onClick={handleSubmit(onSubmit)}
          >
            {isLoading && <Spinner size='sm' />}
            Cancel Subscription
          </Button>
        </>
      }
    >
      <div className='d-flex flex-column gap-4'>
        <Form onSubmit={handleSubmit(onSubmit)} className='d-flex flex-column gap-4'>
          {/* <div>
            <label className='form-label fw-bold mb-2' htmlFor='reason-textarea'>
              Reason <span className='text-danger'>*</span>
            </label>
            <Form.Control
              as='textarea'
              rows={3}
              placeholder='Please provide your reason for cancellation...'
              {...register('reason')}
              className='shadow-none'
            />
            {errors.reason && <div className='text-danger small mt-1'>{errors.reason.message}</div>}
          </div> */}

          <div>
            <label className='form-label fw-bold mb-2'>
              Product Experience <span className='text-danger'>*</span>
            </label>
            <div className='mb-2'>
              <StarRatings
                rating={watch('productExperienceRating') || 0}
                changeRating={(rating: number) => {
                  setValue('productExperienceRating', rating);
                }}
                numberOfStars={5}
                starDimension='25px'
                starSpacing='3px'
                starRatedColor='#ffc107'
                starEmptyColor='#6c757d'
              />
              {watch('productExperienceRating') > 0 && (
                <span className='ms-2 text-muted small'>{watch('productExperienceRating')} out of 5</span>
              )}
            </div>
            {errors.productExperienceRating && (
              <div className='text-danger small mt-1'>{errors.productExperienceRating.message}</div>
            )}
          </div>

          <div>
            <label className='form-label fw-bold mb-3'>
              Reason for cancellation <span className='text-danger'>*</span>
            </label>
            <div className='d-flex flex-column gap-2'>
              {CANCELLATION_REASONS.map((reason) => (
                <Form.Check
                  key={reason}
                  type='checkbox'
                  id={`reason-${reason}`}
                  value={reason}
                  label={reason}
                  {...register('reasons')}
                  className='form-check-input-custom'
                />
              ))}
            </div>
            {errors.reasons && <div className='text-danger small mt-1'>{errors.reasons.message}</div>}
          </div>

          {showAdditionalComments && (
            <div>
              <label className='form-label fw-bold mb-2'>Reason <span className='text-danger'>*</span></label>
              <Form.Control
                as='textarea'
                rows={3}
                placeholder='Please provide your reason for cancellation...'
                {...register('reason')}
                className='shadow-none'
              />
              {errors.reason && (
                <div className='text-danger small mt-1'>{errors.reason.message}</div>
              )}
            </div>
          )}
        </Form>
      </div>
    </Modal>
  );
};
