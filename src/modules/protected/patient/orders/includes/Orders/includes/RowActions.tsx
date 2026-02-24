'use client';

import { setModal } from '@/store/slices/modalSlice';
import { useDispatch } from 'react-redux';
import { Order } from '@/store/slices/orderSlice';
import { TfiMoreAlt } from 'react-icons/tfi';
import { Dropdown, DropdownItem } from '@/components/elements/Dropdown';
import { Tooltip } from '@/components/elements';
import { useLazyGetOrderPrescriptionQuery } from '@/store/slices/pharmaciesApiSlice';
import { isAxiosError } from 'axios';
import { Error as ApiError } from '@/lib/types';
import { Spinner } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { PatientPrescriptionModal } from './PatientPrescriptionModal';
import { PatientPrescriptionData } from './types';

interface Props {
  order: Order;
  setSelectedOrder: (order: Order) => void;
  onContactAdmin: (order: Order) => void;
}

export const RowActions = ({ order, setSelectedOrder, onContactAdmin }: Readonly<Props>) => {
  const dispatch = useDispatch();
  const [getOrderPrescription, { isLoading: isLoadingPrescription }] = useLazyGetOrderPrescriptionQuery();
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [prescriptionData, setPrescriptionData] = useState<PatientPrescriptionData | null>(null);

  const handleSubmitRefillRequest = () => {
    setSelectedOrder(order);
  };

  const handleUpdateAddress = () => {
    dispatch(
      setModal({
        modalType: 'Edit Patient Address',
        ctx: {
          billingAddress: order?.address?.billingAddress,
          shippingAddress: order?.address?.shippingAddress,
          orderId: order?.id,
          productName: order?.requestedProductName || '',
          isPatientView: true,
        },
      })
    );
  };

  const handleContactAdmin = () => {
    onContactAdmin(order);
  };

  const handleViewPrescription = async () => {
    try {
      if (!order.id) {
        toast.error('Order ID is missing');
        return;
      }
      const result = await getOrderPrescription(order.id).unwrap();
      
      // Check if result contains valid prescription data
      if (!result || !result.patient || !result.products || result.products.length === 0) {
        toast.error('No prescription data available for this order');
        return;
      }

      setPrescriptionData(result);
      setShowPrescriptionModal(true);
    } catch (error) {
      console.error('Error fetching prescription:', error);
      let errorMessage = 'Failed to fetch prescription';
      if (isAxiosError(error)) {
        errorMessage =
          error.response?.data?.message ||
          error.message ||
          `Error: ${error.response?.status} ${error.response?.statusText}` ||
          'Failed to fetch prescription';
      } else if (error && typeof error === 'object' && 'data' in error) {
        errorMessage = (error as ApiError).data?.message || 'Failed to fetch prescription';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    }
  };

  const isReverted = order?.status?.toLowerCase() === 'reverted';
  const medicineType = order?.medicineType || '';
  const isLongevity = medicineType?.toLowerCase() === 'longevity';
  const isDrafted = order?.status?.toLowerCase() === 'not_paid';

  return (
    <>
      <div className='tw-flex justify-content-lg-center tw-items-center' onClick={(e) => e.stopPropagation()}>
        <Dropdown trigger={<TfiMoreAlt size={20} />} align='right'>
          {order.type === 'subscription' && !isDrafted && (
            <Tooltip
              content={isLongevity ? 'Refill requests are not available for longevity products' : undefined}
              position='left'
            >
              <div className='tw-w-full'>
                <DropdownItem onClick={handleSubmitRefillRequest} disabled={isLongevity}>
                  Submit Refill Request
                </DropdownItem>
              </div>
            </Tooltip>
          )}
          <DropdownItem onClick={handleUpdateAddress}>Update Address</DropdownItem>
          <DropdownItem
            onClick={handleViewPrescription}
            className='tw-flex tw-items-center tw-justify-between tw-gap-4'
            disabled={isLoadingPrescription}
          >
            <span>View Prescription</span>
            {isLoadingPrescription && <Spinner size='sm' />}
          </DropdownItem>
          {isReverted && <DropdownItem onClick={handleContactAdmin}>Contact Admin</DropdownItem>}
        </Dropdown>
      </div>
      <PatientPrescriptionModal
        show={showPrescriptionModal}
        onHide={() => setShowPrescriptionModal(false)}
        prescriptionData={prescriptionData}
      />
    </>
  );
};