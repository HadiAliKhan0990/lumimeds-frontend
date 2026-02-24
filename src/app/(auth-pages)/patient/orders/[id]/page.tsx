'use client';

import Link from 'next/link';
// import OrderProgress from '@/components/Patient/Steps';
import OrderAttachments from '@/modules/protected/patient/orders/includes/OrderAttachments';
import { useStates } from '@/hooks/useStates';
import { useGetPatientSingleOrderQuery } from '@/store/slices/ordersApiSlice';
import { useParams, useSearchParams } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa6';
import { AsyncImage } from 'loadable-image';
import { Blur } from 'transitions-kit';
import { capitalizeFirst, formatUSPhoneWithoutPlusOne } from '@/lib/helper';
import { formatUSDate } from '@/helpers/dateFormatter';
import { formatOrderStatusForPatient } from '@/lib';
import { HiOutlineExternalLink } from 'react-icons/hi';

export default function Page() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  const { data } = useGetPatientSingleOrderQuery(id as string, {
    skip: !id,
  });

  const { order, patient } = data || {};
  const { nameToCode } = useStates();

  function getStateAbbreviation(stateName?: string) {
    if (!stateName) return stateName;
    // Find the abbreviation for the given state name
    return nameToCode[stateName] || stateName; // Return abbreviation if found, otherwise return original
  }

  function formatAddress(city?: string, state?: string, zip?: number | string) {
    const stateAbbr = getStateAbbreviation(state);

    if (city && stateAbbr && zip) {
      return `${city}, ${stateAbbr} ${zip}`;
    }
    if (city && stateAbbr) {
      return `${city}, ${stateAbbr}`;
    }
    if (city && zip) {
      return `${city}, ${zip}`;
    }
    if (stateAbbr && zip) {
      return `${stateAbbr} ${zip}`;
    }
    return [city, stateAbbr, zip].filter(Boolean).join(', ');
  }

  const backHref = returnTo === 'forms' ? '/patient/forms' : '/patient/orders';

  return (
    <div className={'max-w-955 pb-5 mx-auto'}>
      <Link href={backHref} className='d-inline-flex align-items-center gap-2 mb-5 align-self-start'>
        <FaArrowLeft />
        Back
      </Link>
      {order?.orderNumber && <h1 className='page-title mb-5'>Order No. {order?.orderNumber || 'N/A'}</h1>}
      {/* <div className='mb-3 mb-sm-5'>
        <OrderProgress currentStep={0} />
      </div> */}
      <div className='text-center mb-4'>
        <span className='me-2 fw-semibold bg-secondary bg-opacity-25 px-3 py-2 rounded'>
          Order status may not be complete or up to date
        </span>
      </div>
      <div className='dashboard-card shadow-md p-sm-4 mb-5'>
        <div className='p-3'>
          <h3 className='fw-bold mb-5'>Order Details</h3>

          <div className='order-header p-4 px-sm-5 mb-5'>
            <div className='py-3 d-flex flex-column flex-md-row align-items-center gap-4 gap-md-5'>
              {/* Image section - will appear second on mobile */}
              <div className='order-image object-fit-contain border rounded-2 py-3'>
                {order?.image && (
                  <AsyncImage
                    src={order?.image ?? ''}
                    Transition={Blur}
                    loader={<div className='bg-secondary-subtle' />}
                    alt={order?.productName}
                    className='w-100 h-100'
                  />
                )}
              </div>
              {/* Text section - will appear first on mobile */}
              <div className='order-text text-center text-md-start'>
                <h3 className='fw-normal text-2xl text-21-px'>Medication</h3>
                <div className='text-2xl md:text-3xl lg:text-5xl fw-bold text-21-px'>{order?.productName ?? '-'}</div>
              </div>
            </div>
          </div>
          <div className='row g-5 align-items-lg-center'>
            <div className='col-lg-6'>
              {/* Pricing Info */}
              <div className='row g-0 mb-2'>
                <div className='col-4 border-bottom border-light pb-2'>
                  <p className='mb-1 fw-bold'>Cost</p>
                  <small>{order?.cost ? `$${order?.cost}` : '-'}</small>
                </div>
                <div className='col-4 border-bottom border-light pb-2'>
                  <p className='mb-1 fw-bold'>Qty</p>
                  <small>{order?.quantity ?? '-'}</small>
                </div>
                <div className='col-4 border-bottom border-light pb-2'>
                  <p className='mb-1 fw-bold'>Total</p>
                  <small>
                    {order?.cost ? `$${Number(Number(order?.cost) - Number(order.couponAmount)).toFixed(2)}` : '-'}
                  </small>
                </div>
              </div>

              <div className='row g-0 mb-2'>
                <div className='col-8 col-md-4 border-bottom border-light pb-2'>
                  <div className='small fw-bold mb-2'>Items Subtotal</div>
                  <div className='small fw-bold mb-2'>Coupon(s)</div>
                  <div className='small fw-bold'>Order Total</div>
                </div>
                <div className='col-4 col-md-4 border-bottom border-light pb-2'>
                  <div className='small mb-2'>{order?.cost ? `$${order?.cost}` : '-'}</div>
                  <div className={`small mb-2 ${Number(order?.couponAmount) === 0 ? '' : 'coupon-adjust'}`}>
                    {order?.couponAmount && Number(order.couponAmount) !== 0 ? `-$${order.couponAmount}` : '-'}
                  </div>
                  <div className='small'>
                    {order?.cost ? `$${Number(Number(order?.cost) - Number(order.couponAmount)).toFixed(2)}` : '-'}
                  </div>
                </div>
                <div className='d-none d-md-block col-4 border-bottom border-light pb-2'></div>
              </div>

              <div className='row g-0'>
                <div className='col-8 col-md-4'>
                  <div className='small fw-bold mb-2'>Paid</div>
                  <div className='small fw-bold mb-2'>Date Paid</div>
                  <div className='small fw-bold'>via</div>
                </div>
                <div className='col-4 col-md-4'>
                  <div className='small mb-2'>{order?.cost ? `$${Number(order?.paidAmount).toFixed(2)}` : '-'}</div>
                  <div className='small mb-2'>{formatUSDate(order?.datePaid)}</div>
                  <div className='small'>{order?.paymentMethod ?? '-'}</div>
                </div>
              </div>
            </div>

            <div className='col-12 col-lg-6'>
              <dl className='row'>
                <dt className='col-6 small sm-pl-0 mb-2'>Date order placed</dt>
                <dd className='small col-6 '>{formatUSDate(order?.dateOrdered)}</dd>

                <dt className='col-6 small sm-pl-0 mb-2'>Dosage</dt>
                <dd className='small col-6'>{order?.dosage ? `${order.dosage}mg` : '-'}</dd>
                <dt className='col-6 small sm-pl-0 mb-2'>Pharmacy</dt>
                <dd className='small col-6'>
                  {order?.pharmacy && order.pharmacy.trim() !== '' ? capitalizeFirst(order.pharmacy) : 'To be assigned'}
                </dd>
                <dt className='col-6 small sm-pl-0 mb-2'>Status</dt>
                <dd className='small col-6 tw-text-orange-500'>
                  <div className='d-flex flex-column'>
                    {order?.status === 'Pending_Renewal_Intake' && order?.renewalIntakeSurveyUrl ? (
                      <a
                        className='!tw-text-orange-500 tw-flex tw-items-center tw-gap-1'
                        href={order?.renewalIntakeSurveyUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        {formatOrderStatusForPatient(order.status, true)}
                        <HiOutlineExternalLink className='tw-w-4 tw-h-4 tw-flex-shrink-0' />
                      </a>
                    ) : (
                      <span>{order?.status ? formatOrderStatusForPatient(order.status, true) : '-'}</span>
                    )}
                    {(order?.status === 'Action_Required' ||
                      order?.status === 'Rolled_Back' ||
                      order?.status === 'Reverted') && (
                      <span className='tw-text-xs tw-text-muted tw-mt-1'>Please contact the support team</span>
                    )}
                  </div>
                </dd>
                <dt className='col-6 small sm-pl-0 mb-2'>Tracking</dt>
                <dd className='small col-6'>{order?.trackingNumber ?? 'Awaiting shipping info'}</dd>
                <dt className='col-6 small sm-pl-0 mb-2'>Date Received</dt>
                <dd className='small col-6'>{formatUSDate(order?.dateReceived)}</dd>
                {/* <dt className='col-6 small  sm-pl-0 mb-2'>Next Refillment Date</dt>
                  <dd className='col-6 small'>
                    {order?.nextRefillDate
                      ? formatDate(order.nextRefillDate, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Scheduled after first delivery'}
                  </dd> */}
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Billing & Shipping Info */}
      <div className='row g-5'>
        {/* Billing Card - Optimized */}
        <div className='col-12 col-lg-6 d-flex'>
          <div className='dashboard-card shadow-md p-3 p-sm-4 w-100'>
            <h3 className='mb-4 fw-bold text-center'>Billing</h3>
            <dl className='row gx-5 gx-sm-3'>
              <dt className='col-4  fw-bold small'>Name</dt>
              <dd className='col-8 small mb-2 mb-sm-3'>
                {order?.address?.billingAddress?.firstName ?? patient?.address?.billingAddress?.firstName ?? '-'}{' '}
                {order?.address?.billingAddress?.lastName ?? patient?.address?.billingAddress?.lastName ?? '-'}
              </dd>

              <dt className='col-4 fw-bold small sm-pl-0'>Address</dt>
              <dd className='col-8 small mb-2 mb-sm-3 text-break'>
                {(() => {
                  const billingAddress = order?.address?.billingAddress ?? patient?.address?.billingAddress;
                  return billingAddress?.street ||
                    billingAddress?.street2 ||
                    billingAddress?.city ||
                    billingAddress?.state ||
                    billingAddress?.zip ? (
                    <>
                      {billingAddress?.street && <>{billingAddress.street}</>}

                      {billingAddress?.street2 && (
                        <>
                          <br />
                          {billingAddress.street2}
                        </>
                      )}
                      <br />

                      {formatAddress(billingAddress?.city, billingAddress?.state, billingAddress?.zip)}
                    </>
                  ) : (
                    '-'
                  );
                })()}
              </dd>

              <dt className='col-4 fw-bold small'>Email</dt>
              <dd className='col-8 small mb-2 mb-sm-3 text-break'>{patient?.email ?? '-'}</dd>

              <dt className='col-4 fw-bold small sm-pl-0'>Phone No.</dt>
              <dd className='col-8 small '>{formatUSPhoneWithoutPlusOne(patient?.phone ?? '') ?? '-'}</dd>
            </dl>
          </div>
        </div>

        <div className='col-12 col-lg-6 d-flex'>
          <div className='dashboard-card shadow-md p-3 p-sm-4 w-100'>
            <h3 className='fw-bold mb-4 text-center'>Shipping</h3>

            <dl className='row gx-5 gx-sm-3'>
              <dt className='col-4 fw-bold small'>Name</dt>
              <dd className='col-8 small mb-2 mb-sm-3'>
                {order?.address?.shippingAddress?.firstName ?? patient?.address?.shippingAddress?.firstName ?? '-'}{' '}
                {order?.address?.shippingAddress?.lastName ?? patient?.address?.shippingAddress?.lastName ?? '-'}
              </dd>

              <dt className='col-4 fw-bold small sm-pl-0'>Address</dt>
              <dd className='col-8 small mb-2 mb-sm-3 text-break'>
                {(() => {
                  const shippingAddress = order?.address?.shippingAddress ?? patient?.address?.shippingAddress;
                  return shippingAddress?.street ||
                    shippingAddress?.street2 ||
                    shippingAddress?.city ||
                    shippingAddress?.state ||
                    shippingAddress?.zip ? (
                    <>
                      {shippingAddress?.street && <>{shippingAddress.street}</>}

                      {shippingAddress?.street2 && (
                        <>
                          <br />
                          {shippingAddress.street2}
                        </>
                      )}
                      <br />

                      {formatAddress(shippingAddress?.city, shippingAddress?.state, shippingAddress?.zip)}
                    </>
                  ) : (
                    '-'
                  );
                })()}
              </dd>

              <dt className='col-4 fw-bold small'>Email</dt>
              <dd className='col-8 col-sm-8 small mb-2 mb-sm-3 text-break'>{patient?.email ?? '-'}</dd>

              <dt className='col-4 fw-bold small sm-pl-0'>Phone No.</dt>
              <dd className='col-8 small'>{formatUSPhoneWithoutPlusOne(patient?.phone ?? '') ?? '-'}</dd>
            </dl>
          </div>
        </div>
      </div>

      {order?.id && patient?.id && (
        <div className='dashboard-card shadow-md p-sm-4 mt-5'>
          <OrderAttachments orderId={order.id} patientId={patient.id} />
        </div>
      )}
    </div>
  );
}
