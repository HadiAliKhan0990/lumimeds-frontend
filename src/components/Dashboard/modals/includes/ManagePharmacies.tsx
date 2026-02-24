import Spinner from '@/components/Spinner';
import { pharmacySchema, PharmacySchema } from '@/lib/schema/pharmacy';
import { RootState } from '@/store';
import { setModal } from '@/store/slices/modalSlice';
import { useAddPharmacyMutation, useDeletePharmacyMutation } from '@/store/slices/pharmaciesApiSlice';
import { yupResolver } from '@hookform/resolvers/yup';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { CiCircleMinus } from 'react-icons/ci';
import { useDispatch, useSelector } from 'react-redux';

export function ManagePharmacies() {
  const dispatch = useDispatch();

  const pharmacies = useSelector((state: RootState) => state.pharmacies);

  const [showNewPharmacy, setShowNewPharmacy] = useState<boolean>(false);

  const [deletePharmacyMutation] = useDeletePharmacyMutation();
  const [addPharmacyMutation, { isLoading }] = useAddPharmacyMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PharmacySchema>({
    defaultValues: {
      name: '',
    },
    resolver: yupResolver(pharmacySchema),
  });

  const handleRemove = (id: string) => {
    deletePharmacyMutation(id);
  };

  const handleAddMedicationSubmit = (data: PharmacySchema) => {
    addPharmacyMutation(data.name)
      .then(() => {
        reset();
        toast.success('Pharmacy added!', { duration: 6000 });
      })
      .catch((err) => {
        console.error(err);
        toast.error('Error adding Pharmacy!', { duration: 6000 });
      });
  };

  const handleAdd = () => setShowNewPharmacy(true);

  const handleClose = () => {
    dispatch(setModal({ modalType: undefined }));
    reset();
    setShowNewPharmacy(false);
  };

  return (
    <>
      <p className='fw-medium'>Manage Pharmacies</p>
      <div
        style={{
          overflowY: 'auto',
          maxHeight: '300px',
          display: 'flex',
          flexDirection: 'column',
          rowGap: '8px',
          marginBottom: '64px',
          borderBottom: '1px solid #EAEAEA',
        }}
      >
        {pharmacies.map((pharmacy) => (
          <div
            key={pharmacy.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px',
              border: '1px solid #D6E4FF',
              borderRadius: '6px',
            }}
          >
            <p className='m-0' style={{ color: '#7E7E7E', fontSize: '12px' }}>
              {pharmacy.name}
            </p>
            <button
              onClick={() => handleRemove(pharmacy.id ?? '')}
              style={{
                padding: 0,
                background: 'transparent',
                border: 0,
                color: 'red',
              }}
            >
              <CiCircleMinus />
            </button>
          </div>
        ))}
      </div>
      {showNewPharmacy && (
        <form className='mb-4' onSubmit={handleSubmit(handleAddMedicationSubmit)}>
          <div className='mb-4'>
            <label className='form-label' htmlFor='name'>
              Pharmacy Name
            </label>
            <input
              type='text'
              {...register('name')}
              style={{
                borderRadius: '12px',
                border: '1px solid #D6E4FF',
                color: 'black',
              }}
            />
            {!!errors.name && <span className='invalid-feedback d-block text-xs'>{errors.name.message}</span>}
          </div>
          <button
            type='submit'
            className='btn btn-primary rounded-1 w-100 d-flex align-items-center justify-content-center gap-2'
            disabled={isLoading}
          >
            {isLoading && <Spinner />}
            Add
          </button>
        </form>
      )}
      {!showNewPharmacy && (
        <button
          onClick={handleAdd}
          style={{
            background: 'transparent',
            color: '#3060FE',
            border: 0,
            padding: 0,
            fontSize: '12px',
            fontWeight: 'bold',
            marginBottom: '24px',
          }}
        >
          <span style={{ textDecoration: 'underline' }}>Add New </span>
          <span>+</span>
        </button>
      )}
      <button onClick={handleClose} className='btn btn-primary rounded-1 w-100'>
        Close
      </button>
    </>
  );
}
