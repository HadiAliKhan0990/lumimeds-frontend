'use client';

import { dosageTypesOptions } from '@/constants/medications';
import { validationSchema } from '@/lib/schema/manageMedicineType';
import { Error, MetaPayload, OptionValue } from '@/lib/types';
import { useUpdateMedicineTypeMutation } from '@/store/slices/medicationsApiSlice';
import { MedicineType, UpdateMedicineTypePayload } from '@/types/medications';
import { isAxiosError } from 'axios';
import { useFormik } from 'formik';
import { Modal, ModalProps, Spinner } from 'react-bootstrap';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import CreatableSelect from 'react-select/creatable';

interface Props extends ModalProps {
  onSuccess: (ag: MetaPayload) => Promise<void>;
  selectedMedicineType?: MedicineType;
}

export function UpdateManageMedicineTypeModal({ onSuccess, selectedMedicineType, ...props }: Readonly<Props>) {
  const [updateMedicineType] = useUpdateMedicineTypeMutation();
  const [initialValues, setInitialValues] = useState({
    name: '',
    categories: [] as OptionValue[],
    dosageTypes: [] as OptionValue[],
  });

  const { id = '', name = '', dosageTypes, validCategories } = selectedMedicineType || {};

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        // Check if any field has changed
        const hasChanges =
          values.name !== initialValues.name ||
          JSON.stringify(values.categories) !== JSON.stringify(initialValues.categories) ||
          JSON.stringify(values.dosageTypes) !== JSON.stringify(initialValues.dosageTypes);

        if (!hasChanges) {
          toast.error('No changes detected. Please modify at least one field to update.');
          return;
        }

        setSubmitting(true);

        // Build payload with only changed fields
        const payload = {
          id,
        } as UpdateMedicineTypePayload;

        // Only include fields that have changed
        if (values.name !== initialValues.name) {
          payload.name = values.name;
        }

        if (JSON.stringify(values.categories) !== JSON.stringify(initialValues.categories)) {
          payload.categoryNames = values.categories.map((item) => item.value as string);
        }

        if (JSON.stringify(values.dosageTypes) !== JSON.stringify(initialValues.dosageTypes)) {
          payload.dosageTypes = values.dosageTypes.map((item) => item.value as string);
        }

        const { data, error } = await updateMedicineType(payload);
        if (error) {
          toast.error((error as Error).data.message);
        } else {
          await onSuccess({ meta: { page: 1, limit: 30 } });
          resetForm();
          toast.success(data?.message || 'Medicine Type Updated Successfully!');
          props.onHide?.();
        }
      } catch (error) {
        if (isAxiosError(error)) {
          toast.error(error.response?.data.message);
        } else {
          toast.error((error as Error).data.message || 'Error while updating medicine type!');
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Handler for creating new options
  const handleCreateCategory = (inputValue: string) => {
    const newOption = { value: inputValue, label: inputValue };
    formik.setFieldValue('categories', [...formik.values.categories, newOption]);
  };

  const handleCreateDosageType = (inputValue: string) => {
    const newOption = { value: inputValue, label: inputValue };
    formik.setFieldValue('dosageTypes', [...formik.values.dosageTypes, newOption]);
  };

  function handleClose() {
    formik.resetForm();
    props.onHide?.();
  }

  const productCategories = useMemo(
    () => selectedMedicineType?.validCategories.map((title) => ({ value: title, label: title })) || [],
    [selectedMedicineType]
  );

  useEffect(() => {
    if (selectedMedicineType) {
      const newInitialValues = {
        name,
        categories: (validCategories?.map((title) => ({ value: title, label: title })) as OptionValue[]) || [],
        dosageTypes: (dosageTypes?.map((title) => ({ value: title, label: title })) as OptionValue[]) || [],
      };
      setInitialValues(newInitialValues);
    }
  }, [selectedMedicineType, name, validCategories, dosageTypes]);
  return (
    <Modal {...props} centered>
      <Modal.Header className='border-0 justify-content-center text-center'>
        <Modal.Title>Update Medicine Type</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={formik.handleSubmit} className='row g-4'>
          {/* Name Field */}
          <div>
            <label className='form-label'>Name</label>
            <input
              type='text'
              placeholder='Enter medicine type name'
              name='name'
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className='form-control shadow-none'
            />
            {formik.touched.name && formik.errors.name && (
              <div className='text-danger mt-1 text-sm'>{formik.errors.name}</div>
            )}
          </div>

          {/* Categories with Creatable */}
          <div>
            <label className='form-label'>Categories</label>
            <CreatableSelect
              isMulti
              isClearable
              placeholder='Select or create categories...'
              name='categories'
              options={productCategories}
              value={formik.values.categories}
              onChange={(value) => formik.setFieldValue('categories', value)}
              onBlur={() => formik.setFieldTouched('categories', true)}
              onCreateOption={handleCreateCategory}
              formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
              classNames={{
                control: () => 'w-100 rounded',
                indicatorSeparator: () => 'd-none',
              }}
            />
            {formik.touched.categories && formik.errors.categories && (
              <div className='text-danger mt-1 text-sm'>{formik.errors.categories as string}</div>
            )}
          </div>

          {/* Dosage Types with Creatable */}
          <div>
            <label className='form-label'>Dosage Types</label>
            <CreatableSelect
              isMulti
              isClearable
              placeholder='Select or create dosage types...'
              name='dosageTypes'
              options={dosageTypesOptions}
              value={formik.values.dosageTypes}
              onChange={(value) => formik.setFieldValue('dosageTypes', value)}
              onBlur={() => formik.setFieldTouched('dosageTypes', true)}
              onCreateOption={handleCreateDosageType}
              formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
              classNames={{
                control: () => 'w-100 rounded',
                indicatorSeparator: () => 'd-none',
              }}
            />
            {formik.touched.dosageTypes && formik.errors.dosageTypes && (
              <div className='text-danger mt-1 text-sm'>{formik.errors.dosageTypes as string}</div>
            )}
          </div>

          {/* Buttons */}
          <div className='col-12'>
            <div className='row gx-3 mt-3'>
              <div className='col-6'>
                <button type='button' onClick={handleClose} className='btn btn-outline-primary w-100'>
                  Discard
                </button>
              </div>
              <div className='col-6'>
                <button
                  disabled={formik.isSubmitting}
                  type='submit'
                  className='btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2'
                >
                  {formik.isSubmitting && <Spinner className='border-2' size='sm' />}
                  Update
                </button>
              </div>
            </div>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
}
