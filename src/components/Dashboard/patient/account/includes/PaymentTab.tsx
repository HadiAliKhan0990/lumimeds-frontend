'use client';

import ConfirmationModal from '@/components/ConfirmationModal';
import toast from 'react-hot-toast';
import { IoMdAdd } from 'react-icons/io';
import { FaCreditCard } from 'react-icons/fa';
import { PaymentMethodCard } from '@/components/Dashboard/patient/account/includes/PaymentMethodCard';
import {
  UpdatePaymentMethodPayload,
  useDeletePaymentMethodMutation,
  useUpdatePaymentMethodMutation,
} from '@/store/slices/patientPaymentApiSlice';
import { useState, useTransition } from 'react';
import { Error } from '@/lib/types';
import { isAxiosError } from 'axios';
import { createPaymentToken } from '@/services/paymentMethod';
import { Spinner } from 'react-bootstrap';
import { UnableToRemoveModal } from '@/components/Dashboard/patient/account/includes/UnableToRemoveModal';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants';
import { GetPaymentMethodsResponseData } from '@/services/paymentMethod/types';
import { AddAddressModal } from '@/components/Dashboard/patient/components/AddAddressModal';

interface Props {
  data?: GetPaymentMethodsResponseData;
}

export function PaymentTab({ data }: Readonly<Props>) {
  const { paymentMethods = [], currentPaymentMethodId } = data || {};

  const { push, refresh } = useRouter();

  const [mutateAsync, { isLoading }] = useUpdatePaymentMethodMutation();
  const [deletePaymentMethod, { isLoading: isDeleting }] = useDeletePaymentMethodMutation();

  const [open, setOpen] = useState(false);
  const [selectedMethodId, setSelectedMethodId] = useState('');
  const [loading, setLoading] = useState(false);
  const [openDeleteConfirmationModal, setOpenDeleteConfirmationModal] = useState(false);
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);

  const [isRouting, startTransition] = useTransition();

  function handleClose() {
    setOpen(false);
  }

  async function handleSubmit(address?: UpdatePaymentMethodPayload['address']) {
    try {
      const { success, message, statusCode } = await mutateAsync({
        id: selectedMethodId,
        ...(address && { address }),
      }).unwrap();

      if (success) {
        toast.success(message || 'Payment Method updated successfully!');
        refresh();
        handleClose();

        if (address) {
          setShowAddAddressModal(false);
        }
      } else if (statusCode === 418) {
        handleClose();
        setShowAddAddressModal(true);
      } else {
        toast.error(message || 'Error while updating payment method!');
      }
    } catch (error) {
      const { statusCode, message } = isAxiosError(error) ? error.response?.data : (error as Error).data;
      if (statusCode === 418) {
        handleClose();
        setShowAddAddressModal(true);
      } else {
        toast.error(message || 'Error while updating payment method!');
      }
    }
  }

  async function handleCreate() {
    try {
      setLoading(true);
      const { data } = await createPaymentToken();
      if (data.data) {
        startTransition(() => {
          push(`${ROUTES.PATIENT_ACCOUNT}/${data?.data?.token}`);
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    try {
      const { success, message } = await deletePaymentMethod(selectedMethodId).unwrap();

      if (success) {
        toast.success(message || 'Payment Method deleted successfully!');
        refresh();
      } else {
        toast.error(message || 'Error while deleting payment method!');
      }
    } catch (error) {
      toast.error(
        isAxiosError(error)
          ? error.response?.data.message
          : (error as Error).data.message || 'Error while deleting payment method!'
      );
    } finally {
      setOpenDeleteConfirmationModal(false);
    }
  }
  return (
    <>
      <div className='d-flex align-items-center justify-content-between mb-4 gap-2 flex-wrap'>
        <span className='text-4xl'>Payment Methods</span>
        <button
          type={'button'}
          onClick={handleCreate}
          disabled={loading || isRouting}
          className='btn btn-outline-primary d-flex align-items-center justify-content-center gap-2 tw-w-full sm:tw-w-auto'
        >
          {loading || isRouting ? <Spinner size='sm' /> : <IoMdAdd />}
          Add New Payment Method
        </button>
      </div>
      <p className='text-sm fst-italic mb-5'>
        By proceeding, you authorize Lumimeds to securely store your selected payment method and charge it according to
        your selected plan’s billing cycle. You may update or cancel your payment method at any time in your account
        settings.
      </p>
      <div className='d-flex flex-column gap-4'>
        {paymentMethods.length > 0 ? (
          paymentMethods.map((item) => (
            <PaymentMethodCard
              key={item.id}
              card={item}
              selected={currentPaymentMethodId === item.id}
              onChange={(id) => {
                setSelectedMethodId(id);
                setOpen(true);
              }}
              onClickRemove={() => {
                if (currentPaymentMethodId === item.id) {
                  setOpenErrorModal(true);
                } else {
                  setSelectedMethodId(item.id);
                  setOpenDeleteConfirmationModal(true);
                }
              }}
            />
          ))
        ) : (
          <div className='text-center py-5'>
            <div className='mb-3'>
              <FaCreditCard size={64} className='mx-auto text-muted' />
            </div>
            <h5 className='text-muted mb-2'>No Payment Methods Found</h5>
            <p className='text-muted mb-4'>
              You haven&apos;t added any payment methods yet. Click the &quot;Add New Payment Method&quot; button above
              to get started.
            </p>
          </div>
        )}
      </div>

      {/* Modals */}

      <UnableToRemoveModal show={openErrorModal} onHide={() => setOpenErrorModal(false)} />

      <ConfirmationModal
        title='Change Payment Method'
        message='Are you sure you want to change the payment method?'
        show={open}
        onHide={handleClose}
        confirmLabel='Change'
        cancelLabel='Cancel'
        onConfirm={() => handleSubmit()}
        loading={isLoading}
      />

      <AddAddressModal
        open={showAddAddressModal}
        onClose={() => setShowAddAddressModal(false)}
        onSaveAddress={handleSubmit}
        isSubmitting={isLoading}
      />

      <ConfirmationModal
        title='Delete Payment Method'
        message='Are you sure you want to delete payment method?'
        show={openDeleteConfirmationModal}
        onHide={() => setOpenDeleteConfirmationModal(false)}
        confirmLabel='Delete'
        cancelLabel='Cancel'
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </>
  );
}
