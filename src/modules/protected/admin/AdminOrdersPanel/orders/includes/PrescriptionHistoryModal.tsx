'use client';

import { Modal } from '@/components/elements';
import { useGetPrescriptionHistoryQuery } from '@/store/slices/pharmaciesApiSlice';
import { format } from 'date-fns';

interface PrescriptionHistoryModalProps {
  show: boolean;
  onHide: () => void;
  orderId: string;
}

export const PrescriptionHistoryModal = ({ show, onHide, orderId }: PrescriptionHistoryModalProps) => {
  const {
    data: history,
    isLoading,
    isError,
  } = useGetPrescriptionHistoryQuery(orderId, {
    skip: !show || !orderId,
  });

  return (
    <Modal
      isOpen={show}
      onClose={onHide}
      title='Prescription History'
      size='lg'
      bodyClassName='tw-pb-4'
      headerClassName='!tw-text-left'
      isLoading={isLoading}
      loadingText='Loading prescription history...'
    >
      {isError && <div className='alert alert-danger'>Failed to load prescription history. Please try again.</div>}

      {!isLoading && !isError && history && history.length === 0 && (
        <div className='text-center py-5 text-muted'>No prescription history found for this order.</div>
      )}

      {!isLoading && !isError && history && history.length > 0 && (
        <div className='table-responsive'>
          <table className='table table-hover'>
            <thead>
              <tr>
                <th>Prescription ID</th>
                <th>Status</th>
                <th>Tracking Number</th>
                <th>Carrier</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id}>
                  <td>
                    <code className='text-primary'>{item.prescriptionId || 'N/A'}</code>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        item.status === 'shipped'
                          ? 'bg-success'
                          : item.status === 'processing'
                          ? 'bg-warning'
                          : item.status === 'delivered'
                          ? 'bg-info'
                          : 'bg-secondary'
                      }`}
                    >
                      {item.status}
                    </span>
                    {!item.webhookReceived && <small className='text-muted ms-2'>(No webhook)</small>}
                  </td>
                  <td>
                    {item.trackingNumber ? (
                      <code>{item.trackingNumber}</code>
                    ) : (
                      <span className='text-muted'>Not available</span>
                    )}
                  </td>
                  <td>{item.carrier || <span className='text-muted'>N/A</span>}</td>
                  <td>
                    <small>{format(new Date(item.createdAt), 'MMM dd, yyyy HH:mm')}</small>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
};
