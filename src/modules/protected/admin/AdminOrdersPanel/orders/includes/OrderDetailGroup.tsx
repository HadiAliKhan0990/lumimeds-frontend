'use client';

import toast from 'react-hot-toast';
import { genderFullFormRender, ROUTES, genderFullForm } from '@/constants';
import { formatUSDate, formatUSDateTime } from '@/helpers/dateFormatter';
import { formatStatusString } from '@/lib';
import { capitalizeFirst, formatUSPhoneWithoutPlusOne } from '@/lib/helper';
import { Error, OrderStatus as OrderStatusType, PharmacyType, SingleOrder } from '@/lib/types';
import { RootState } from '@/store';
import { PublicPharmacy } from '@/store/slices/adminPharmaciesSlice';
import { Agent } from '@/store/slices/agentApiSlice';
import { setModal } from '@/store/slices/modalSlice';
import { Order } from '@/store/slices/orderSlice';
import { useGetPrescriptionDetailsQuery, useLazyGetPrescriptionFileUrlQuery } from '@/store/slices/pharmaciesApiSlice';
import { setDosage } from '@/store/slices/updateOrderSlice';
import { isAxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { ChangeEvent, Fragment, useEffect, useMemo, useState, useTransition } from 'react';
import { FiDownload, FiEdit2 } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { AgentsSelect } from './AgentsSelect';
import { OrderNotesContent } from './OrderNotesContent';
import { OrderStatus } from './OrderStatus';
import { PrescriptionHistoryModal } from './PrescriptionHistoryModal';
import { VialShipmentModal } from './VialShipmentModal';

type OrderDetails =
  | 'General'
  | 'Order Details'
  | 'Remarks'
  | 'Latest Treatment'
  | 'Billing'
  | 'Medical History'
  | 'Body Metrics'
  | 'Tracking and Shipping/Courier Service'
  | 'Contact Details'
  | 'Address'
  | 'Coupon Affiliate'
  | 'Prescription Details'
  | 'Refill Details'
  | 'Patient Details';

interface Item {
  key?: string | null;
  value?: string | null;
  element?: React.ReactNode | null;
  direction?: 'row' | 'column';
}

interface OrderDetailGroupProps {
  title: OrderDetails;
  fullWidth?: boolean;
  actionButton?: React.ReactNode;
  data: SingleOrder | undefined;
  onAgentSelect?: (agent: Agent | null) => void;
  onOrderStatusChange?: (status: OrderStatusType) => void;
  onPharmacyChange?: (pharmacy: PublicPharmacy | PharmacyType) => void;
  onVialShipmentUpdate?: (newShippedVials: number) => void;
}

export const OrderDetailGroup = ({
  title,
  actionButton,
  data,
  fullWidth,
  onAgentSelect,
  onOrderStatusChange,
  onPharmacyChange,
  onVialShipmentUpdate,
}: OrderDetailGroupProps) => {
  const dispatch = useDispatch();
  const { push } = useRouter();

  const [isPending, startTransition] = useTransition();

  const [selectedPharmacy, setSelectedPharmacy] = useState<string>('');
  const [showVialShipmentModal, setShowVialShipmentModal] = useState<boolean>(false);
  const [showPrescriptionHistoryModal, setShowPrescriptionHistoryModal] = useState<boolean>(false);

  const order = useSelector((state: RootState) => state.order);
  const { patient } = useSelector((state: RootState) => state.singleOrder);

  // Fetch prescription details when title is 'Prescription Details'
  const { data: prescriptionData, isFetching: isPrescriptionLoading } = useGetPrescriptionDetailsQuery(order.id ?? '', {
    skip: title !== 'Prescription Details' || !order.id,
    refetchOnMountOrArgChange: true,
  });

  const [getPrescriptionFileUrl] = useLazyGetPrescriptionFileUrlQuery();

  // Check if prescription has downloadable files
  const hasDownloadableFiles = prescriptionData?.file && prescriptionData.file.trim() !== '';

  const { currentProductVariation, productVariations, pharmacies = [], status, pharmacyName = '' } = data?.order || {};

  const selected = productVariations?.find((item) => item.name === currentProductVariation);

  const pharmacyMaps = useSelector((state: RootState) => state.adminPharmacies.pharmaciesMaps);

  const adminPharmacies = useSelector((state: RootState) => state.adminPharmacies.pharmacies);

  const selectedPharmacyMemoized = useMemo(
    () => adminPharmacies.find((p) => p.name === selectedPharmacy),
    [adminPharmacies, selectedPharmacy]
  );

  const isManualPharmacySelected = (pharmacyId: string) => pharmacyMaps?.[pharmacyId]?.pharmacyType === 'manual';

  useEffect(() => {
    setSelectedPharmacy(pharmacyName ?? '');
  }, [pharmacyName]);

  function handleUpdatePharmacy(e: ChangeEvent<HTMLSelectElement>) {
    // Use pharmacies from order data (sorted by product priority) instead of all pharmacies
    const selectedPharmacy = pharmacies.find((item) => item.name === e.currentTarget.value);

    setSelectedPharmacy(selectedPharmacy?.name ?? '');

    if (onPharmacyChange && selectedPharmacy) onPharmacyChange(selectedPharmacy);

    // if (isManualPharmacySelected(selectedPharmacy?.id ?? '')) {
    //   return;
    // }

    startTransition(() => {
      const currentUrl =
        typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : ROUTES.ADMIN_ORDERS;

      push(
        `${ROUTES.ADMIN_PHARMACY_FORWARD_PRESCRIPTION}?pharmacyId=${encodeURIComponent(
          selectedPharmacy?.id ?? ''
        )}&orderId=${encodeURIComponent(order.id ?? '')}&returnUrl=${encodeURIComponent(currentUrl)}`
      );
    });
  }

  const handleDownloadFromUrl = async (url: string, fileName: string) => {
    try {
      // Fetch the file as a blob first
      const response = await fetch(url);
      const blob = await response.blob();

      // Create a blob URL and download
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the blob URL
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error downloading PDF file. Please try again.');
    }
  };

  const items = useMemo<Item[] | undefined>(() => {
    switch (title) {
      case 'General':
        return [
          {
            key: 'Date Created',
            value: formatUSDateTime(order.createdAt),
          },
          {
            key: 'Total Order(s)',
            value: `${data?.patient.totalOrders || 0}`,
          },
          {
            key: 'Processed With',
            element: <span className='text-capitalize fw-bold text-sm'>{order.processWith || '-'}</span>,
          },
          {
            key: 'Total Revenue',
            value: '-',
          },
          {
            key: 'Next Refill Date',
            value: formatUSDate(data?.order?.nextRefillDate),
          },
          {
            key: 'Device Type',
            value: '-',
          },
          {
            key: 'Reason',
            value: order.reason || '-',
          },
          {
            key: 'Session Page Views',
            value: '-',
          },
          {
            key: '',
            value: '',
          },
          {
            key: 'Total Dosage',
            value: data?.order.totalDosage ? `${data.order.totalDosage}` : '-',
          },
          {
            key: '',
            value: '',
          },
          {
            key: 'Remaining Dosage',
            value: data?.order.remainingDosage != null ? `${data.order.remainingDosage}` : '-',
          },
        ];
      case 'Billing':
        return [
          {
            key: 'Name',
            value: `${data?.patient?.firstName} ${data?.patient?.lastName}`,
          },
          {
            key: 'Email',
            value: data?.patient?.email,
          },
          {
            key: 'Address Line 1',
            element: (
              <div className='text-xs fw-medium d-flex flex-column'>
                <span>{data?.order?.address?.billingAddress?.street || '-'}</span>
                {/* {data?.order?.address?.billingAddress?.street2 && (
                  <span>{data?.order?.address?.billingAddress?.street2}</span>
                )} */}
              </div>
            ),
          },
          {
            key: 'Phone No.',
            value: formatUSPhoneWithoutPlusOne(data?.patient.phone ?? ''),
          },
          {
            key: 'Address Line 2',
            value: data?.order?.address?.billingAddress?.street2 ?? '-',
          },
          {
            key: 'City',
            value: `${data?.order?.address?.billingAddress?.city ?? '-'}`,
          },
          {
            key: 'State',
            value: `${data?.order?.address?.billingAddress?.state ?? '-'}`,
          },
          {
            key: 'Zip',
            value: `${data?.order?.address?.billingAddress?.zip ?? '-'}`,
          },
        ];
      case 'Order Details':
        return [
          {
            element: (
              <div className='col-12'>
                <div className='row g-4'>
                  <div className='col-lg-6'>
                    <div className='row text-xs align-items-center gy-3'>
                      <div className='col-6 text-placeholder'>Order Placed</div>
                      <div className='col-6'>{formatUSDateTime(data?.order?.dateOrdered)}</div>
                      <div className='col-6 text-placeholder'>Product</div>
                      <div className='col-6'>{data?.order.productName ?? '-'}</div>
                      <div className='col-6 text-placeholder'>Medication</div>
                      <div className='col-6'>
                        {data?.order?.prescriptionInstructions?.[0]?.medication ? (
                          <div className='tw-w-fit tw-text-sm tw-bg-primary/10 tw-border tw-border-primary/50 tw-rounded-full tw-line-clamp-1 tw-px-2'>
                            <span className='tw-capitalize'>{data.order.prescriptionInstructions[0].medication}</span>{' '}
                            {data?.order?.prescriptionInstructions?.[0]?.dosage?.toString() ? `${data.order.prescriptionInstructions[0].dosage.toString()}mg weekly` : 'No dosage found.'}
                          </div>
                        ) : (
                          '-'
                        )}
                      </div>
                      <div className='col-6 text-placeholder'>Dosage</div>
                      <div className='col-6'>
                        {status && status !== 'Not Paid' ? (
                          <select
                            value={data?.order?.prescriptionInstructions?.[0]?.dosage?.toString() ?? ''}
                            disabled={true}
                            onChange={(e) => {
                              dispatch(setDosage(e.target.value));
                              dispatch(setModal({ modalType: 'Dosage Confirmation' }));
                            }}
                            className='form-select p-2 form-select-sm shadow-none'
                          >
                            <option
                              value={data?.order?.prescriptionInstructions?.[0]?.dosage?.toString() ?? ''}
                              selected
                              disabled
                            >
                              {data?.order?.prescriptionInstructions?.[0]?.dosage?.toString()
                                ? `${data?.order?.prescriptionInstructions?.[0]?.dosage?.toString()}mg weekly`
                                : 'No dosage found.'}
                            </option>
                            {/* {productVariations?.map((item) => (
                              <option value={item.name} key={item.id}>
                                {item.description}
                              </option>
                            ))} */}
                          </select>
                        ) : (
                          selected?.description || '-'
                        )}
                      </div>
                      <div className='col-6 text-placeholder'>Pharmacy</div>
                      <div className='col-6'>
                        {status && status !== 'Not Paid' ? (
                          <select
                            disabled={isPending}
                            value={selectedPharmacy || ''}
                            className='form-select p-2 form-select-sm shadow-none'
                            onChange={handleUpdatePharmacy}
                          >
                            <option value='' disabled></option>
                            {pharmacies.map((item) => (
                              <option key={item.id} value={item.name}>
                                {capitalizeFirst(item.name)}
                                {isManualPharmacySelected(item.id) && ` (Manual)`}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className='text-capitalize fw-bold text-sm'>
                            {capitalizeFirst(selectedPharmacy) || '-'}
                          </span>
                        )}
                      </div>
                      <div className='col-6 text-placeholder'>Agent</div>
                      <div className='col-6'>
                        {data?.order?.status && status !== 'Not Paid' ? (
                          <AgentsSelect
                            selectedAgent={data?.order?.agent}
                            onAgentChange={onAgentSelect}
                            classNames={{
                              control: () => `p-none`,
                            }}
                          />
                        ) : (
                          <span className='text-capitalize fw-bold text-sm'>
                            {capitalizeFirst(data?.order?.agent?.name ?? '-')}
                          </span>
                        )}
                      </div>
                      {data?.order && onOrderStatusChange && (
                        <>
                          <div className='col-6 text-placeholder'>Status</div>
                          <div className={'col-6'}>
                            {status && status !== 'Not Paid' ? (
                              <>
                                <OrderStatus
                                  order={
                                    {
                                      ...data?.order,
                                    } as unknown as Order
                                  }
                                  onOrderStatusChange={onOrderStatusChange}
                                  disabled={
                                    isManualPharmacySelected(data?.order?.pharmacy ?? '') &&
                                    data?.order?.hasPharmacyOrder
                                      ? false
                                      : true
                                  }
                                />

                                {/* Show "By: providername" for reverted status, matching orders table format */}
                                {(() => {
                                  const isReverted = status?.toLowerCase() === 'reverted';
                                  if (!isReverted || !data?.order?.revertedBy) return null;

                                  // Handle null values explicitly (default values don't work for null, only undefined)
                                  const firstName = data.order.revertedBy.firstName ?? '';
                                  const lastName = data.order.revertedBy.lastName ?? '';
                                  const email = data.order.revertedBy.email ?? '';

                                  const name = `${firstName} ${lastName}`.trim();
                                  const emailStr = email ? String(email).trim() : '';
                                  const revertedByDisplay = name || emailStr || 'Unknown';
                                  const shouldCapitalize = !!name || revertedByDisplay === 'Unknown';

                                  return (
                                    <div className='tw-text-xs tw-leading-4 tw-text-slate-500 tw-mt-1'>
                                      By:{' '}
                                      <span className={`tw-font-medium ${shouldCapitalize ? 'tw-capitalize' : ''}`}>
                                        {revertedByDisplay}
                                      </span>
                                    </div>
                                  );
                                })()}
                              </>
                            ) : (
                              <>
                                <span
                                  className={`text-capitalize fw-bold text-sm status-badge ${
                                    data?.order?.status?.split('_')?.join(' ')?.toLowerCase() ?? '-'
                                  }`}
                                >
                                  {data?.order?.status?.split('_').join(' ').toLowerCase() ?? '-'}
                                </span>
                                {data?.order?.status?.toLowerCase() === 'reverted' &&
                                  data?.order?.revertedBy &&
                                  (() => {
                                    // Handle null values explicitly (default values don't work for null, only undefined)
                                    const firstName = data.order.revertedBy.firstName ?? '';
                                    const lastName = data.order.revertedBy.lastName ?? '';
                                    const email = data.order.revertedBy.email ?? '';

                                    const name = `${firstName} ${lastName}`.trim();
                                    const emailStr = email ? String(email).trim() : '';
                                    const revertedByDisplay = name || emailStr || 'Unknown';

                                    return (
                                      <div className='tw-text-[11px] tw-leading-4 tw-text-slate-500 tw-mt-0.5'>
                                        Reverted by{' '}
                                        <span className='tw-font-medium tw-capitalize'>{revertedByDisplay}</span>
                                      </div>
                                    );
                                  })()}
                              </>
                            )}
                          </div>
                        </>
                      )}
                      <div className='col-6 text-placeholder'>Tracking</div>
                      <div className='col-6'>{data?.order?.trackingNumber ?? '-'}</div>
                      <div className='col-6 text-placeholder'>Date Received</div>
                      <div className='col-6'>{formatUSDate(data?.order?.dateReceived)}</div>
                      <div className='col-6 text-placeholder'>Next Refillment Date</div>
                      <div className='col-6'>{formatUSDate(data?.order?.nextRefillDate)}</div>
                      {((data?.order?.metadata?.intervalCount || data?.order?.metaData?.intervalCount) ?? 0) > 0 && (
                        <>
                          <div className='col-6 text-placeholder'>Vial Shipment</div>
                          <div className='col-6'>
                            <div className='d-flex gap-1 align-items-center'>
                              <div className='w-fit custom-badge custom-bage-sm bage-success-light badge-oulined d-flex gap-1 align-items-center'>
                                <span>
                                  {data?.order?.shippedVials || 0} /{' '}
                                  {data?.order?.metadata?.intervalCount || data?.order?.metaData?.intervalCount}
                                </span>
                                <span className='text-muted' style={{ fontSize: '10px' }}>
                                  processed
                                </span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowVialShipmentModal(true);
                                }}
                                className='btn btn-sm p-0'
                                title={
                                  (data?.order?.shippedVials || 0) >=
                                  (data?.order?.metadata?.intervalCount || data?.order?.metaData?.intervalCount || 0)
                                    ? 'All vials shipped'
                                    : 'Edit vial shipment'
                                }
                                style={{ border: 'none', background: 'none' }}
                              >
                                <FiEdit2 size={12} className='text-success' />
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className='col-lg-6'>
                    <div className='row g-0 border-bottom pb-3 my-3'>
                      <div className='col-4'>
                        <p className='text-sm fw-medium'>Cost</p>
                        <span className='text-xs'>{data?.order?.orderTotal ? `$${data?.order?.orderTotal}` : '-'}</span>
                      </div>
                      <div className='col-4'>
                        <p className='text-sm fw-medium'>Qty</p>
                        <span className='text-xs'>{data?.order.quantity ?? '-'}</span>
                      </div>
                      <div className='col-4 pe-0'>
                        <p className='text-sm fw-medium'>Total</p>
                        <span className='text-xs'>
                          {data?.order?.orderTotal
                            ? `$${(Number(data.order.orderTotal) - Number(data.order.couponsAmount || 0)).toFixed(2)}`
                            : '-'}
                        </span>
                      </div>
                    </div>
                    <div className='row g-0 border-bottom pb-3 mb-3'>
                      <div className='col-4'>
                        <p className='text-sm fw-medium text-placeholder'>Items Subtotal</p>
                      </div>
                      <div className='col-8'>
                        <p className='text-sm'>{data?.order.orderTotal ? `$${data?.order?.orderTotal}` : '-'}</p>
                      </div>
                      <div className='col-4'>
                        <p className='text-sm fw-medium text-placeholder'>Coupon(s)</p>
                      </div>
                      <div className='col-8'>
                        <p className={`text-sm ${Number(data?.order.couponsAmount) === 0 ? '' : 'coupon-adjust'}`}>
                          {data?.order.couponsAmount && Number(data.order.couponsAmount) !== 0
                            ? `-$${data.order.couponsAmount}`
                            : '-'}
                        </p>
                      </div>
                      <div className='col-4'>
                        <p className='text-sm fw-medium text-placeholder m-0'>Order Total</p>
                      </div>
                      <div className='col-8'>
                        <p className='text-sm m-0'>
                          {data?.order?.orderTotal
                            ? `$${(Number(data.order.orderTotal) - Number(data.order.couponsAmount || 0)).toFixed(2)}`
                            : '-'}
                        </p>
                      </div>
                    </div>
                    <div className='row g-0'>
                      <div className='col-4'>
                        <p className='text-sm fw-medium'>Paid</p>
                        <span className='text-xs'>
                          {data?.order?.orderTotal ? `$${Number(data?.order?.paidAmount).toFixed(2)}` : '-'}
                        </span>
                      </div>
                      <div className='col-4'>
                        <p className='text-sm fw-medium'>Date Paid</p>
                        <span className='text-xs'>{formatUSDateTime(data?.order?.paymentDate)}</span>
                      </div>
                      <div className='col-4 pe-0'>
                        <p className='text-sm fw-medium'>via</p>
                        <span className='text-xs'>{data?.order.paymentMethod}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ),
          },
        ];
      case 'Remarks':
        return [
          {
            element: <OrderNotesContent orderData={data} />,
          },
        ];
      case 'Tracking and Shipping/Courier Service':
        return [
          {
            element: (
              <div className='col-12'>
                <div className='row g-4'>
                  <div className='col-lg-6'>
                    <div className='row text-xs align-items-center gy-3'>
                      <div className='col-6 text-placeholder'>Address Line 1</div>
                      <div className='col-6'>{data?.order?.address?.shippingAddress?.street ?? '-'}</div>
                      <div className='col-6 text-placeholder'>Address Line 2</div>
                      <div className='col-6'>{data?.order?.address?.shippingAddress?.street2 ?? '-'}</div>
                      <div className='col-6 text-placeholder'>City</div>
                      <div className='col-6'>{data?.order?.address?.shippingAddress?.city ?? '-'}</div>
                      <div className='col-6 text-placeholder'>State</div>
                      <div className='col-6'>{data?.order?.address?.shippingAddress?.state ?? '-'}</div>
                      <div className='col-6 text-placeholder'>Zip</div>
                      <div className='col-6'>{data?.order?.address?.shippingAddress?.zip ?? '-'}</div>
                    </div>
                  </div>
                  <div className='col-lg-6'>
                    <div className='row text-xs align-items-center gy-3'>
                      <div className='col-6 text-placeholder'>Tracking Number</div>
                      <div className='col-6'>{data?.order.trackingNumber ?? '-'}</div>
                      <div className='col-6 text-placeholder'>Courier Service</div>
                      <div className='col-6'>{data?.order.courierService ?? '-'}</div>
                    </div>
                  </div>
                </div>
              </div>
            ),
          },
        ];
      case 'Coupon Affiliate':
        return [
          {
            key: 'Referral Code',
            value: '-',
          },
          {
            key: 'Commission',
            value: `-`,
          },
          {
            key: 'Affiliate Referrer Coupon',
            value: '-',
          },
        ];
      case 'Prescription Details':
        if (isPrescriptionLoading) {
          return [
            {
              element: (
                <div className='col-12 text-center py-4'>
                  <div className='spinner-border spinner-border-sm' role='status'>
                    <span className='visually-hidden'>Loading...</span>
                  </div>
                </div>
              ),
            },
          ];
        }

        if (!prescriptionData) {
          return [
            {
              element: <div className='col-12 text-center py-4 text-muted'>No prescription details available</div>,
            },
          ];
        }

        return [
          {
            element: (
              <div className='col-12'>
                <div className='row g-4'>
                  <div className='col-lg-6'>
                    <div className='row text-xs align-items-center gy-3'>
                      <div className='col-6 text-placeholder'>Pharmacy</div>
                      <div className='col-6'>{prescriptionData.pharmacy ?? '-'}</div>
                      <div className='col-6 text-placeholder'>RX Number</div>
                      <div className='col-6'>
                        {prescriptionData.rxNumber === '' ? 'N/A' : prescriptionData.rxNumber}
                      </div>
                      <div className='col-6 text-placeholder'>Quantity</div>
                      <div className='col-6'>
                        {prescriptionData.products?.[0]?.quantity === ''
                          ? 'N/A'
                          : prescriptionData.products?.[0]?.quantity}
                      </div>
                      <div className='col-6 text-placeholder'>Refills</div>
                      <div className='col-6'>
                        {prescriptionData.products?.[0]?.refills === ''
                          ? 'N/A'
                          : prescriptionData.products?.[0]?.refills}
                      </div>
                      <div className='col-6 text-placeholder'>Vials</div>
                      <div className='col-6'>
                        {prescriptionData.products?.[0]?.vials === '' ? 'N/A' : prescriptionData.products?.[0]?.vials}
                      </div>
                      {prescriptionData.products?.[0]?.docNote && (
                        <>
                          <div className='col-12 text-placeholder mt-2'>{`Doctor's Note`}</div>
                          <div className='col-12 text-xs p-2 rounded ml-2' style={{ whiteSpace: 'pre-line' }}>
                            {prescriptionData.products?.[0]?.docNote}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className='col-lg-6'>
                    {prescriptionData.products?.length > 0 ? (
                      prescriptionData.products.map((product, index) => (
                        <div key={index} className=''>
                          <div className='row text-xs gy-2'>
                            <div className='col-6 text-placeholder'>Product Name</div>
                            <div className='col-6'>{product.prodName === '' ? 'N/A' : product.prodName}</div>

                            <div className='col-6 text-placeholder'>Created At</div>
                            <div className='col-6'>
                              {prescriptionData.createdAt ? formatUSDateTime(prescriptionData.createdAt) : 'N/A'}
                            </div>
                            <div className='col-6 text-placeholder'>Updated At</div>
                            <div className='col-6'>
                              {prescriptionData.updatedAt ? formatUSDateTime(prescriptionData.updatedAt) : 'N/A'}
                            </div>
                            <div className='col-6 text-placeholder'>Date Written</div>
                            <div className='col-6'>
                              {product.dateWritten ? formatUSDate(product.dateWritten) : 'N/A'}
                            </div>
                            <div className='col-6 text-placeholder'>Directions</div>
                            <div className='col-6' style={{ whiteSpace: 'pre-line' }}>
                              {prescriptionData.products?.[0]?.directions === ''
                                ? 'N/A'
                                : prescriptionData.products?.[0]?.directions}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className='text-muted text-xs'>No products available</div>
                    )}
                  </div>
                </div>
              </div>
            ),
          },
        ];
      case 'Refill Details':
        return [
          {
            key: 'Last Refill Date',
            value: data?.order?.lastRefillRequestData?.refillDate
              ? formatUSDate(data.order.lastRefillRequestData.refillDate)
              : '-',
          },
          {
            key: 'Refill Product Name',
            value: data?.order?.lastRefillRequestData?.refillRequestProductName || '-',
          },
          {
            key: 'Latest Pharmacy Order Status',
            value: data?.order?.latestPatientOrderDrugInfo?.latestPharmacyOrderStatus
              ? formatStatusString(data?.order?.latestPatientOrderDrugInfo?.latestPharmacyOrderStatus)
              : '-',
          },
          {
            key: 'Latest Pharmacy Order Strength',
            value: data?.order?.latestPatientOrderDrugInfo?.drugStrength
              ? `${data?.order?.latestPatientOrderDrugInfo?.drugStrength} mg/ml`
              : '-',
          },
        ];
      case 'Patient Details':
        return [
          {
            key: 'Name',
            element: (
              <span className='tw-capitalize tw-text-xs'>
                {`${patient?.firstName || ''} ${patient?.lastName || ''}`.trim() || '-'}
              </span>
            ),
          },
          {
            key: 'Email',
            value: patient?.email || '-',
          },
          {
            key: 'Phone',
            value: formatUSPhoneWithoutPlusOne(patient?.phone ?? '') || '-',
          },
          {
            key: 'Date of Birth',
            value: patient?.dob ? formatUSDate(patient.dob) : '-',
          },
          {
            key: 'Allergies',
            value: patient?.medicalHistory?.allergies || '-',
          },
          {
            key: 'Gender',
            value: patient?.gender
              ? genderFullForm[patient.gender.toUpperCase() as keyof typeof genderFullForm] ??
                genderFullFormRender[patient.gender.toLowerCase() as keyof typeof genderFullFormRender] ??
                '-'
              : '-',
          },
        ];
    }
  }, [
    order,
    data,
    prescriptionData,
    isPrescriptionLoading,
    selectedPharmacy,
    selectedPharmacyMemoized,
    onPharmacyChange,
    setShowVialShipmentModal,
    selected,
  ]);

  const handleVialShipmentSuccess = (newShippedVials: number) => {
    onVialShipmentUpdate?.(newShippedVials);
  };

  return (
    <>
      <VialShipmentModal
        show={showVialShipmentModal}
        onHide={() => setShowVialShipmentModal(false)}
        orderId={order.id ?? ''}
        currentShippedVials={data?.order?.shippedVials || 0}
        planCount={data?.order?.metadata?.intervalCount || data?.order?.metaData?.intervalCount || 0}
        productName={
          (data?.order?.metadata?.category || data?.order?.metaData?.category) &&
          (data?.order?.metadata?.medicineType || data?.order?.metaData?.medicineType)
            ? `${data?.order?.metadata?.category || data?.order?.metaData?.category} ${
                data?.order?.metadata?.medicineType || data?.order?.metaData?.medicineType
              }`
            : data?.order?.productName || ''
        }
        planDuration={
          (data?.order?.metadata?.intervalCount || data?.order?.metaData?.intervalCount) &&
          (data?.order?.metadata?.billingInterval || data?.order?.metaData?.billingInterval)
            ? `${data?.order?.metadata?.intervalCount || data?.order?.metaData?.intervalCount} ${
                data?.order?.metadata?.billingInterval || data?.order?.metaData?.billingInterval
              }${((data?.order?.metadata?.intervalCount || data?.order?.metaData?.intervalCount) ?? 0) > 1 ? 's' : ''}`
            : undefined
        }
        onSuccess={handleVialShipmentSuccess}
      />
      <div className='rounded-12 p-12 border border-c-light'>
        <div className={(title === 'Remarks' ? '' : 'mb-4 ') + 'd-flex align-items-center justify-content-between'}>
          <span className='tw-font-medium'>{title} </span>
          <div className='d-flex align-items-center gap-2'>
            {title === 'Prescription Details' && (
              <>
                <button
                  onClick={() => setShowPrescriptionHistoryModal(true)}
                  className='btn btn-outline-secondary btn-sm'
                  type='button'
                >
                  View Prescription History
                </button>
                {hasDownloadableFiles && (
                  <button
                    onClick={async () => {
                      try {
                        const response = await getPrescriptionFileUrl(order.id ?? '').unwrap();
                        if (response?.data?.url) {
                          const fileName = `prescription-${prescriptionData?.rxNumber || 'document'}.pdf`;
                          await handleDownloadFromUrl(response.data.url, fileName);
                        } else {
                          alert('No prescription file URL found');
                        }
                      } catch (error) {
                        console.error('Error fetching prescription file URL:', error);
                        toast.error(
                          isAxiosError(error)
                            ? error.response?.data.message
                            : (error as Error).data.message || 'Error fetching prescription file. Please try again.'
                        );
                      }
                    }}
                    className='btn btn-outline-primary btn-sm d-flex align-items-center gap-2'
                    type='button'
                  >
                    <FiDownload size={14} />
                    Download Prescription
                  </button>
                )}
              </>
            )}
            {actionButton}
          </div>
        </div>
        <div className='row gy-3'>
          {items?.map((item, index) =>
            item.element && !item.key ? (
              <Fragment key={index}>{item.element}</Fragment>
            ) : (
              <div className={fullWidth ? 'col-12' : 'col-md-6'} key={index}>
                <div className={fullWidth ? 'row' : ''}>
                  <div className={fullWidth ? 'col-md-6' : ''}>
                    <div
                      className={
                        (item.direction === 'column' ? 'flex-column' : 'flex-row align-items-center') + ' row g-3 '
                      }
                    >
                      <div className='text-placeholder col-6 fw-medium text-xs'>{item.key}</div>
                      <div className='col-6'>
                        {item.key && item.element ? (
                          item.element
                        ) : (
                          <div className='fw-medium text-xs'>{item.value && item.value}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
      <PrescriptionHistoryModal
        show={showPrescriptionHistoryModal}
        onHide={() => setShowPrescriptionHistoryModal(false)}
        orderId={order.id ?? ''}
      />
    </>
  );
};
