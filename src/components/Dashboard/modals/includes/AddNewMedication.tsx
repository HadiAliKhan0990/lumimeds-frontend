import React from 'react';
import Select from '../../Select';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useForm } from 'react-hook-form';
import { medicationBodySchema, MedicationBodySchema } from '@/lib/schema/medication';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAddMedicationMutation } from '@/store/slices/medicationsApiSlice';
import toast from 'react-hot-toast';
import { setModal } from '@/store/slices/modalSlice';
import Spinner from '@/components/Spinner';

export const AddNewMedication = () => {
  const dispatch = useDispatch();

  const productTypes = useSelector((state: RootState) => state.productTypes);
  const pharmacies = useSelector((state: RootState) => state.pharmacies);
  const [addMedicationMutation, { isLoading }] = useAddMedicationMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MedicationBodySchema>({
    defaultValues: {
      description: '',
      monthlyDosage: 0,
      weeklyDosage: 0,
      pharmacyId: '',
      productTypeId: '',
    },
    mode: 'onSubmit',
    resolver: yupResolver(medicationBodySchema),
  });

  const handleReset = () => {
    reset();
    dispatch(setModal({ modalType: undefined }));
  };

  const handleAddNewMedication = (data: MedicationBodySchema) => {
    const { weeklyDosage, monthlyDosage, ...rest } = data;
    addMedicationMutation({
      weeklyDosage: `${weeklyDosage}mg`,
      monthlyDosage: `${monthlyDosage}mg`,
      ...rest,
    })
      .then(() => {
        toast.success('Medication added!', {
          position: 'top-right',
          duration: 3000,
        });
        handleReset();
      })
      .catch((err) => {
        console.error(err);
        toast.error('Error adding Medication!', {
          position: 'top-right',
          duration: 3000,
        });
      });
  };

  return (
    <>
      <p className='fw-medium'>Add New Medication</p>
      <form
        onSubmit={handleSubmit(handleAddNewMedication)}
        method='POST'
        style={{ display: 'flex', flexDirection: 'column', rowGap: '24px' }}
      >
        <div>
          <label htmlFor='productTypeId'>Type</label>
          <Select
            {...register('productTypeId')}
            style={{
              width: '100%',
              borderRadius: '12px',
              border: '1px solid #D6E4FF',
            }}
          >
            <option value='' disabled>
              Select a product
            </option>
            {productTypes.map((type) => (
              <option key={type.id} value={type.id ?? ''}>
                {type.name}
              </option>
            ))}
          </Select>
          {!!errors.productTypeId && (
            <span style={{ color: 'red', fontSize: '12px' }}>{errors.productTypeId.message}</span>
          )}
        </div>
        <div>
          <label htmlFor='description'>Product Description</label>
          <input
            type='text'
            {...register('description')}
            style={{
              borderRadius: '12px',
              border: '1px solid #D6E4FF',
              color: 'black',
            }}
          />
          {!!errors.description && <span style={{ color: 'red', fontSize: '12px' }}>{errors.description.message}</span>}
        </div>
        <div style={{ display: 'flex', columnGap: '12px' }}>
          <div>
            <label htmlFor='weeklyDosage'>Weekly Dosage (in mg)</label>
            <input
              type='number'
              {...register('weeklyDosage')}
              id=''
              step='0.01'
              style={{
                borderRadius: '12px',
                border: '1px solid #D6E4FF',
                color: 'black',
              }}
              inputMode='decimal'
            // pattern="[0-9]*"
            />
            {!!errors.weeklyDosage && (
              <span style={{ color: 'red', fontSize: '12px' }}>{errors.weeklyDosage.message}</span>
            )}
          </div>
          <div>
            <label htmlFor='monthlyDosage'>Monthly Dosage (in mg)</label>
            <input
              type='number'
              {...register('monthlyDosage')}
              id=''
              step='0.01'
              style={{
                borderRadius: '12px',
                border: '1px solid #D6E4FF',
                color: 'black',
              }}
              inputMode='decimal'
            // pattern="[0-9]*"
            />
            {!!errors.monthlyDosage && (
              <span style={{ color: 'red', fontSize: '12px' }}>{errors.monthlyDosage.message}</span>
            )}
          </div>
        </div>
        <div>
          <label htmlFor='pharmacyId'>Pharmacy</label>
          <Select
            {...register('pharmacyId')}
            style={{
              width: '100%',
              borderRadius: '12px',
              border: '1px solid #D6E4FF',
            }}
          >
            <option value='' disabled>
              Select a pharmacy
            </option>
            {pharmacies.map((pharmacy) => (
              <option key={pharmacy.id} value={pharmacy.id ?? ''}>
                {pharmacy.name}
              </option>
            ))}
          </Select>
          {!!errors.pharmacyId && <span style={{ color: 'red', fontSize: '12px' }}>{errors.pharmacyId.message}</span>}
        </div>
        <div className='d-flex align-items-center gap-3'>
          <button
            disabled={isSubmitting || isLoading}
            onClick={handleReset}
            className='btn btn-outline-primary rounded-1 flex-grow-1'
          >
            Discard
          </button>
          <button
            disabled={isSubmitting || isLoading}
            type='submit'
            className='btn btn-primary rounded-1 flex-grow-1 d-flex align-items-center justify-content-center gap-2'
          >
            {(isSubmitting || isLoading) && <Spinner />}
            Add
          </button>
        </div>
      </form>
    </>
  );
};
