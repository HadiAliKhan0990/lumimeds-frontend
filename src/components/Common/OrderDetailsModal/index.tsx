'use client';

import AsyncImgLoader from '@/components/AsyncImgLoader';
import { Modal } from '@/components/elements';
import { AsyncImage } from 'loadable-image';
import { Blur } from 'transitions-kit';
import { useDispatch, useSelector } from 'react-redux';
import { setModal } from '@/store/slices/modalSlice';
import { capitalizeFirst } from '@/lib/helper';
import { RootState } from '@/store';
import { setDosage } from '@/store/slices/updateOrderSlice';
import { ChangeEvent, useEffect, useState, useTransition, useRef } from 'react';
import { ROUTES } from '@/constants';
import { useRouter, usePathname } from 'next/navigation';
import { formatUSDate } from '@/helpers/dateFormatter';
import { setSelectedOrderId } from '@/store/slices/selectedOrderSlice';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { SingleOrder } from '@/lib/types';
import { getPatientSingleOrder } from '@/services/admin';
import { OrderDetailsModalSkeleton } from '@/components/Common/OrderDetailsModal/includes/OrderDetailsModalSkeleton';
import { Order } from '@/store/slices/orderSlice';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenOrderSidebar?: (order: Order) => void;
}

export function OrderDetailsModal({ isOpen, onClose, onOpenOrderSidebar }: Readonly<Props>) {
  const dispatch = useDispatch();
  const { push } = useRouter();
  const pathname = usePathname();

  const isRequestInProgress = useRef(false);

  const isAdminView = pathname?.startsWith('/admin');

  const [isPending, startTransition] = useTransition();

  const [orderData, setOrderData] = useState<SingleOrder | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const { selectedOrderId, orderData: selectedOrder } = useSelector((state: RootState) => state.selectedOrder);

  const {
    currentProductVariation,
    productVariations,
    pharmacy = '',
    pharmacyName = '',
    pharmacies = [],
    status,
    prescriptionInstructions = [],
    provider,
    agent,
  } = orderData?.order || {};
  const selected = productVariations?.find((item) => item.name === currentProductVariation);
  const displayedOrderId =
    orderData?.order?.uniqueOrderId ?? orderData?.order?.orderUniqueId ?? selectedOrder?.orderUniqueId ?? '-';

  // Extract prescription approval details
  const prescriptionInstruction = prescriptionInstructions?.[0];
  const medication = prescriptionInstruction?.medication;
  const dosage = prescriptionInstruction?.dosage;
  const route = prescriptionInstruction?.route;
  const staffNotes = prescriptionInstruction?.notesToStaff;
  const approvingProvider = provider ? `${provider.firstName} ${provider.lastName}`.trim() : null;

  function handleUpdatePharmacy(e: ChangeEvent<HTMLSelectElement>) {
    const pharmacyName = e.currentTarget.value;

    const pharmacy = pharmacies.find((p) => p.name === pharmacyName);

    startTransition(() => {
      push(
        `${ROUTES.ADMIN_PHARMACY_FORWARD_PRESCRIPTION}?pharmacyId=${encodeURIComponent(
          pharmacy?.id ?? ''
        )}&orderId=${encodeURIComponent(selectedOrderId ?? '')}`
      );

      handleClose();
    });
  }

  function handleClose() {
    dispatch(setModal({ modalType: undefined }));
    dispatch(setSelectedOrderId(''));
    setOrderData(undefined);
    setIsLoading(false);
  }

  useEffect(() => {
    if (!selectedOrderId) {
      setIsLoading(false);
      return;
    }

    let isCancelled = false;
    isRequestInProgress.current = true;
    setIsLoading(true);

    getPatientSingleOrder(selectedOrderId)
      .then((data) => {
        if (!isCancelled) {
          setOrderData(data);
          isRequestInProgress.current = false;
        }
      })
      .catch(() => {
        if (!isCancelled) {
          isRequestInProgress.current = false;
        }
      })
      .finally(() => {
        setIsLoading(false);
        isRequestInProgress.current = false;
      });

    return () => {
      isCancelled = true;
      setIsLoading(false);
      isRequestInProgress.current = false;
    };
  }, [selectedOrderId]);

  return (
    <Modal
      title='Order Summary'
      headerAction={
        isAdminView && !isLoading && selectedOrder ? (
          <button
            onClick={() => onOpenOrderSidebar?.(selectedOrder)}
            className='tw-px-3 tw-py-1.5 tw-mr-8 tw-text-sm tw-text-white tw-bg-primary hover:tw-bg-primary/90 tw-rounded tw-transition-all'
          >
            View Full Details
          </button>
        ) : undefined
      }
      headerClassName='!tw-text-left tw-flex tw-items-start'
      isOpen={isOpen}
      onClose={onClose}
    >
      {isLoading ? (
        <OrderDetailsModalSkeleton />
      ) : (
        <div className='tw-text-sm tw-pb-4'>
          {/* Medication Section */}
          <div className='tw-mb-3 tw-py-1 tw-flex tw-items-center tw-gap-3'>
            <div className='tw-w-1/4 sm:tw-w-1/6 md:tw-w-1/6 tw-py-2 tw-border tw-rounded-lg'>
              <AsyncImage
                src={selectedOrder?.image || ''}
                Transition={Blur}
                loader={<AsyncImgLoader />}
                alt={selectedOrder?.requestedProductName ?? ''}
                className='tw-w-full tw-h-[58px] tw-object-contain async-img'
              />
            </div>
            <div className='tw-w-3/4 sm:tw-w-5/6 md:tw-w-5/6 tw-flex tw-flex-col'>
              <span className='tw-text-gray-500 tw-mb-1'>Medication</span>
              <span>{orderData?.order.productName ?? '-'}</span>
            </div>
          </div>

          {/* Order Details Table */}
          {isAdminView && (
            <div className='tw-mb-2 tw-py-1 tw-grid tw-grid-cols-2 md:tw-grid-cols-12 tw-gap-2'>
              <div className='md:tw-col-span-5'>
                <span className='tw-text-gray-500'>Order ID</span>
              </div>
              <div className='md:tw-col-span-7'>
                <strong>{displayedOrderId}</strong>
              </div>
            </div>
          )}
          <div className='tw-mb-2 tw-py-1 tw-grid tw-grid-cols-2 md:tw-grid-cols-12 tw-gap-2'>
            <div className='md:tw-col-span-5'>
              <span className='tw-text-gray-500'>Date order placed</span>
            </div>
            <div className='md:tw-col-span-7'>
              <strong>{formatUSDate(orderData?.order?.dateOrdered ?? '') ?? '-'}</strong>
            </div>
          </div>
          <div className='tw-mb-2 tw-py-1 tw-grid tw-grid-cols-2 md:tw-grid-cols-12 tw-gap-2'>
            <div className='md:tw-col-span-5 tw-flex tw-items-center'>
              <span className='tw-text-gray-500'>Dosage</span>
            </div>
            <div className='md:tw-col-span-7'>
              {status === 'Pending' ? (
                <select
                  value={selected?.name}
                  onChange={(e) => {
                    dispatch(setDosage(e.target.value));
                    dispatch(setModal({ modalType: 'Dosage Confirmation' }));
                  }}
                  className='tw-w-full tw-px-3 tw-py-1.5 tw-text-sm tw-border tw-rounded tw-bg-white focus:tw-border-primary focus:tw-ring-1 focus:tw-ring-primary disabled:tw-opacity-50 disabled:tw-pointer-events-none'
                >
                  <option value='' disabled>
                    Select Dosage
                  </option>
                  {productVariations?.map((item) => (
                    <option value={item.name} key={item.id}>
                      {item.description}
                    </option>
                  ))}
                </select>
              ) : (
                selected?.description || '-'
              )}
            </div>
          </div>
          <div className='tw-mb-2 tw-py-1 tw-grid tw-grid-cols-2 md:tw-grid-cols-12 tw-gap-2'>
            <div className='md:tw-col-span-5 tw-flex tw-items-center'>
              <span className='tw-text-gray-500'>Pharmacy</span>
            </div>
            <div className='md:tw-col-span-7'>
              {status === 'Pending' || status === 'Drafted' ? (
                <select
                  value={pharmacy || pharmacyName || ''}
                  disabled={Boolean(pharmacyName) || isPending}
                  onChange={handleUpdatePharmacy}
                  className='tw-w-full tw-px-3 tw-py-1.5 tw-text-sm tw-border tw-rounded tw-bg-white focus:tw-border-primary focus:tw-ring-1 focus:tw-ring-primary disabled:tw-opacity-50 disabled:tw-pointer-events-none'
                >
                  <option value='' disabled>
                    Select Pharmacy
                  </option>
                  {pharmacies.map((pharmacy) => (
                    <option key={pharmacy.id} value={pharmacy.name || ''}>
                      {capitalizeFirst(pharmacy.name)}
                    </option>
                  ))}
                </select>
              ) : (
                pharmacy || pharmacyName || '-'
              )}
            </div>
          </div>
          <div className='tw-mb-2 tw-py-1 tw-grid tw-grid-cols-2 md:tw-grid-cols-12 tw-gap-2'>
            <div className='md:tw-col-span-5'>
              <span className='tw-text-gray-500'>Status</span>
            </div>
            <div className='md:tw-col-span-7'>
              <span>{orderData?.order.status ? orderData?.order.status.replaceAll('_', ' ') : '-'}</span>
            </div>
          </div>
          <div className='tw-mb-2 tw-py-1 tw-grid tw-grid-cols-2 md:tw-grid-cols-12 tw-gap-2'>
            <div className='md:tw-col-span-5'>
              <span className='tw-text-gray-500'>Tracking</span>
            </div>
            <div className='md:tw-col-span-7'>
              <span>{orderData?.order?.trackingNumber ?? '-'}</span>
            </div>
          </div>
          <div className='tw-mb-2 tw-py-1 tw-grid tw-grid-cols-2 md:tw-grid-cols-12 tw-gap-2'>
            <div className='md:tw-col-span-5'>
              <span className='tw-text-gray-500'>Date Received</span>
            </div>
            <div className='md:tw-col-span-7'>
              <span>
                {orderData?.order?.dateReceived
                  ? new Date(orderData?.order?.dateReceived).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : '-'}
              </span>
            </div>
          </div>
          <div className='tw-mb-2 tw-py-1 tw-grid tw-grid-cols-2 md:tw-grid-cols-12 tw-gap-2'>
            <div className='md:tw-col-span-5'>
              <span className='tw-text-gray-500'>Next Refillment Date</span>
            </div>
            <div className='md:tw-col-span-7'>
              <span>
                {orderData?.order?.nextRefillDate
                  ? new Date(orderData?.order?.nextRefillDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : '-'}
              </span>
            </div>
          </div>
          <div className='tw-py-1 tw-grid tw-grid-cols-2 md:tw-grid-cols-12 tw-gap-2'>
            <div className='md:tw-col-span-5'>
              <span className='tw-text-gray-500'>Patient Remarks</span>
            </div>
            <div className='md:tw-col-span-7'>
              {orderData?.order?.patientRemarks ? (
                <OverlayTrigger
                  placement='top'
                  overlay={<Tooltip id='patient-remarks-tooltip'>{orderData?.order?.patientRemarks}</Tooltip>}
                >
                  <span className='tw-cursor-help tw-line-clamp-2'>{orderData?.order?.patientRemarks}</span>
                </OverlayTrigger>
              ) : (
                '-'
              )}
            </div>
          </div>

          {/* Prescription Approval Details Section */}
          <div className='tw-my-4 tw-py-4 tw-border-y'>
            <p className='tw-font-semibold'>Prescription Approval Details</p>
            <div className='tw-space-y-4'>
              <div className='tw-flex tw-flex-col sm:tw-flex-row tw-gap-2'>
                <div className='tw-w-full sm:tw-w-5/12 md:tw-w-5/12'>
                  <span className='tw-text-gray-500'>Approved Medication</span>
                </div>
                <div className='tw-w-full sm:tw-w-7/12 md:tw-w-7/12'>
                  <span className='tw-capitalize'>{medication || '-'}</span>
                </div>
              </div>
              <div className='tw-flex tw-flex-col sm:tw-flex-row tw-gap-2'>
                <div className='tw-w-full sm:tw-w-5/12 md:tw-w-5/12'>
                  <span className='tw-text-gray-500'>Route</span>
                </div>
                <div className='tw-w-full sm:tw-w-7/12 md:tw-w-7/12'>
                  {route ? (
                    <OverlayTrigger placement='top' overlay={<Tooltip id='route-tooltip'>{route}</Tooltip>}>
                      <span className='tw-cursor-help tw-line-clamp-2'>{route}</span>
                    </OverlayTrigger>
                  ) : (
                    <span>-</span>
                  )}
                </div>
              </div>
              <div className='tw-flex tw-flex-col sm:tw-flex-row tw-gap-2'>
                <div className='tw-w-full sm:tw-w-5/12 md:tw-w-5/12'>
                  <span className='tw-text-gray-500'>Approved Dosage</span>
                </div>
                <div className='tw-w-full sm:tw-w-7/12 md:tw-w-7/12'>
                  <strong>{dosage ? `${dosage}mg weekly` : '-'}</strong>
                </div>
              </div>
              <div className='tw-flex tw-flex-col sm:tw-flex-row tw-gap-2'>
                <div className='tw-w-full sm:tw-w-5/12 md:tw-w-5/12'>
                  <span className='tw-text-gray-500'>Staff Notes</span>
                </div>
                <div className='tw-w-full sm:tw-w-7/12 md:tw-w-7/12'>
                  {staffNotes ? (
                    <OverlayTrigger placement='top' overlay={<Tooltip id='staff-notes-tooltip'>{staffNotes}</Tooltip>}>
                      <span className='tw-cursor-help tw-line-clamp-2'>{staffNotes}</span>
                    </OverlayTrigger>
                  ) : (
                    '-'
                  )}
                </div>
              </div>
              <div className='tw-flex tw-flex-col sm:tw-flex-row tw-gap-2'>
                <div className='tw-w-full sm:tw-w-5/12 md:tw-w-5/12'>
                  <span className='tw-text-gray-500'>Agent</span>
                </div>
                <div className='tw-w-full sm:tw-w-7/12 md:tw-w-7/12'>
                  <span className='tw-capitalize'>{agent?.name || '-'}</span>
                </div>
              </div>
              <div className='tw-flex tw-flex-col sm:tw-flex-row tw-gap-2'>
                <div className='tw-w-full sm:tw-w-5/12 md:tw-w-5/12'>
                  <span className='tw-text-gray-500'>Provider</span>
                </div>
                <div className='tw-w-full sm:tw-w-7/12 md:tw-w-7/12'>
                  <span className='tw-capitalize'>{approvingProvider || '-'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cost Section */}
          <div className='tw-mb-3 tw-py-1'>
            <div className='tw-flex tw-justify-between tw-items-center'>
              <strong>Cost</strong>
              <strong>Qty</strong>
              <strong>Total</strong>
            </div>
          </div>
          <div className='tw-mb-3 tw-border-b tw-pb-3'>
            <div className='tw-flex tw-justify-between tw-items-center'>
              <span>{orderData?.order?.orderTotal ? `$${orderData?.order?.orderTotal}` : '-'}</span>
              <span>{orderData?.order.quantity ?? '-'}</span>
              <span>
                {orderData?.order?.orderTotal
                  ? `$${(Number(orderData.order.orderTotal) - Number(orderData.order.couponsAmount || 0)).toFixed(2)}`
                  : '-'}
              </span>
            </div>
          </div>

          {/* Order Summary */}
          <div className='tw-mb-3 tw-pb-1 tw-grid tw-grid-cols-2 md:tw-grid-cols-12 tw-gap-2'>
            <div className='md:tw-col-span-5'>
              <span className='tw-text-gray-500'>Items Subtotal</span>
            </div>
            <div className='md:tw-col-span-7'>
              <strong>{orderData?.order.orderTotal ? `$${orderData?.order?.orderTotal}` : '-'}</strong>
            </div>
          </div>
          <div className='tw-mb-3 tw-pb-1 tw-grid tw-grid-cols-2 md:tw-grid-cols-12 tw-gap-2'>
            <div className='md:tw-col-span-5'>
              <span className='tw-text-gray-500'>Coupon(s)</span>
            </div>
            <div
              className={`md:tw-col-span-7 ${
                Number(orderData?.order.couponsAmount || 0) !== 0 ? 'coupon-adjustment' : ''
              }`}
            >
              <strong>
                {orderData?.order.couponsAmount
                  ? Number(orderData.order.couponsAmount) === 0
                    ? '-'
                    : `-$${orderData.order.couponsAmount}`
                  : '-'}
              </strong>
            </div>
          </div>
          <div className='tw-mb-3 tw-border-b tw-pb-3 tw-grid tw-grid-cols-2 md:tw-grid-cols-12 tw-gap-2'>
            <div className='md:tw-col-span-5'>
              <span className='tw-text-gray-500'>Order Total</span>
            </div>
            <div className='md:tw-col-span-7'>
              <strong>
                {orderData?.order?.orderTotal
                  ? `$${(Number(orderData.order.orderTotal) - Number(orderData.order.couponsAmount || 0)).toFixed(2)}`
                  : '-'}
              </strong>
            </div>
          </div>
          <div className='tw-mb-3 tw-pb-1 tw-grid tw-grid-cols-2 md:tw-grid-cols-12 tw-gap-2'>
            <div className='md:tw-col-span-5'>
              <span className='tw-text-gray-500'>Paid</span>
            </div>
            <div className='md:tw-col-span-7'>
              <strong>
                {orderData?.order?.orderTotal ? `$${Number(orderData?.order?.paidAmount).toFixed(2)}` : '-'}
              </strong>
            </div>
          </div>
          <div className='tw-mb-3 tw-pb-1 tw-grid tw-grid-cols-2 md:tw-grid-cols-12 tw-gap-2'>
            <div className='md:tw-col-span-5'>
              <span className='tw-text-gray-500'>Date Paid</span>
            </div>
            <div className='md:tw-col-span-7'>
              <strong>
                {orderData?.order?.paymentDate
                  ? new Date(orderData?.order?.paymentDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : '-'}
              </strong>
            </div>
          </div>
          <div className='tw-pb-1 tw-grid tw-grid-cols-2 md:tw-grid-cols-12 tw-gap-2'>
            <div className='md:tw-col-span-5'>
              <span className='tw-text-gray-500'>Via</span>
            </div>
            <div className='md:tw-col-span-7'>
              <strong>{orderData?.order.paymentMethod}</strong>
            </div>
          </div>

          {/* Refund buttonn */}
          {/* <Row className='mb-4 border rounded-2 py-1'>
        <Col className='text-center'>
          <button className='bg-transparent border-0'>Refund</button>
        </Col>
      </Row> */}
        </div>
      )}
    </Modal>
  );
}
