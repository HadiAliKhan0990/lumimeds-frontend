'use client';
import { ActiveSubscriptionType } from '@/store/slices/patientAtiveSubscriptionSlice';


interface Props {
  subscription: ActiveSubscriptionType;
}

export function SubscriptionAlert({ subscription }: Readonly<Props>) {
  if (!subscription?.status || subscription.status === 'active') return null;

  const getAlertMessage = () => {
    if (!subscription?.status) return null;

    switch (subscription.status) {
      case 'canceled':
        return {
          title: 'Subscription Canceled',
          message: 'Your subscription has been canceled',
        };
      case 'paused':
        return {
          title: 'Subscription Paused',
          message: 'Your subscription is currently paused',
        };
      case 'past_due':
        return {
          title: 'Payment Required',
          message: 'Your subscription is past due. Please update your payment method',
        };
      case 'pause_scheduled':
        return {
          title: 'Pause Scheduled',
          message: pauseSheduleDescription(subscription.renewsAt, subscription.resumesAt ?? ''),
        };
      case 'cancel_scheduled':
        return {
          title: 'Cancel Scheduled',
          message: formatDateMessage('Your subscription will be cancelled', subscription.renewsAt),
        };
      case 'update_scheduled':
        return {
          title: 'Update Scheduled',
          message: formatDateMessage(
            'Your subscription plan will be updated',
            subscription.renewsAt,
            subscription.upcomingPlanName
          ),
        };
      case 'renewal_in_progress':
        return {
          title: 'Renewal in Progress',
          message: 'Your subscription is in renewal process. It may take a while. Thanks for your patience',
        };
      default:
        return null;
    }
  };

  const alertInfo = getAlertMessage();
  if (!alertInfo) return null;

  return (
    <div className='tw-w-full tw-bg-neutral-900 tw-text-white tw-border tw-border-white/20 tw-rounded tw-p-4'>
      <div className='tw-flex tw-flex-col tw-gap-1'>
        <h4 className='tw-text-base md:tw-text-lg tw-font-semibold tw-leading-tight tw-m-0'>{alertInfo.title}</h4>
        <p className='tw-m-0 tw-text-white/70 tw-text-sm md:tw-text-base'>{alertInfo.message}</p>
      </div>
    </div>
  );
}

const formatDateMessage = (prefix: string, date?: string | null, planName?: string | null) => {
  const formatedDate = date
    ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : '';
  return `${prefix} ${planName ? ` to ${planName}` : ''} on ${formatedDate}`;
};


const pauseSheduleDescription = (renewsAt: string, resumesAt: string) => {
  if (!resumesAt) return formatDateMessage('Your subscription will be paused for one month', renewsAt);

  return `Your subscription is scheduled to pause on ${new Date(renewsAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}, and will automatically resume on ${new Date(resumesAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`;
};