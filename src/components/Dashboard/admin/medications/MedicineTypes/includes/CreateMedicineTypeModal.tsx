'use client';

import { dosageTypesOptions } from '@/constants/medications';
import { validationSchema } from '@/lib/schema/manageMedicineType';
import { Error, OptionValue } from '@/lib/types';
import { RootState } from '@/store';
import { useCreateMedicineTypeMutation, useLazyGetMedicineTypesQuery } from '@/store/slices/medicationsApiSlice';
import { setMedicineTypesData } from '@/store/slices/medicineTypesSlice';
import { isAxiosError } from 'axios';
import { useFormik } from 'formik';
import { Modal, ModalProps, Spinner } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import CreatableSelect from 'react-select/creatable';

export function CreateMedicineTypeModal(props: Readonly<ModalProps>) {
  const dispatch = useDispatch();

  const search = useSelector((state: RootState) => state.sort.search);
  const medicineTypesData = useSelector((state: RootState) => state.medicineTypes);
  const { medicineTypes: prevMedicineTypes, meta } = medicineTypesData || {};

  const [createMedicineType] = useCreateMedicineTypeMutation();
  const [getMedicineTypes] = useLazyGetMedicineTypesQuery();

  const formik = useFormik({
    initialValues: {
      name: '',
      categories: [] as OptionValue[],
      dosageTypes: [] as OptionValue[],
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async ({ name, categories, dosageTypes }, { setSubmitting, resetForm }) => {
      try {
        setSubmitting(true);
        const payload = {
          name,
          validCategories: categories.map((item) => item.value as string),
          dosageTypes: dosageTypes.map((item) => item.value as string),
        };

        const { data, error } = await createMedicineType(payload);
        if (error) {
          toast.error((error as Error).data.message);
        } else {
          const res = await getMedicineTypes({ meta, search }).unwrap();
          const { medicineTypes, meta: metaData } = res || {};
          const { page = 1 } = metaData || {};

          if (page > 1) {
            const array = [...prevMedicineTypes, ...medicineTypes];
            dispatch(setMedicineTypesData({ meta: metaData, medicineTypes: array }));
          } else {
            dispatch(setMedicineTypesData(res));
          }

          resetForm();
          toast.success(data?.message || 'Medicine Type Created Successfully!');
          props.onHide?.();
        }
      } catch (error) {
        if (isAxiosError(error)) {
          toast.error(error.response?.data.message);
        } else {
          toast.error((error as Error).data.message || 'Error while creating medicine type!');
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

  return (
    <Modal {...props} centered>
      <Modal.Header className='border-0 justify-content-center text-center'>
        <Modal.Title>Add Medicine Type</Modal.Title>
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
              options={[]}
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
                  disabled={!formik.isValid || formik.isSubmitting}
                  type='submit'
                  className='btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2'
                >
                  {formik.isSubmitting && <Spinner className='border-2' size='sm' />}
                  Add
                </button>
              </div>
            </div>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
}
