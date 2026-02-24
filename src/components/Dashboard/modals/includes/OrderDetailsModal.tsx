'use client';

import AsyncImgLoader from '@/components/AsyncImgLoader';
import { Row, Col } from 'react-bootstrap';
import { AsyncImage } from 'loadable-image';
import { Blur } from 'transitions-kit';
import { IoMdClose } from 'react-icons/io';
import { useDispatch, useSelector } from 'react-redux';
import { setModal } from '@/store/slices/modalSlice';
import { useGetSingleOrderQuery } from '@/store/slices/ordersApiSlice';
import { capitalizeFirst } from '@/lib/helper';
import { RootState } from '@/store';
import { setDosage } from '@/store/slices/updateOrderSlice';
import { ChangeEvent, useTransition } from 'react';
import { ROUTES } from '@/constants';
import { useRouter } from 'next/navigation';
import { formatUSDate } from '@/helpers/dateFormatter';
import { setOrderData, setSelectedOrderId } from '@/store/slices/selectedOrderSlice';
import { usePathname } from 'next/navigation';

export function OrderDetailsModal() {
  const dispatch = useDispatch();
  const { push } = useRouter();
  const pathname = usePathname();
  const isAdminView = pathname?.startsWith('/admin');

  const [isPending, startTransition] = useTransition();

  const { selectedOrderId, orderData: selectedOrder } = useSelector((state: RootState) => state.selectedOrder);

  const { data: orderData } = useGetSingleOrderQuery(selectedOrderId || '', {
    skip: !selectedOrderId,
  });

  const {
    currentProductVariation,
    productVariations,
    pharmacy = '',
    pharmacyName = '',
    pharmacies = [],
    status,
  } = orderData?.order || {};
  const selected = productVariations?.find((item) => item.name === currentProductVariation);
  const displayedOrderId =
    orderData?.order?.uniqueOrderId ?? orderData?.order?.orderUniqueId ?? selectedOrder?.orderUniqueId ?? '-';

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
    dispatch(setOrderData(null));
  }

  return (
    <div className='text-sm tw-px-2'>
      {/* Heading */}
      <div className='d-flex justify-content-between align-items-start mb-4'>
        <span className='text-xl fw-medium'>Order Details</span>
        <IoMdClose className='cursor-pointer' size={24} onClick={handleClose} />
      </div>

      {/* Medication Section */}
      <Row className='mb-3 py-1 align-items-center gx-3'>
        <Col xs={3} sm={2} md={2}>
          <AsyncImage
            src={selectedOrder?.image || ''}
            Transition={Blur}
            loader={<AsyncImgLoader />}
            alt={selectedOrder?.requestedProductName ?? ''}
            className='border rounded-2 w-100 flex-shrink-0 h-50px object-fit-contain async-img'
          />
        </Col>
        <Col xs={9} sm={10} md={10} className='d-flex flex-column'>
          <span className='text-muted mb-1'>Medication</span>
          <span>{orderData?.order.productName ?? '-'}</span>
        </Col>
      </Row>

      {/* Order Details Table */}
      {isAdminView && (
        <Row className='mb-2 py-1'>
          <Col xs={6} md={5}>
            <span className='text-muted'>Order ID</span>
          </Col>
          <Col xs={6} md={7}>
            <strong>{displayedOrderId}</strong>
          </Col>
        </Row>
      )}
      <Row className='mb-2 py-1'>
        <Col xs={6} md={5}>
          <span className='text-muted'>Date order placed</span>
        </Col>
        <Col xs={6} md={7}>
          <strong>{formatUSDate(orderData?.order?.dateOrdered ?? '') ?? '-'}</strong>
        </Col>
      </Row>
      <Row className='mb-2 py-1'>
        <Col xs={6} md={5} className='d-flex align-items-center'>
          <span className='text-muted '>Dosage</span>
        </Col>
        <Col xs={6} md={7}>
          {status === 'Pending' || status === 'Drafted' ? (
            <select
              value={selected?.name}
              onChange={(e) => {
                dispatch(setDosage(e.target.value));
                dispatch(setModal({ modalType: 'Dosage Confirmation' }));
              }}
              className='form-select form-select-sm shadow-none'
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
            orderData?.order?.prescriptionInstructions?.[0]?.dosage
              ? `${orderData.order.prescriptionInstructions[0].dosage}mg weekly`
              : selected?.description || '-'
          )}
        </Col>
      </Row>
      <Row className='mb-2 py-1'>
        <Col xs={6} md={5} className='d-flex align-items-center'>
          <span className='text-muted'>Pharmacy</span>
        </Col>
        <Col xs={6} md={7}>
          {status === 'Pending' || status === 'Drafted' ? (
            <select
              value={pharmacy || pharmacyName || ''}
              disabled={Boolean(pharmacyName) || isPending}
              onChange={handleUpdatePharmacy}
              className='form-select form-select-sm shadow-none'
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
        </Col>
      </Row>
      <Row className='mb-2 py-1'>
        <Col xs={6} md={5}>
          <span className='text-muted'>Status</span>
        </Col>
        <Col xs={6} md={7}>
          <span className=''>{orderData?.order.status ? orderData?.order.status.replaceAll('_', ' ') : '-'}</span>
        </Col>
      </Row>
      <Row className='mb-2 py-1'>
        <Col xs={6} md={5}>
          <span className='text-muted'>Tracking</span>
        </Col>
        <Col xs={6} md={7}>
          <span>{orderData?.order?.trackingNumber ?? '-'}</span>
        </Col>
      </Row>
      <Row className='mb-2 py-1'>
        <Col xs={6} md={5}>
          <span className='text-muted'>Date Received</span>
        </Col>
        <Col xs={6} md={7}>
          <span>
            {orderData?.order?.dateReceived
              ? new Date(orderData?.order?.dateReceived).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : '-'}
          </span>
        </Col>
      </Row>
      <Row className='mb-4 py-1'>
        <Col xs={6} md={5}>
          <span className='text-muted'>Next Refillment Date</span>
        </Col>
        <Col xs={6} md={7}>
          <span>
            {orderData?.order?.nextRefillDate
              ? new Date(orderData?.order?.nextRefillDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : '-'}
          </span>
        </Col>
      </Row>

      {/* Cost Section */}
      <Row className='mb-3 py-1'>
        <Col className='d-flex justify-content-between align-items-center'>
          <strong>Cost</strong>
          <strong>Qty</strong>
          <strong>Total</strong>
        </Col>
      </Row>
      <Row className='mb-3 border-bottom pb-3'>
        <Col className='d-flex justify-content-between align-items-center'>
          <span>{orderData?.order?.orderTotal ? `$${orderData?.order?.orderTotal}` : '-'}</span>
          <span>{orderData?.order.quantity ?? '-'}</span>
          <span>
            {orderData?.order?.orderTotal
              ? `$${(Number(orderData.order.orderTotal) - Number(orderData.order.couponsAmount || 0)).toFixed(2)}`
              : '-'}
          </span>
        </Col>
      </Row>

      {/* Order Summary */}
      <Row className='mb-3 pb-1'>
        <Col xs={6} md={5}>
          <span className='text-muted'>Items Subtotal</span>
        </Col>
        <Col xs={6} md={7}>
          <strong>{orderData?.order.orderTotal ? `$${orderData?.order?.orderTotal}` : '-'}</strong>
        </Col>
      </Row>
      <Row className='mb-3 pb-1'>
        <Col xs={6} md={5}>
          <span className='text-muted'>Coupon(s)</span>
        </Col>
        <Col xs={6} md={7} className={Number(orderData?.order.couponsAmount || 0) !== 0 ? 'coupon-adjustment' : ''}>
          <strong>
            {orderData?.order.couponsAmount
              ? Number(orderData.order.couponsAmount) === 0
                ? '-'
                : `-$${orderData.order.couponsAmount}`
              : '-'}
          </strong>
        </Col>
      </Row>
      <Row className='mb-3 border-bottom pb-3'>
        <Col xs={6} md={5}>
          <span className='text-muted'>Order Total</span>
        </Col>
        <Col xs={6} md={7}>
          <strong>
            {orderData?.order?.orderTotal
              ? `$${(Number(orderData.order.orderTotal) - Number(orderData.order.couponsAmount || 0)).toFixed(2)}`
              : '-'}
          </strong>
        </Col>
      </Row>
      <Row className='mb-3 pb-1'>
        <Col xs={6} md={5}>
          <span className='text-muted'>Paid</span>
        </Col>
        <Col xs={6} md={7}>
          <strong>{orderData?.order?.orderTotal ? `$${Number(orderData?.order?.paidAmount).toFixed(2)}` : '-'}</strong>
        </Col>
      </Row>
      <Row className='mb-3 pb-1'>
        <Col xs={6} md={5}>
          <span className='text-muted'>Date Paid</span>
        </Col>
        <Col xs={6} md={7}>
          <strong>
            {orderData?.order?.paymentDate
              ? new Date(orderData?.order?.paymentDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : '-'}
          </strong>
        </Col>
      </Row>
      <Row className='pb-1'>
        <Col xs={6} md={5}>
          <span className='text-muted'>Via</span>
        </Col>
        <Col xs={6} md={7}>
          <strong>{orderData?.order.paymentMethod}</strong>
        </Col>
      </Row>

      {/* Refund buttonn */}
      {/* <Row className='mb-4 border rounded-2 py-1'>
        <Col className='text-center'>
          <button className='bg-transparent border-0'>Refund</button>
        </Col>
      </Row> */}
    </div>
  );
}
