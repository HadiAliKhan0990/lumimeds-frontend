'use client';

import { setModal } from '@/store/slices/modalSlice';
import { useSelectedOrder } from '@/store/slices/orderPaymentSlice';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useAssignOrderToDoctorMutation, useLazyGetOrdersQuery } from '@/store/slices/ordersApiSlice';
import { Spinner } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { OrderProvider } from '@/store/slices/orderSlice';
import { setOrdersData } from '@/store/slices/ordersSlice';

interface Error {
  data: {
    data: null;
    message: string | null;
    statusCode: number;
    success: boolean;
  };
}

export const DoctorAssignmentModal = () => {
  const dispatch = useDispatch();
  const order = useSelectedOrder();

  // Get doctor ID from modal context (passed from table dropdown)
  const modalData = useSelector((state: RootState) => state.modal);
  const doctorIdFromModal = (modalData.ctx as { doctorId?: string })?.doctorId;

  // Get current search and filter parameters from Redux store
  const search = useSelector((state: RootState) => state.sort.search);
  const sortOrder = useSelector((state: RootState) => state.sort.sortOrder);
  const sortField = useSelector((state: RootState) => state.sort.sortField);
  const statusArray = useSelector((state: RootState) => state.sort.statusArray);
  const sortStatus = useSelector((state: RootState) => state.sort.sortStatus);

  const [mutateAsync, { isLoading }] = useAssignOrderToDoctorMutation();
  const [triggerOrders] = useLazyGetOrdersQuery();

  // Get providers list from the order data (these are the available providers for this specific order)
  const orderProviders = order?.providers || [];

  // Use the provider ID that was passed from the table dropdown
  const finalSelectedProviderId = doctorIdFromModal;
  const selectedProvider = orderProviders.find((p: OrderProvider) => p.id === finalSelectedProviderId);

  function handleClose() {
    dispatch(setModal({ modalType: undefined }));
  }

  async function handleSubmit() {
    if (!order?.id || !finalSelectedProviderId || !order?.patient?.id) {
      toast.error('Please select a provider first');
      return;
    }

    try {
      const { data, error } = await mutateAsync({
        orderId: order.id,
        providerId: finalSelectedProviderId,
        patientId: order.patient.id,
      });

      if (error) {
        toast.error((error as Error).data.message);
      } else if (data) {
        // Close the modal first
        handleClose();

        // Refetch orders data to update the UI while preserving current search filters
        try {
          const { data: updatedOrders } = await triggerOrders({
            meta: { page: 1, limit: 30 },
            search,
            sortField,
            sortOrder,
            ...(sortStatus && { status: sortStatus }),
            statusArray: statusArray?.map((f) => f.value as string),
          });

          if (updatedOrders) {
            const { meta: metaData, orders: newOrders, statusCounts } = updatedOrders;
            dispatch(setOrdersData({ meta: metaData, data: newOrders, statusCounts }));
          }
        } catch (refetchError) {
          console.error('Error refetching orders:', refetchError);
        }

        // Show success toast after modal is closed
        toast.success('Order assigned to provider successfully');
      }
    } catch (error) {
      toast.error((error as Error).data.message);
    }
  }

  // Show confirmation modal directly (provider should be pre-selected from table dropdown)
  if (finalSelectedProviderId && selectedProvider) {
    return (
      <div className='py-2 px-3'>
        <p className='text-2xl fw-medium text-center'>Provider Assignment</p>
        <p className='my-4 text-center'>
          Are you sure you want to assign this order to <span className='fw-bold'>{selectedProvider.name}</span>?
        </p>
        <div className='d-flex align-items-center gap-3'>
          <button className='btn btn-outline-primary rounded-2 flex-grow-1' onClick={handleClose}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className='btn btn-primary rounded-2 flex-grow-1 d-flex align-items-center justify-content-center gap-2'
            disabled={isLoading}
          >
            {isLoading && <Spinner size='sm' />}
            Assign
          </button>
        </div>
      </div>
    );
  }

  // If no providers available for this order
  if (orderProviders.length === 0) {
    return (
      <div className='py-2 px-3'>
        <p className='text-2xl fw-medium text-center'>Provider Assignment</p>
        <p className='my-4 text-center text-danger'>No providers available for this order</p>
        <div className='d-flex align-items-center gap-3'>
          <button className='btn btn-outline-primary rounded-2 flex-grow-1' onClick={handleClose}>
            Close
          </button>
        </div>
      </div>
    );
  }

  // Fallback - should not reach here
  return null;
};
