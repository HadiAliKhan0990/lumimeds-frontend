'use client';

import { validationSchema } from '@/lib/schema/manageProductType';
import { Additional, Error, OptionValue } from '@/lib/types';
import { RootState } from '@/store';
import {
  useCreateProductCategoryMutation,
  useGetMedicineTypesQuery,
  useLazyGetMedicineTypesQuery,
  useLazyGetProductCategoriesQuery,
} from '@/store/slices/medicationsApiSlice';
import { isAxiosError } from 'axios';
import { ErrorMessage, Field, FormikProvider, useFormik } from 'formik';
import { Modal, ModalProps, Spinner } from 'react-bootstrap';
import { AsyncPaginate, LoadOptions } from 'react-select-async-paginate';
import { GroupBase, SingleValue } from 'react-select';
import toast from 'react-hot-toast';
import { useMemo, useCallback, useEffect, useState } from 'react';
import { CreateProductTypePayload, MedicineType, PlanType } from '@/types/medications';
import { useDispatch, useSelector } from 'react-redux';
import { scrollToTop } from '@/lib/helper';
import { setProductCategoriesData } from '@/store/slices/productCategoriesSlice';
import { ReactSelect } from '@/components/elements';

export function CreateProductCategoryModal(props: Readonly<ModalProps>) {
  const dispatch = useDispatch();

  const search = useSelector((state: RootState) => state.sort.search);
  const sortStatus = useSelector((state: RootState) => state.sort.sortStatus);

  const [medicineTypesData, setMedicineTypesData] = useState<MedicineType[]>([]);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const { data: initialMedicineTypes, isFetching: isInitialLoading } = useGetMedicineTypesQuery(
    { meta: { page: 1, limit: 10 } },
    { skip: !props.show }
  );

  const [createProductType] = useCreateProductCategoryMutation();
  const [getProductCategories] = useLazyGetProductCategoriesQuery();
  const [getMedicineTypes, { isFetching }] = useLazyGetMedicineTypesQuery();

  const formik = useFormik({
    initialValues: {
      medicineType: null as OptionValue | null,
      category: null as OptionValue | null,
      dosageType: null as OptionValue | null,
      planType: PlanType.ONE_TIME,
      summaryText: '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async ({ summaryText, medicineType }, { setSubmitting, resetForm }) => {
      try {
        setSubmitting(true);
        const payload = {
          summaryText,
          medicineTypeId: medicineType?.value || '',
          category: formik.values.category?.value || '',
          dosageType: formik.values.dosageType?.value || '',
          planType: formik.values.planType,
        };
        const { success, message } = await createProductType(payload as CreateProductTypePayload).unwrap();
        if (success) {
          const { data } = await getProductCategories({
            meta: { page: 1, limit: 30 },
            search: search || undefined,
            type: sortStatus || undefined,
          });
          const { productTypes = [], meta } = data || {};
          await scrollToTop('medicine_type_table_top');
          dispatch(setProductCategoriesData({ data: productTypes, meta }));
          toast.success('Product type created successfully!');
          resetForm();
          handleClose();
        } else {
          toast.error(message || 'Error while creating product type!');
        }
      } catch (error) {
        if (isAxiosError(error)) {
          toast.error(error.response?.data.message);
        } else {
          toast.error((error as Error).data.message || 'Error while creating product type!');
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  const { values, setFieldValue, setFieldTouched, isValid, isSubmitting, resetForm, errors, touched, handleSubmit } =
    formik;

  function handleClose() {
    resetForm();
    setMedicineTypesData([]);
    setInitialLoadComplete(false);
    props.onHide?.();
  }

  // Memoize the load function to prevent unnecessary re-renders
  const loadMedicineTypes = useCallback<LoadOptions<OptionValue, GroupBase<OptionValue>, Additional>>(
    async (search, _loadedOptions, { page = 1 }: Additional = { page: 1 }) => {
      try {
        const limit = 10;
        const response = await getMedicineTypes({
          meta: { page: search ? 1 : page, limit },
          search: search || undefined,
        }).unwrap();

        const { medicineTypes = [], meta: responseMeta } = response || {};
        const { page: resPage = 1, totalPages = 1 } = responseMeta || {};

        if (page > 1) {
          // Append new medicine types to existing ones
          setMedicineTypesData((prev) => [...prev, ...medicineTypes]);
        } else {
          // Replace medicine types with new ones
          setMedicineTypesData(medicineTypes);
        }

        const options = medicineTypes.map((d) => ({
          value: d.id,
          label: d.name,
        }));

        const hasMore = resPage < totalPages;

        return {
          options,
          hasMore,
          additional: { page: Number(page) + 1 },
        };
      } catch (error) {
        console.error('Error loading medicine types:', error);
        return {
          options: [],
          hasMore: false,
          additional: { page: 1 },
        };
      }
    },
    [getMedicineTypes]
  );

  function handleChangeMedicineType(option: SingleValue<OptionValue>) {
    const { value } = option || {};

    if (value === values.medicineType?.value) {
      const medicineType = medicineTypesData.find((med) => med.id === value);

      setFieldValue(
        'category',
        medicineType?.validCategories[0]
          ? { label: medicineType?.validCategories[0], value: medicineType?.validCategories[0] }
          : null
      );
      setFieldValue(
        'dosageType',
        medicineType?.dosageTypes[0]
          ? { label: medicineType?.dosageTypes[0], value: medicineType?.dosageTypes[0] }
          : null
      );
    } else {
      setFieldValue('category', null);
      setFieldTouched('category', false);
      setFieldValue('dosageType', null);
      setFieldTouched('dosageType', false);
    }

    setFieldValue('medicineType', option);
  }

  const { categoryOptions, dosageTypeOptions } = useMemo(() => {
    const medicineType = medicineTypesData.find((med) => med.id === values.medicineType?.value);

    const categoryOptions: OptionValue[] =
      medicineType?.validCategories.map((title) => ({ value: title, label: title })) || [];
    const dosageTypeOptions: OptionValue[] =
      medicineType?.dosageTypes.map((title) => ({ value: title, label: title })) || [];

    return { categoryOptions, dosageTypeOptions };
  }, [medicineTypesData, values.medicineType]);

  // Initialize medicine types when modal opens
  useEffect(() => {
    if (initialMedicineTypes && !isInitialLoading && !initialLoadComplete) {
      setInitialLoadComplete(true);
      setMedicineTypesData(initialMedicineTypes.medicineTypes || []);
    }
  }, [initialMedicineTypes, isInitialLoading, initialLoadComplete]);

  return (
    <Modal {...props} centered onHide={handleClose}>
      <Modal.Header className='border-0 justify-content-center text-center'>
        <Modal.Title>Add Product Type</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FormikProvider value={formik}>
          <form onSubmit={handleSubmit} className='row g-4'>
            {/* Medicine Type Field */}
            <div>
              <label className='form-label'>Medicine Type</label>
              <AsyncPaginate
                value={values.medicineType}
                isLoading={isFetching || isInitialLoading}
                loadOptions={loadMedicineTypes}
                additional={{ page: 1 }}
                onChange={handleChangeMedicineType}
                isSearchable={true}
                onBlur={() => setFieldTouched('medicineType', true)}
                name='medicineType'
                debounceTimeout={750}
                placeholder='Select Medicine Type'
                defaultOptions={initialLoadComplete}
                cacheUniqs={[initialLoadComplete]}
                classNames={{
                  control: () => 'w-100 rounded',
                  indicatorSeparator: () => 'd-none',
                }}
                key={initialLoadComplete ? 'loaded' : 'loading'}
              />
              <ErrorMessage name='medicineType' component='div' className='text-danger mt-1 text-sm' />
            </div>

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
                    disabled={!isValid || isSubmitting}
                    type='submit'
                    className='btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2'
                  >
                    {isSubmitting && <Spinner className='border-2' size='sm' />}
                    Add
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
