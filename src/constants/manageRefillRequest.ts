import { FiCheck, FiX, FiRefreshCw } from 'react-icons/fi';

export const actionOptions = [
  {
    id: 'status-approved',
    value: 'approved',
    label: 'Approve',
    description: 'Accept and process this refill request',
    Icon: FiCheck,
    colorClass: {
      border: 'border-success',
      bg: 'bg-success',
      iconBg: 'bg-success',
    },
  },
  {
    id: 'status-rejected',
    value: 'rejected',
    label: 'Reject',
    description: 'Decline this refill request',
    Icon: FiX,
    colorClass: {
      border: 'border-danger',
      bg: 'bg-danger',
      iconBg: 'bg-danger',
    },
  },
  {
    id: 'status-on_hold',
    value: 'on_hold',
    label: 'Submit Refill Request',
    description: 'Offer a price option',
    Icon: FiRefreshCw,
    colorClass: {
      border: 'border-primary',
      bg: 'bg-primary',
      iconBg: 'bg-primary',
    },
  },
];
