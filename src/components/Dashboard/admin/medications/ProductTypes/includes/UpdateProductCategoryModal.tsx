'use client';

import { validationSchema } from '@/lib/schema/manageProductType';
import { Error, MetaPayload, OptionValue, Response } from '@/lib/types';
import { RootState } from '@/store';
import { useUpdateProductCategoryMutation, useLazyGetMedicineTypesQuery } from '@/store/slices/medicationsApiSlice';
import { isAxiosError } from 'axios';
import { ErrorMessage, Field, FormikProvider, useFormik } from 'formik';
import { Modal, ModalProps, Spinner } from 'react-bootstrap';
import ReactSelect from 'react-select';
import toast from 'react-hot-toast';
import { useMemo, useEffect, useState } from 'react';
import { MedicineType, PlanType, UpdateProductCategoryPayload } from '@/types/medications';
import { useSelector } from 'react-redux';
import { ProductCategory } from '@/store/slices/productCategoriesSlice';

interface Props extends ModalProps {
  selectedCategory?: ProductCategory;
  onSuccess?: (ag: MetaPayload) => Promise<void>;
}

export function UpdateProductCategoryModal({ selectedCategory, onSuccess, ...props }: Readonly<Props>) {
  const search = useSelector((state: RootState) => state.sort.search);
  const sortStatus = useSelector((state: RootState) => state.sort.sortStatus);

  const [medicineTypes, setMedicineTypes] = useState<MedicineType[]>([]);
  const [initialValues, setInitialValues] = useState({
    category: null as OptionValue | null,
    dosageType: null as OptionValue | null,
    planType: PlanType.ONE_TIME,
    summaryText: '',
  });

  const [getMedicineTypes, { isFetching }] = useLazyGetMedicineTypesQuery();

  const [updateProductCategory] = useUpdateProductCategoryMutation();

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setSubmitting(true);

        // Create payload with only changed fields
        const payload: UpdateProductCategoryPayload = { id: selectedCategory?.id || '' };

        if (values.category?.value !== initialValues.category?.value) {
          payload.category = values.category?.value as string;
        }

        if (values.dosageType?.value !== initialValues.dosageType?.value) {
          payload.dosageType = values.dosageType?.value as string;
        }

        if (values.planType !== initialValues.planType) {
          payload.planType = values.planType;
        }

        if (values.summaryText !== initialValues.summaryText) {
          payload.summaryText = values.summaryText;
        }

        // Only proceed if there are changes
        if (Object.keys(payload).length <= 1) {
          // Only has id, no changes
          toast.error('No changes detected');
          setSubmitting(false);
          return;
        }

        const { success, message }: Response = await updateProductCategory(payload).unwrap();

        if (success) {
          await onSuccess?.({ meta: { page: 1, limit: 30 }, search, append: false, sortStatus });
          toast.success('Product type updated successfully!');
          handleClose();
        } else {
          toast.error(message || 'Error while updating product type!');
        }
      } catch (error) {
        if (isAxiosError(error)) {
          toast.error(error.response?.data.message);
        } else {
          toast.error((error as Error).data.message || 'Error while updating product type!');
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  const { values, setFieldValue, setFieldTouched, isSubmitting, resetForm, errors, touched, handleSubmit } = formik;

  function handleClose() {
    resetForm();
    setMedicineTypes([]);
    props.onHide?.();
  }

  const { categoryOptions, dosageTypeOptions } = useMemo(() => {
    const medicineType = medicineTypes?.find((med) => med.name === selectedCategory?.medicineType);

    const categoryOptions: OptionValue[] =
      medicineType?.validCategories.map((title) => ({ value: title, label: title })) || [];
    const dosageTypeOptions: OptionValue[] =
      medicineType?.dosageTypes.map((title) => ({ value: title, label: title })) || [];

    return { categoryOptions, dosageTypeOptions };
  }, [medicineTypes, selectedCategory]);

  useEffect(() => {
    if (selectedCategory) {
      const medicineType = medicineTypes?.find((med) => med.name === selectedCategory.medicineType);
      const newInitialValues = {
        medicineType:
          selectedCategory.medicineType && medicineType ? { value: medicineType?.id, label: medicineType?.name } : null,
        category: selectedCategory.category
          ? { value: selectedCategory.category, label: selectedCategory.category }
          : null,
        dosageType: selectedCategory.dosageType
          ? { value: selectedCategory.dosageType, label: selectedCategory.dosageType }
          : null,
        planType: selectedCategory.planType || PlanType.ONE_TIME,
        summaryText: selectedCategory.summaryText || '',
      };
      setInitialValues(newInitialValues);
    }
  }, [selectedCategory, medicineTypes]);

  useEffect(() => {
    if (props.show && !isFetching && medicineTypes.length === 0) {
      getMedicineTypes({ meta: { page: 1, limit: 999 } })
        .unwrap()
        .then(({ medicineTypes }) => {
          setMedicineTypes(medicineTypes || []);
        })
        .catch((error) => {
          console.log('Error fetching medicine types:', error);
        });
    }
  }, [props.show, isFetching]);
  return (
    <Modal {...props} centered onHide={handleClose}>
      <Modal.Header className='border-0 justify-content-center text-center'>
        <Modal.Title>Update Product Type</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FormikProvider value={formik}>
          <form onSubmit={handleSubmit} className='row g-4'>
            {/* Category Field */}
            <div>
              <label className='form-label'>Categories</label>
              <ReactSelect
                placeholder='Select category...'
                name='category'
                options={categoryOptions}
                value={values.category}
                onChange={(value) => setFieldValue('category', value)}
                onBlur={() => setFieldTouched('category', true)}
                classNames={{
                  control: () => 'w-100 rounded',
                  indicatorSeparator: () => 'd-none',
                }}
              />
              <ErrorMessage name='category' component='div' className='text-danger mt-1 text-sm' />
            </div>

            {/* Dosage Type Field */}
            <div>
              <label className='form-label'>Dosage Types</label>
              <ReactSelect
                placeholder='Select dosage type...'
                name='dosageType'
                options={dosageTypeOptions}
                value={values.dosageType}
                onChange={(value) => setFieldValue('dosageType', value)}
                onBlur={() => setFieldTouched('dosageType', true)}
                classNames={{
                  control: () => 'w-100 rounded',
                  indicatorSeparator: () => 'd-none',
                }}
              />
              <ErrorMessage name='dosageType' component='div' className='text-danger mt-1 text-sm' />
            </div>

            {/* Plan Type Radio Buttons */}
            <div>
              <label className='form-label'>Plan Type</label>
              <div className='d-flex gap-4 flex-wrap'>
                <div className='form-check'>
                  <input
                    type='radio'
                    id='planTypeOneTime'
                    name='planType'
                    value={PlanType.ONE_TIME}
                    checked={values.planType === PlanType.ONE_TIME}
                    onChange={(e) => setFieldValue('planType', e.target.value)}
                    onBlur={() => setFieldTouched('planType', true)}
                    className='form-check-input p-0 shadow-none'
                  />
                  <label htmlFor='planTypeOneTime' className='form-check-label'>
                    One-time Purchase
                  </label>
                </div>
                <div className='form-check'>
                  <input
                    type='radio'
                    id='planTypeRecurring'
                    name='planType'
                    value={PlanType.RECURRING}
                    checked={values.planType === PlanType.RECURRING}
                    onChange={(e) => setFieldValue('planType', e.target.value)}
                    onBlur={() => setFieldTouched('planType', true)}
                    className='form-check-input p-0 shadow-none'
                  />
                  <label htmlFor='planTypeRecurring' className='form-check-label'>
                    Subscription (Recurring)
                  </label>
                </div>
              </div>
              {touched.planType && errors.planType && <div className='text-danger mt-1 text-sm'>{errors.planType}</div>}
            </div>

            <div>
              <label className='form-label'>Summary</label>
              <Field
                as='textarea'
                rows={4}
                placeholder='Enter summary here...'
                name='summaryText'
                className='form-control shadow-none'
              />
              <ErrorMessage name='summaryText' component='div' className='text-danger mt-1 text-sm' />
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
                    disabled={isSubmitting || isFetching}
                    type='submit'
                    className='btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2'
                  >
                    {isSubmitting && <Spinner className='border-2' size='sm' />}
                    Update
                  </button>
                </div>
              </div>
            </div>
          </form>
        </FormikProvider>
      </Modal.Body>
    </Modal>
  );
}
