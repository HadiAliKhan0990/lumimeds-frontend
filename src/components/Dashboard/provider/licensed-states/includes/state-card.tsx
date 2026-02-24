import type { StateItem } from '@/store/slices/licensedStatesSlice';

type Props = StateItem & {
  onEdit?: (state: StateItem) => void;
};

export default function StateCard({ id, name, licenseNumber, expiration, onEdit }: Props) {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';

    if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
      return dateStr;
    }

    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const yyyy = date.getFullYear();
      return `${mm}-${dd}-${yyyy}`;
    }

    return dateStr;
  };

  const getStatusInfo = (expirationDate: string) => {
    if (!expirationDate) return { status: 'unknown', label: 'N/A', className: 'status-badge' };

    const today = new Date();

    let exp: Date;
    const mmddyyyyMatch = expirationDate.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (mmddyyyyMatch) {
      const month = parseInt(mmddyyyyMatch[1], 10) - 1;
      const day = parseInt(mmddyyyyMatch[2], 10);
      const year = parseInt(mmddyyyyMatch[3], 10);
      exp = new Date(year, month, day);
    } else {
      exp = new Date(expirationDate);
    }

    today.setHours(0, 0, 0, 0);
    exp.setHours(0, 0, 0, 0);

    const diffTime = exp.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        status: 'expired',
        label: 'Expired',
        className: 'rounded bg-danger text-white text-extra-small px-3 py-1',
      };
    }

    if (diffDays === 0) {
      return {
        status: 'expiring',
        label: 'Expires today',
        className: 'rounded bg-warning text-dark text-extra-small px-3 py-1',
      };
    }

    if (diffDays <= 90) {
      return {
        status: 'expiring',
        label: `Expires in ${diffDays} Day${diffDays !== 1 ? 's' : ''}`,
        className: 'rounded bg-warning text-dark text-extra-small px-3 py-1',
      };
    }

    return { status: 'active', label: 'Active', className: 'status-badge active' };
  };
  return (
    <div className='card shadow-sm rounded-3 h-100'>
      <div className='card-body'>
        <div className='d-flex justify-content-between align-items-start'>
          <p className='card-title mb-2 fw-semibold'>{name}</p>
          <button
            className='btn btn-link p-0 border-0 fw-md text-nowrap'
            onClick={() => onEdit?.({ id, name, licenseNumber, expiration })}
          >
            Edit
          </button>
        </div>
        <hr className='border border-1 opacity-85 my-1' />
        <div className='mb-2'>
          <p className='fw-semibold mb-0'>License Number</p>
          <div className='text-muted'>{licenseNumber}</div>
        </div>
        <div>
          <p className='fw-semibold mb-0'>Expiration Date</p>
          <div className='text-muted'>{expiration ? formatDate(expiration) : 'N/A'}</div>
          <p className='fw-semibold mb-0'>License Expiry Status</p>
          <span className={getStatusInfo(expiration).className}>{getStatusInfo(expiration).label}</span>
        </div>
      </div>
    </div>
  );
}
