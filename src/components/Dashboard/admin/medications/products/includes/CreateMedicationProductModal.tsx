'use client';

import toast from 'react-hot-toast';
import { useMemo, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Field, FieldProps, FormikHelpers, useFormik, FormikProvider } from 'formik';
import { RiCloseLargeLine } from 'react-icons/ri';
import { Button, Col, Form, Modal, ModalProps, Row, Spinner } from 'react-bootstrap';
import { RootState } from '@/store';
import { ProductDropzone } from '@/components/Dashboard/ProductDropzone';
import { createMedicationProductSchema as validationSchema, FormValues } from '@/schemas/medicationProduct';
import {
  useCreateNewProductMutation,
  useGetProductCategoriesQuery,
  useLazyGetMedicationsProductsListQuery,
} from '@/store/slices/medicationsApiSlice';
import { AsyncImage } from 'loadable-image';
import { Blur } from 'transitions-kit';
import { Error, Response } from '@/lib/types';
import { isAxiosError } from 'axios';
import { BillingInterval, PlanType } from '@/types/medications';
import { createFormDataFromObjectSimple, formatFileSize } from '@/lib/helper';
import { FORM_FIELDS } from '@/constants/medications';
import { createImagePreviewUrl, revokeImagePreviewUrl } from '@/helpers/medicationProduct';
import { ReactSelect } from '@/components/elements';
import { useGetProductSurveysQuery } from '@/store/slices/surveysApiSlice';
import { OptionValue } from '@/lib/types';

type FormOption = OptionValue & { isSubmissionRequired?: boolean };

export const CreateMedicationProductModal = ({ onHide, ...props }: Readonly<ModalProps>) => {
  const imagePreviewUrlRef = useRef<string | null>(null);

  const meta = useSelector((state: RootState) => state.medicationsProducts.products?.meta);
  const sortStatus = useSelector((state: RootState) => state.sort.sortStatus);
  const sortField = useSelector((state: RootState) => state.sort.sortField);
  const sortOrder = useSelector((state: RootState) => state.sort.sortOrder);
  const search = useSelector((state: RootState) => state.sort.search);

  // API hooks
  const [triggerMedicationsProductsList] = useLazyGetMedicationsProductsListQuery();
  const [createNewProduct] = useCreateNewProductMutation();

  const { data: categoriesData, isFetching: categoriesLoading } = useGetProductCategoriesQuery(
    { meta: { page: 1, limit: 999 } },
    { skip: !props.show }
  );

  const { data: intakeSurveysData, isFetching: intakeSurveysLoading } = useGetProductSurveysQuery(
    { type: 'INTAKE', page: 1, limit: 100, sortBy: 'name', sortOrder: 'ASC' },
    { skip: !props.show }
  );

  const { data: productRefillSurveysData, isFetching: productRefillSurveysLoading } = useGetProductSurveysQuery(
    { type: 'PRODUCT_REFILL', page: 1, limit: 100, sortBy: 'name', sortOrder: 'ASC' },
    { skip: !props.show }
  );

  const { data: otherFormsSurveysData, isFetching: otherFormsSurveysLoading } = useGetProductSurveysQuery(
    { type: 'PRODUCT', page: 1, limit: 100, sortBy: 'name', sortOrder: 'ASC' },
    { skip: !props.show }
  );

  const { surveys: intakeSurveys } = intakeSurveysData || {};
  const { surveys: productRefillSurveys } = productRefillSurveysData || {};
  const { surveys: otherFormsSurveys } = otherFormsSurveysData || {};

  const initialValues: FormValues = {
    description: '',
    openpayProductId: '',
    telegraId: '',
    telepathId: '',
    image: undefined,
    category: null,
    intakeFormId: null,
    refillFormId: null,
    renewalFormId: null,
    otherForms: [],
    planTier: '',
    duration: undefined,
    isIntakeFormRequired: false,
  };

  const productCategoriesOptions = useMemo(() => {
    if (!categoriesData?.productTypes) return [];

    return categoriesData.productTypes.map((item) => ({
      label: `${item.category} - ${item.planType === PlanType.ONE_TIME ? 'One Time Purchase' : 'Subscription'}`,
      value: item.id,
    }));
  }, [categoriesData]);

  const intakeSurveyOptions = useMemo(() => {
    if (!intakeSurveys || intakeSurveys.length === 0) return [];

    return intakeSurveys.map((survey) => ({
      label: survey.name || 'Untitled Intake Survey',
      value: survey.id,
    }));
  }, [intakeSurveys]);

  const refillSurveyOptions = useMemo(() => {
    if (!productRefillSurveys || productRefillSurveys.length === 0) return [];

    return productRefillSurveys.map((survey) => ({
      label: survey.name || 'Untitled Refill Survey',
      value: survey.id,
    }));
  }, [productRefillSurveys]);

  const otherFormsOptions = useMemo(() => {
    if (!otherFormsSurveys || otherFormsSurveys.length === 0) return [];

    return otherFormsSurveys.map((survey) => ({
      label: survey.name || 'Untitled Survey',
      value: survey.id,
    }));
  }, [otherFormsSurveys]);

  const updateListing = async ({ success, message }: Response) => {
    if (success) {
      await triggerMedicationsProductsList({
        search,
        sortField,
        sortOrder,
        meta,
        ...(sortStatus && { sortStatus }),
      });
      toast.success('Product added successfully!');
      handleClose();
    } else {
      toast.error(message);
    }
  };

  const onSubmit = async (formValues: FormValues, { setSubmitting, setFieldError }: FormikHelpers<FormValues>) => {
    console.log('✅ onSubmit FUNCTION CALLED!');
    console.log('Form values received:', formValues);
    
    try {
      setSubmitting(true);
      console.log('Submitting set to true');

      const {
        openpayProductId,
        telegraId,
        telepathId,
        category,
        duration: billingIntervalCount,
        planTier,
        image,
        intakeFormId,
        refillFormId,
        renewalFormId,
        otherForms,
        isIntakeFormRequired,
        ...values
      } = formValues;

      // Validate required image
      if (!image) {
        console.log('Image validation failed');
        setFieldError('image', 'Please upload an image of the product. This helps users identify product visually.');
        toast.error('Please upload an image of the product. This helps users identify product visually.');
        return;
      }
      
      console.log('Validation passed, creating payload...');

      const payload = {
        ...values,
        image,
        categoryId: category?.value,
        billingIntervalCount,
        billingInterval: BillingInterval.MONTH,
        ...(planTier && { planTier }),
        ...(openpayProductId && { openpayProductId }),
        ...(telegraId && { telegraId }),
        ...(telepathId && { telepathId }),
        ...(intakeFormId?.value && { intakeFormId: intakeFormId.value }),
        ...(refillFormId?.value && { refillFormId: refillFormId.value }),
        ...(renewalFormId?.value && { renewalFormId: renewalFormId.value }),
        ...(otherForms &&
          otherForms.length > 0 && {
            otherForms: otherForms.map((form) => ({
              form_id: String(form.value),
              ...(form.isSubmissionRequired ? { isSubmissionRequired: 'true' } : {}),
            })),
          }),
        isIntakeFormRequired: isIntakeFormRequired ?? false,
      };

      const formData = createFormDataFromObjectSimple(payload);

      // Create product
      const response = await createNewProduct(formData).unwrap();
      await updateListing(response);
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.message || 'Error while creating product!');
      } else {
        toast.error((error as Error).data.message || 'Error while creating product!');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Form setup
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit,
    validateOnChange: true,
    validateOnBlur: true,
    enableReinitialize: false,
  });

  // Debug: Log form state on every render
  console.log('🔍 Form State:', {
    isValid: formik.isValid,
    isValidating: formik.isValidating,
    errors: formik.errors,
    touched: formik.touched,
    values: formik.values,
    submitCount: formik.submitCount,
  });

  const { values, errors, touched, isSubmitting, setFieldValue, setFieldTouched, handleSubmit, submitForm, resetForm } =
    formik;

  const handleOtherFormsChange = useCallback(
    (selected: FormOption[] | null) => {
      const previousSelections = values.otherForms || [];
      const nextSelections = (selected || []).map((option) => {
        const existing = previousSelections.find((item) => item.value === option.value);
        return {
          ...option,
          isSubmissionRequired: existing?.isSubmissionRequired ?? false,
        };
      });

      setFieldValue('otherForms', nextSelections);
      setFieldTouched('otherForms', true);
    },
    [setFieldTouched, setFieldValue, values.otherForms]
  );

  const handleOtherFormsToggle = useCallback(
    (formId: string | number, checked: boolean) => {
      const updated = (values.otherForms || []).map((item) =>
        item.value === formId ? { ...item, isSubmissionRequired: checked } : item
      );

      setFieldValue('otherForms', updated);
      setFieldTouched('otherForms', true);
    },
    [setFieldTouched, setFieldValue, values.otherForms]
  );

  const handleClose = () => {
    if (imagePreviewUrlRef.current) {
      revokeImagePreviewUrl(imagePreviewUrlRef.current);
      imagePreviewUrlRef.current = null;
    }

    resetForm();
    onHide?.();
  };

  // Handle image selection
  const handleImageSelect = useCallback(
    (file: File) => {
      // Clean up previous preview URL
      if (imagePreviewUrlRef.current) {
        revokeImagePreviewUrl(imagePreviewUrlRef.current);
      }

      // Create new preview URL
      imagePreviewUrlRef.current = createImagePreviewUrl(file);
      setFieldValue('image', file);
    },
    [setFieldValue]
  );

  const handleImageRemove = useCallback(() => {
    if (imagePreviewUrlRef.current) {
      revokeImagePreviewUrl(imagePreviewUrlRef.current);
      imagePreviewUrlRef.current = null;
    }
    setFieldValue('image', undefined);
  }, [setFieldValue]);

  // Render form field
  const renderFormField = useCallback(
    ({ key, label, type }: (typeof FORM_FIELDS)[number]) => (
      <Col xs={12} key={key}>
        <Form.Label className='form-label text-sm text-placeholder'>
          {label} {(key === 'duration' || key === 'description') && <span className='text-danger'>*</span>}
        </Form.Label>
        <Field name={key}>
          {({ field }: FieldProps) => {
            const fieldKey = key as keyof typeof errors;
            const hasError = !!(errors[fieldKey] && touched[fieldKey]);
            let placeholderText = '';

            if (type === 'textarea') {
              placeholderText = 'Enter description';
            } else if (key === 'planTier') {
              placeholderText = 'e.g. Standard, Value';
            }

            return (
              <>
                <div className='position-relative'>
                  <Form.Control
                    {...field}
                    type={type === 'textarea' ? undefined : type}
                    as={type === 'textarea' ? 'textarea' : undefined}
                    rows={type === 'textarea' ? 3 : undefined}
                    placeholder={placeholderText}
                    isInvalid={hasError}
                    className={`shadow-none ${key === 'duration' ? 'duration_input' : ''}`}
                    onBlur={() => setFieldTouched(key as keyof FormValues, true)}
                    min={key === 'duration' ? 1 : undefined}
                    max={key === 'duration' ? 12 : undefined}
                  />
                  {key === 'duration' && (
                    <span className='position-absolute duration_input_unit z-0' aria-hidden='true'>
                      /month
                    </span>
                  )}
                </div>
                {hasError && (
                  <Form.Control.Feedback className='d-block' type='invalid'>
                    {errors[fieldKey]}
                  </Form.Control.Feedback>
                )}
              </>
            );
          }}
        </Field>
      </Col>
    ),
    [errors, touched, setFieldTouched]
  );

  return (
    <FormikProvider value={formik}>
      <form 
        onSubmit={(e) => {
          console.log('🔥 Form onSubmit event triggered!');
          console.log('Event:', e);
          e.preventDefault();
          console.log('About to call handleSubmit...');
          handleSubmit(e);
          console.log('handleSubmit called');
        }}
      >
        <Modal {...props} backdrop='static' scrollable centered>
          <Modal.Header className='border-0 pb-0 justify-content-center text-center'>
            <Modal.Title>Add New Product</Modal.Title>
          </Modal.Header>
          <Modal.Body className='medication_product_form'>
            <Row className='g-4'>
              {/* Image Upload Section */}
              <Col xs={12}>
                <Form.Label className='form-label text-sm text-placeholder'>
                  Upload Image <span className='text-danger'>*</span>
                </Form.Label>
                {values.image ? (
                  <div className='product_image_card p-3 rounded-12 d-flex align-items-center gap-3'>
                    <AsyncImage
                      className='product_image'
                      Transition={Blur}
                      src={imagePreviewUrlRef.current || ''}
                      loader={<div className='bg-secondary-subtle' />}
                      alt={`Preview of ${values.image.name}`}
                    />
                    <div className='flex-grow-1 d-flex flex-column text-xs gap-2'>
                      <span className='fw-semibold' title={values.image.name}>
                        {values.image.name}
                      </span>
                      <span>{formatFileSize(values.image.size)}</span>
                    </div>
                    <Button
                      variant='link'
                      size='sm'
                      className='btn-no-style text-dark'
                      onClick={handleImageRemove}
                      aria-label='Remove image'
                      disabled={isSubmitting}
                    >
                      <RiCloseLargeLine size={20} />
                    </Button>
                  </div>
                ) : (
                  <div className='p-one'>
                    <ProductDropzone onFilesAdded={handleImageSelect} disabled={isSubmitting} />
                  </div>
                )}
                {errors.image && touched.image && <Form.Text className='text-danger text-sm'>{errors.image}</Form.Text>}
              </Col>

              {/* Product Type Selection */}
              <Col xs={12}>
                <Form.Label className='form-label text-sm text-placeholder'>
                  Product Type <span className='text-danger'>*</span>
                </Form.Label>
                <ReactSelect
                  placeholder={categoriesLoading ? 'Loading...' : 'Select Product Type'}
                  name='category'
                  options={productCategoriesOptions}
                  value={values.category}
                  onChange={(value) => setFieldValue('category', value)}
                  onBlur={() => setFieldTouched('category', true)}
                  isDisabled={categoriesLoading || isSubmitting}
                  isLoading={categoriesLoading}
                  aria-label='Select product type'
                />
                {errors.category && touched.category && (
                  <Form.Text className='text-danger text-sm'>
                    {typeof errors.category === 'string' ? errors.category : 'Category is required'}
                  </Form.Text>
                )}
              </Col>

              {/* Intake Form Selection */}
              <Col xs={12}>
                <Form.Label className='form-label text-sm text-placeholder'>Intake Form</Form.Label>
                <ReactSelect
                  placeholder={intakeSurveysLoading ? 'Loading...' : 'Select Intake Form'}
                  name='intakeFormId'
                  options={intakeSurveyOptions}
                  value={values.intakeFormId}
                  onChange={(value) => setFieldValue('intakeFormId', value)}
                  onBlur={() => setFieldTouched('intakeFormId', true)}
                  isDisabled={intakeSurveysLoading || isSubmitting}
                  isLoading={intakeSurveysLoading}
                  isSearchable
                  isClearable
                />
                {errors.intakeFormId && touched.intakeFormId && (
                  <Form.Text className='text-danger text-sm'>
                    {typeof errors.intakeFormId === 'string'
                      ? errors.intakeFormId
                      : 'Please select a valid intake form'}
                  </Form.Text>
                )}
                <Form.Check
                  type='checkbox'
                  id='isIntakeFormRequired'
                  label='Intake form is required'
                  checked={values.isIntakeFormRequired ?? false}
                  onChange={(e) => setFieldValue('isIntakeFormRequired', e.target.checked)}
                  className='mt-2'
                />
              </Col>

              {/* Refill Form Selection */}
              <Col xs={12}>
                <Form.Label className='form-label text-sm text-placeholder'>Refill Form</Form.Label>
                <ReactSelect
                  placeholder={productRefillSurveysLoading ? 'Loading...' : 'Select Refill Form'}
                  name='refillFormId'
                  options={refillSurveyOptions}
                  value={values.refillFormId}
                  onChange={(value) => setFieldValue('refillFormId', value)}
                  onBlur={() => setFieldTouched('refillFormId', true)}
                  isDisabled={productRefillSurveysLoading || isSubmitting}
                  isLoading={productRefillSurveysLoading}
                  isSearchable
                  isClearable
                />
                {errors.refillFormId && touched.refillFormId && (
                  <Form.Text className='text-danger text-sm'>
                    {typeof errors.refillFormId === 'string'
                      ? errors.refillFormId
                      : 'Please select a valid refill form'}
                  </Form.Text>
                )}
              </Col>

              {/* Other Forms Selection */}
              <Col xs={12}>
                <Form.Label className='form-label text-sm text-placeholder'>Other Forms</Form.Label>
                <ReactSelect
                  placeholder={otherFormsSurveysLoading ? 'Loading...' : 'Select Other Forms'}
                  name='otherForms'
                  options={otherFormsOptions}
                  value={values.otherForms || []}
                  onChange={(value) => handleOtherFormsChange(value as FormOption[] | null)}
                  onBlur={() => setFieldTouched('otherForms', true)}
                  isDisabled={otherFormsSurveysLoading || isSubmitting}
                  isLoading={otherFormsSurveysLoading}
                  isMulti
                  isSearchable
                  isClearable
                  closeMenuOnSelect={false}
                />
                <Form.Text className='text-muted text-sm'>
                  Select any additional forms customers should complete and mark which ones are mandatory.
                </Form.Text>
                {!!values.otherForms?.length && (
                  <div className='d-flex flex-column gap-2 mt-3'>
                    {values.otherForms.map((form) => (
                      <div
                        key={form.value}
                        className='d-flex align-items-center justify-content-between gap-3 p-2 border rounded'
                      >
                        <div className='d-flex flex-column'>
                          <span className='fw-semibold text-sm'>{form.label}</span>
                          <small className='text-muted'>Require submission?</small>
                        </div>
                        <Form.Check
                          disabled={otherFormsSurveysLoading || isSubmitting}
                          type='switch'
                          id={`other-form-${form.value}`}
                          label={form.isSubmissionRequired ? 'Required' : 'Optional'}
                          checked={!!form.isSubmissionRequired}
                          onChange={(event) => handleOtherFormsToggle(form.value, event.currentTarget.checked)}
                        />
                      </div>
                    ))}
                  </div>
                )}
                {errors.otherForms && touched.otherForms && (
                  <Form.Text className='text-danger text-sm'>
                    {typeof errors.otherForms === 'string' ? errors.otherForms : 'Please select valid forms'}
                  </Form.Text>
                )}
              </Col>

              {/* Dynamic Form Fields */}
              {FORM_FIELDS.map(renderFormField)}
            </Row>
          </Modal.Body>
          <Modal.Footer className='border-0'>
            <Row className='gx-3 flex-grow-1'>
              <Col xs={6}>
                <Button
                  type='button'
                  variant='outline-primary'
                  className='w-100'
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Discard
                </Button>
              </Col>
              <Col xs={6}>
                <Button
                  type='button'
                  variant='primary'
                  className='w-100 d-flex align-items-center justify-content-center gap-2'
                  disabled={
                    isSubmitting ||
                    categoriesLoading ||
                    intakeSurveysLoading ||
                    productRefillSurveysLoading ||
                    otherFormsSurveysLoading
                  }
                  onClick={async () => {
                    console.log('🎯 BUTTON CLICKED!');
                    console.log('Calling submitForm()...');
                    await submitForm();
                    console.log('submitForm() completed');
                  }}
                >
                  {isSubmitting && <Spinner size='sm' className='border-2' />}
                  {isSubmitting ? 'Adding...' : 'Add Product'}
                </Button>
              </Col>
            </Row>
          </Modal.Footer>
        </Modal>
      </form>
    </FormikProvider>
  );
};
