'use client';

import { Error } from '@/lib/types';
import { RootState } from '@/store';
import { setModal } from '@/store/slices/modalSlice';
import { useUpdateOrderMutation } from '@/store/slices/ordersApiSlice';
import { setDosage } from '@/store/slices/updateOrderSlice';
import { Spinner } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';

export const PharmacyConfirmation = () => {
  const dispatch = useDispatch();

  const order = useSelector((state: RootState) => state.updateOrder.order);
  const pharmacy = useSelector((state: RootState) => state.updateOrder.pharmacy);

  const selectedPharmacy = order?.pharmacies.find((item) => item.name === pharmacy);

  const [mutateAsync, { isLoading }] = useUpdateOrderMutation();

  function handleClose() {
    dispatch(setModal({ modalType: undefined }));
  }

  async function handleSubmit() {
    try {
      const { error, data } = await mutateAsync({ id: order?.id || '', requestedPharmacyId: selectedPharmacy?.id });
      if (error) {
        toast.error((error as Error).data.message);
      } else {
        toast.success(data?.message || 'Pharmacy Updated Successfully');
        dispatch(setModal({ modalType: undefined }));
        dispatch(setDosage(undefined));
      }
    } catch (error) {
      toast.error((error as Error).data.message);
    }
  }

  return (
    <div className='py-1'>
      <p className='text-2xl fw-medium text-center'>
        Change Pharmacy to &quot;<span className='text-capitalize'>{pharmacy}</span>&quot;?
      </p>
      <p className='my-4 text-center text-placeholder'>
        Are you sure you want change pharmacy to &quot;<span className='fw-medium text-dark text-capitalize'>{pharmacy}</span>&quot;?
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
