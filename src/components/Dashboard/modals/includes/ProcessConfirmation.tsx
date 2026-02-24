'use client';

import { setModal } from '@/store/slices/modalSlice';
import { setProcessWith, setSelectedOrder, useProcessWith, useSelectedOrder } from '@/store/slices/orderPaymentSlice';
import { OrderToProviderPayload, useSendOrderToProviderMutation } from '@/store/slices/ordersApiSlice';
import { Spinner } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';

interface Error {
  data: {
    data: null;
    message: string | null;
    statusCode: number;
    success: boolean;
  };
}

export const ProcessConfirmation = () => {
  const dispatch = useDispatch();
  const processWith = useProcessWith();
  const order = useSelectedOrder();

  const [mutateAsync, { isLoading }] = useSendOrderToProviderMutation();

  function handleClose() {
    dispatch(setModal({ modalType: undefined }));
    dispatch(setSelectedOrder(undefined));
    dispatch(setProcessWith(undefined));
  }

  async function handleSubmit() {
    try {
      const payload = { provider: processWith, patientId: order?.patient?.id };
      const { data, error } = await mutateAsync(payload as OrderToProviderPayload);
      if (error) {
        toast.error((error as Error).data.message);
      } else {
        toast.success(data.message);
        handleClose();
      }
    } catch (error) {
      toast.error((error as Error).data.message);
    }
  }

  return (
    <div className='py-2 px-3'>
      <p className='text-2xl fw-medium text-center'>Process Confirmation</p>
      <p className='my-4 text-center'>
        Are you sure you want to process this Order {`with "`}
        <span className='fw-bold text-capitalize'>{processWith}</span>
        {`"?`}
      </p>
      <div className='d-flex align-items-center gap-3'>
        <button className='btn btn-outline-primary rounded-2 flex-grow-1' onClick={handleClose}>
          No
        </button>
        <button onClick={handleSubmit} className='btn btn-primary rounded-2 flex-grow-1 d-flex align-items-center justify-content-center gap-2' disabled={isLoading}>
          {isLoading && <Spinner size='sm' />}
          Yes
        </button>
      </div>
    </div>
  );
};
