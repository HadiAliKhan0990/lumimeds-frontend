'use client';

import { Offcanvas, OffcanvasProps } from 'react-bootstrap';
import { RefillSurveyRequest } from '@/store/slices/refillsApiSlice';
import { ResponseList } from '@/components/Dashboard/orders/RefillResponses';
import { formatUSPhoneWithoutPlusOne } from '@/lib/helper';
import { formatUSDateTime } from '@/helpers/dateFormatter';

export interface RefillPopupProps extends OffcanvasProps {
  refill: RefillSurveyRequest | null;
}

export function RefillPopup({ refill, ...props }: Readonly<RefillPopupProps>) {
  if (!refill) return null;

  return (
    <Offcanvas {...props} className='ordersPopup' scroll placement='end'>
      <Offcanvas.Header closeButton className='align-items-start' />
      <Offcanvas.Body className='d-flex flex-column gap-4 pt-0'>
        {/* Header with patient info */}
        <div className='d-flex align-items-center gap-3'>
          <div className='chat-header-name text-dark text-decoration-none d-flex align-items-center gap-2 text-capitalize text-xl fw-medium'>
            <span className='fw-medium'>{`${refill.patient?.firstName} ${refill.patient?.lastName}`}</span>
          </div>
        </div>

        {/* Refill Details */}
        <div className='col-12 d-flex flex-column gap-3 overflow-auto d-block'>
          {/* General Information */}
          <div className='tw-border tw-border-neutral-200 rounded-3 p-3'>
            <h6 className='fw-medium mb-3'>General Information</h6>
            <div className='row g-3'>
              <div className='col-6'>
                <div className='form-label text-muted text-xs'>Status</div>
                <div>
                  {refill.status ? (
                    <span className={`custom-badge custom-badge-${refill.status.toLowerCase()} text-capitalize`}>
                      {refill.status.replace('_', ' ')}
                    </span>
                  ) : (
                    '-'
                  )}
                </div>
              </div>
              <div className='col-6'>
                <div className='form-label text-muted text-xs'>Created At</div>
                <p className='mb-0'>{formatUSDateTime(refill.createdAt)}</p>
              </div>
              <div className='col-6'>
                <div className='form-label text-muted text-xs'>Updated At</div>
                <p className='mb-0'>{formatUSDateTime(refill.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Patient Information */}
          <div className='tw-border tw-border-neutral-200 rounded-3 p-3'>
            <h6 className='fw-medium mb-3'>Patient Information</h6>
            <div className='row g-3'>
              <div className='col-6'>
                <div className='form-label text-muted text-xs'>Name</div>
                <p className='mb-0 fw-medium text-capitalize'>
                  {`${refill.patient?.firstName} ${refill.patient?.lastName}`}
                </p>
              </div>
              <div className='col-6'>
                <div className='form-label text-muted text-xs'>Email</div>
                <p className='mb-0'>{refill.patient?.email}</p>
              </div>
              <div className='col-6'>
                <div className='form-label text-muted text-xs'>Phone</div>
                <p className='mb-0'>{formatUSPhoneWithoutPlusOne(refill.patient?.phoneNumber)}</p>
              </div>
            </div>
          </div>

          {/* Order Information */}
          <div className='tw-border tw-border-neutral-200 rounded-3 p-3'>
            <h6 className='fw-medium mb-3'>Order Information</h6>
            <div className='row g-3'>
              <div className='col-12'>
                <div className='form-label text-muted text-xs'>Product Name</div>
                <p className='mb-0'>{refill.order?.productName}</p>
              </div>
            </div>
          </div>

          {/* Remarks */}
          {refill.remarks && (
            <div className='tw-border tw-border-neutral-200 rounded-3 p-3'>
              <h6 className='fw-medium mb-3'>Remarks</h6>
              <div className='tw-bg-white tw-p-3 tw-rounded tw-border tw-border-gray-200'>
                <p className='mb-0 tw-text-sm tw-whitespace-pre-wrap'>{refill.remarks}</p>
              </div>
            </div>
          )}

          {refill.formattedResponses && refill.formattedResponses.length > 0 && (
            <div className='tw-border tw-border-neutral-200 rounded-3 p-3'>
              <h6 className='fw-medium mb-3'>Refill Request Responses</h6>
              <ResponseList responses={refill.formattedResponses} variant='admin' />
            </div>
          )}
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
}
