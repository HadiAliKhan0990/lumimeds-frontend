'use client';

import toast from 'react-hot-toast';
import { useMemo, useCallback, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Field, FieldProps, FormikHelpers, useFormik, FormikProvider } from 'formik';
import { Button, Col, Form, Modal, ModalProps, Row, Spinner } from 'react-bootstrap';
import { RootState } from '@/store';
import { Product } from '@/store/slices/medicationsProductsSlice';
import { updateMedicationProductSchema as validationSchema, FormValues } from '@/schemas/medicationProduct';
import {
  useGetProductCategoriesQuery,
  useLazyGetMedicationsProductsListQuery,
  useUpdateProductMutation,
} from '@/store/slices/medicationsApiSlice';
import { Error, OptionValue, Response } from '@/lib/types';
import { isAxiosError } from 'axios';
import { PlanType } from '@/types/medications';
import { createFormDataFromObjectSimple } from '@/lib/helper';
import { FORM_FIELDS } from '@/constants/medications';
import { revokeImagePreviewUrl } from '@/helpers/medicationProduct';
import { UpdateImageField } from '@/components/Dashboard/admin/medications/products/includes/UpdateImageField';
import { ReactSelect } from '@/components/elements';
import { useGetProductSurveysQuery } from '@/store/slices/surveysApiSlice';

interface Props extends ModalProps {
  selectedProduct?: Product;
}

type FormOption = OptionValue & { isSubmissionRequired?: boolean };

export const UpdateMedicationProductModal = ({ selectedProduct, onHide, ...props }: Readonly<Props>) => {
  const imagePreviewUrlRef = useRef<string | null>(null);
  const formsInitializedRef = useRef<string | null>(null);

  const meta = useSelector((state: RootState) => state.medicationsProducts.products?.meta);
  const sortStatus = useSelector((state: RootState) => state.sort.sortStatus);
  const sortField = useSelector((state: RootState) => state.sort.sortField);
  const sortOrder = useSelector((state: RootState) => state.sort.sortOrder);
  const search = useSelector((state: RootState) => state.sort.search);

  // API hooks
  const { data: categoriesData, isFetching: categoriesLoading } = useGetProductCategoriesQuery(
    { meta: { page: 1, limit: 999 } },
    { skip: !props.show }
  );
  const [triggerMedicationsProductsList] = useLazyGetMedicationsProductsListQuery();
  const [updateProduct] = useUpdateProductMutation();

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

  const { data: renewalSurveysData, isFetching: renewalSurveysLoading } = useGetProductSurveysQuery(
    { type: 'PRODUCT_RENEWAL', page: 1, limit: 100, sortBy: 'name', sortOrder: 'ASC' },
    { skip: !props.show }
  );

  const { surveys: intakeSurveys } = intakeSurveysData || {};
  const { surveys: productRefillSurveys } = productRefillSurveysData || {};
  const { surveys: renewalSurveys } = renewalSurveysData || {};
  const { surveys: otherFormsSurveys } = otherFormsSurveysData || {};

  const initialValues: FormValues = {
    description: selectedProduct?.description || '',
    image: undefined,
    category: selectedProduct?.category?.id
      ? {
          value: selectedProduct.category.id,
          label: `${selectedProduct.category.category} - ${
            selectedProduct.category.planType === PlanType.ONE_TIME ? 'One Time Purchase' : 'Subscription'
          }`,
        }
      : null,
    intakeFormId: null,
    refillFormId: null,
    renewalFormId: null,
    otherForms: [],
    planTier: selectedProduct?.metadata.planTier || '',
    duration: selectedProduct?.metadata.intervalCount || undefined,
    isActive: selectedProduct?.isActive ?? false,
    openpayProductId: selectedProduct?.openpayProductId ? '********' : '',
    telegraId: selectedProduct?.telegra ? '********' : '',
    telepathId: selectedProduct?.telepath ? '********' : '',
    tagline: selectedProduct?.tagline || '',
    isIntakeFormRequired: selectedProduct?.forms?.intake_form?.isSubmissionRequired ?? false,
    isRenewalFormRequired: selectedProduct?.forms?.renewal_form?.isSubmissionRequired ?? false,

    // Add original values for comparison
    originalDescription: selectedProduct?.description || '',
    originalOpenpayProductId: selectedProduct?.openpayProductId || '',
    originalTelegraId: selectedProduct?.telegra || '',
    originalTelepathId: selectedProduct?.telepath || '',
  };

  const updateListing = async ({ success, message }: Response) => {
    if (success) {
      await triggerMedicationsProductsList({
        search,
        sortField,
        sortOrder,
        meta,
        ...(sortStatus && { sortStatus }),
      });
      toast.success('Product updated successfully!');
      handleClose();
    } else {
      toast.error(message);
    }
  };

  const onSubmit = async (formValues: FormValues, { setSubmitting }: FormikHelpers<FormValues>) => {
    try {
      setSubmitting(true);

      if (!selectedProduct) {
        toast.error('No product selected for update');
        setSubmitting(false);
        return;
      }

      const {
        openpayProductId,
        telegraId,
        telepathId,
        category,
        duration: billingIntervalCount,
        planTier,
        image,
        isActive,
        description,
        intakeFormId,
        refillFormId,
        renewalFormId,
        otherForms,
        isIntakeFormRequired,
        isRenewalFormRequired,
      } = formValues;

      const changedFields: Record<string, unknown> = {
        categoryId: category?.value,
      };

      if (openpayProductId && openpayProductId !== '********') {
        changedFields['openpayProductId'] = openpayProductId;
      }
      if (telegraId && telegraId !== '********') {
        changedFields['telegraId'] = telegraId;
      }
      if (telepathId && telepathId !== '********') {
        changedFields['telepathId'] = telepathId;
      }
      if (isActive !== selectedProduct.isActive) {
        changedFields['isActive'] = isActive;
      }
      if (billingIntervalCount !== selectedProduct.metadata.intervalCount) {
        changedFields['billingIntervalCount'] = billingIntervalCount;
      }
      if (planTier && planTier !== selectedProduct.metadata.planTier) {
        changedFields['planTier'] = planTier;
      }
      if (image) {
        changedFields['image'] = image;
      }
      if (description !== selectedProduct.description) {
        changedFields['description'] = description;
      }

      const originalIntakeFormId = selectedProduct.forms?.intake_form?.form_id || selectedProduct.forms?.intake_form_id;
      const originalIsIntakeFormRequired = selectedProduct.forms?.intake_form?.isSubmissionRequired ?? false;

      // Check if either intakeFormId or isIntakeFormRequired changed
      const intakeFormIdChanged = intakeFormId?.value !== originalIntakeFormId;
      const isIntakeFormRequiredChanged = isIntakeFormRequired !== originalIsIntakeFormRequired;

      // If either field changed, include both fields in the payload (inter-linked)
      if (intakeFormIdChanged || isIntakeFormRequiredChanged) {
        if (intakeFormId?.value) {
          changedFields['intakeFormId'] = intakeFormId.value;
        }
        changedFields['isIntakeFormRequired'] = isIntakeFormRequired ?? false;
      }

      if (refillFormId?.value && refillFormId.value !== selectedProduct.forms?.refill_form_id) {
        changedFields['refillFormId'] = refillFormId.value;
      }

      // Renewal Form (similar to intake form pattern)
      const originalRenewalFormId = selectedProduct.forms?.renewal_form?.form_id || selectedProduct.forms?.renewal_form_id;
      const originalIsRenewalFormRequired = selectedProduct.forms?.renewal_form?.isSubmissionRequired ?? false;

      const renewalFormIdChanged = renewalFormId?.value !== originalRenewalFormId;
      const isRenewalFormRequiredChanged = isRenewalFormRequired !== originalIsRenewalFormRequired;

      if (renewalFormIdChanged || isRenewalFormRequiredChanged) {
        if (renewalFormId?.value) {
          changedFields['renewalFormId'] = renewalFormId.value;
        }
        changedFields['isRenewalFormRequired'] = isRenewalFormRequired ?? false;
      }

      const existingOtherForms = (selectedProduct.forms?.other_forms || []).filter((form) => form?.form_id);

      const formattedExistingOtherForms = existingOtherForms.map((form) => ({
        form_id: String(form.form_id),
        ...(form.isSubmissionRequired ? { isSubmissionRequired: 'true' } : {}),
      }));

      const formattedOtherForms = (otherForms || []).map((form) => ({
        form_id: String(form.value),
        ...(form.isSubmissionRequired ? { isSubmissionRequired: 'true' } : {}),
      }));

      const serializeOtherForms = (forms: Array<{ form_id: string; isSubmissionRequired?: string }>) => {
        const sortedForms = [...forms].sort((a, b) => a.form_id.localeCompare(b.form_id));
        return JSON.stringify(sortedForms);
      };

      const existingOtherFormsSerialized = serializeOtherForms(formattedExistingOtherForms);
      const nextOtherFormsSerialized = serializeOtherForms(formattedOtherForms);

      if (existingOtherFormsSerialized !== nextOtherFormsSerialized) {
        changedFields['otherForms'] = formattedOtherForms;
      }

      if (Object.keys(changedFields).length > 0) {
        const data = createFormDataFromObjectSimple(changedFields);
        const response = await updateProduct({ id: selectedProduct.id || '', data }).unwrap();
        await updateListing(response);
      } else {
        toast.error('No changes detected');
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.message || 'Error while updating product!');
      } else {
        toast.error((error as Error).data.message || 'Error while updating product!');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit,
    enableReinitialize: true,
  });

  const { values, errors, touched, isSubmitting, setFieldValue, setFieldTouched, handleSubmit, submitForm, resetForm } =
    formik;

  useEffect(() => {
    if (!props.show) {
      formsInitializedRef.current = null;
    }
  }, [props.show]);

  useEffect(() => {
    formsInitializedRef.current = null;
  }, [selectedProduct?.id]);

  const handleClose = () => {
    if (imagePreviewUrlRef.current) {
      revokeImagePreviewUrl(imagePreviewUrlRef.current);
      imagePreviewUrlRef.current = null;
    }

    formsInitializedRef.current = null;

    resetForm();
    onHide?.();
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

  const renewalSurveyOptions = useMemo(() => {
    if (!renewalSurveys || renewalSurveys.length === 0) return [];

    return renewalSurveys.map((survey) => ({
      label: survey.name || 'Untitled Renewal Survey',
      value: survey.id,
    }));
  }, [renewalSurveys]);

  const otherFormsOptions = useMemo(() => {
    if (!otherFormsSurveys || otherFormsSurveys.length === 0) return [];

    return otherFormsSurveys.map((survey) => ({
      label: survey.name || 'Untitled Survey',
      value: survey.id,
    }));
  }, [otherFormsSurveys]);

  useEffect(() => {
    if (!props.show) return;

    if (!selectedProduct?.id) return;

    const { forms } = selectedProduct;
    const productId = selectedProduct.id;

    const intakeFormId = forms?.intake_form?.form_id || forms?.intake_form_id;
    const hasIntakeForm = Boolean(intakeFormId);
    const hasRefillForm = Boolean(forms?.refill_form_id);
    const hasRenewalForm = Boolean(forms?.renewal_form?.form_id || forms?.renewal_form_id);
    const hasOtherForms = Boolean(forms?.other_forms?.length);

    const intakeOptionsReady = !hasIntakeForm || intakeSurveyOptions.length > 0;
    const refillOptionsReady = !hasRefillForm || refillSurveyOptions.length > 0;
    const renewalOptionsReady = !hasRenewalForm || renewalSurveyOptions.length > 0;
    const otherFormsOptionsReady = !hasOtherForms || otherFormsOptions.length > 0;

    if (!intakeOptionsReady || !refillOptionsReady || !renewalOptionsReady || !otherFormsOptionsReady) {
      return;
    }

    if (formsInitializedRef.current === productId) {
      return;
    }

    if (hasIntakeForm) {
      const matchedIntakeForm = intakeSurveyOptions.find((option) => option.value === intakeFormId);
      if (matchedIntakeForm) {
        setFieldValue('intakeFormId', matchedIntakeForm, false);
      }
    }

    if (forms?.intake_form?.isSubmissionRequired !== undefined) {
      setFieldValue('isIntakeFormRequired', forms.intake_form.isSubmissionRequired, false);
    }

    if (hasRefillForm) {
      const matchedRefillForm = refillSurveyOptions.find((option) => option.value === forms?.refill_form_id);
      if (matchedRefillForm) {
        setFieldValue('refillFormId', matchedRefillForm, false);
      }
    }

    if (hasRenewalForm) {
      const renewalFormIdValue = forms?.renewal_form?.form_id || forms?.renewal_form_id;
      const matchedRenewalForm = renewalSurveyOptions.find((option) => option.value === renewalFormIdValue);
      if (matchedRenewalForm) {
        setFieldValue('renewalFormId', matchedRenewalForm, false);
      }
    }

    if (forms?.renewal_form?.isSubmissionRequired !== undefined) {
      setFieldValue('isRenewalFormRequired', forms.renewal_form?.isSubmissionRequired ?? false, false);
    }

    if (hasOtherForms) {
      const matchedOtherForms = (forms?.other_forms || [])
        .map((form) => {
          const option = otherFormsOptions.find((otherForm) => otherForm.value === form.form_id);
          if (!option) return null;
          return {
            ...option,
            isSubmissionRequired: Boolean(form.isSubmissionRequired),
          } as FormOption;
        })
        .filter((form): form is FormOption => form !== null);

      if (matchedOtherForms.length > 0) {
        setFieldValue('otherForms', matchedOtherForms, false);
      }
    }

    formsInitializedRef.current = productId;
  }, [props.show, selectedProduct, intakeSurveyOptions, refillSurveyOptions, renewalSurveyOptions, otherFormsOptions, setFieldValue]);

  const handleOtherFormsChange = useCallback(
    (selected: FormOption[] | null) => {
      const previousSelections = (values.otherForms || []) as FormOption[];
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

            const controlType = type === 'textarea' ? undefined : type;
            const controlAs: undefined | 'textarea' = type === 'textarea' ? 'textarea' : undefined;
            const controlRows = type === 'textarea' ? 2 : undefined;
            const durationExtraClass = key === 'duration' ? 'duration_input' : '';
            const minValue = key === 'duration' ? 1 : undefined;
            const maxValue = key === 'duration' ? 12 : undefined;

            return (
              <>
                <div className='position-relative'>
                  <Form.Control
                    {...field}
                    type={controlType}
                    as={controlAs}
                    rows={controlRows}
                    placeholder={placeholderText}
                    isInvalid={hasError}
                    className={`shadow-none ${durationExtraClass}`}
                    onBlur={() => setFieldTouched(key as keyof FormValues, true)}
                    min={minValue}
                    max={maxValue}
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
      <form onSubmit={handleSubmit}>
        <Modal {...props} backdrop='static' scrollable centered>
          <Modal.Header className='border-0 pb-0 justify-content-center text-center'>
            <Modal.Title>Update Product</Modal.Title>
          </Modal.Header>
          <Modal.Body className='medication_product_form'>
            <Row className='g-4'>
              {/* Image Upload Section */}
              <Col xs={12}>
                <Form.Label className='form-label text-sm text-placeholder'>
                  Product Image <span className='text-danger'>*</span>
                </Form.Label>
                {props.show && <UpdateImageField selectedProduct={selectedProduct} />}
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
                  onChange={(value) => setFieldValue('category', value as OptionValue | null)}
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
                  value={values.intakeFormId as OptionValue | null}
                  onChange={(value) => setFieldValue('intakeFormId', value as OptionValue | null)}
                  onBlur={() => setFieldTouched('intakeFormId', true)}
                  isDisabled={intakeSurveysLoading || isSubmitting}
                  isLoading={intakeSurveysLoading}
                  isSearchable
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
                  id='isIntakeFormRequired-update'
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
                  value={values.refillFormId as OptionValue | null}
                  onChange={(value) => setFieldValue('refillFormId', value as OptionValue | null)}
                  onBlur={() => setFieldTouched('refillFormId', true)}
                  isDisabled={productRefillSurveysLoading || isSubmitting}
                  isLoading={productRefillSurveysLoading}
                  isSearchable
                />
                {errors.refillFormId && touched.refillFormId && (
                  <Form.Text className='text-danger text-sm'>
                    {typeof errors.refillFormId === 'string'
                      ? errors.refillFormId
                      : 'Please select a valid refill form'}
                  </Form.Text>
                )}
              </Col>

              {/* Renewal Form Selection */}
              <Col xs={12}>
                <Form.Label className='form-label text-sm text-placeholder'>Renewal Form</Form.Label>
                <ReactSelect
                  placeholder={renewalSurveysLoading ? 'Loading...' : 'Select Renewal Form'}
                  name='renewalFormId'
                  options={renewalSurveyOptions}
                  value={values.renewalFormId as OptionValue | null}
                  onChange={(value) => setFieldValue('renewalFormId', value as OptionValue | null)}
                  onBlur={() => setFieldTouched('renewalFormId', true)}
                  isDisabled={renewalSurveysLoading || isSubmitting}
                  isLoading={renewalSurveysLoading}
                  isSearchable
                />
                {errors.renewalFormId && touched.renewalFormId && (
                  <Form.Text className='text-danger text-sm'>
                    {typeof errors.renewalFormId === 'string'
                      ? errors.renewalFormId
                      : 'Please select a valid renewal form'}
                  </Form.Text>
                )}
                <Form.Check
                  type='checkbox'
                  id='isRenewalFormRequired-update'
                  label='Renewal form is required'
                  checked={values.isRenewalFormRequired ?? false}
                  onChange={(e) => setFieldValue('isRenewalFormRequired', e.target.checked)}
                  className='mt-2'
                />
              </Col>

              {/* Other Forms Selection */}
              <Col xs={12}>
                <Form.Label className='form-label text-sm text-placeholder'>Other Forms</Form.Label>
                <ReactSelect
                  placeholder={otherFormsSurveysLoading ? 'Loading...' : 'Select Other Forms'}
                  name='otherForms'
                  options={otherFormsOptions}
                  value={(values.otherForms || []) as FormOption[]}
                  onChange={(value) => handleOtherFormsChange(value as FormOption[] | null)}
                  onBlur={() => setFieldTouched('otherForms', true)}
                  isDisabled={otherFormsSurveysLoading || isSubmitting}
                  isLoading={otherFormsSurveysLoading}
                  isMulti
                  isSearchable
                  closeMenuOnSelect={false}
                />
                <Form.Text className='text-muted text-sm'>
                  Select additional forms customers should complete and mark which ones are mandatory.
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
                          <small className='text-muted'>Require submission before checkout?</small>
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

              {/* Status Toggle */}

              <Col xs={12}>
                <Form.Label className='form-label text-sm text-placeholder'>
                  Product Status <span className='text-danger'>*</span>
                </Form.Label>
                <div className='d-flex align-items-center gap-3'>
                  <Form.Check
                    className='ps-0 status-toggle'
                    type='switch'
                    id='isActive-switch'
                    checked={values.isActive}
                    onChange={(e) => setFieldValue('isActive', e.target.checked)}
                    isInvalid={!!errors.isActive && touched.isActive}
                  />
                  <div className='d-flex flex-column'>
                    <span className={values.isActive ? 'text-primary fw-semibold' : 'text-body'}>
                      {values.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className='text-xs text-muted'>
                      {values.isActive ? 'Product is visible to customers' : 'Product is hidden from customers'}
                    </span>
                  </div>
                </div>
                {errors.isActive && touched.isActive && (
                  <Form.Text className='text-danger text-sm d-block mt-1'>{errors.isActive}</Form.Text>
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
                  type='submit'
                  onClick={submitForm}
                  variant='primary'
                  className='w-100 d-flex align-items-center justify-content-center gap-2'
                  disabled={
                    isSubmitting ||
                    categoriesLoading ||
                    intakeSurveysLoading ||
                    productRefillSurveysLoading ||
                    renewalSurveysLoading ||
                    otherFormsSurveysLoading
                  }
                >
                  {isSubmitting && <Spinner size='sm' className='border-2' aria-hidden='true' />}
                  Update Product
                </Button>
              </Col>
            </Row>
          </Modal.Footer>
        </Modal>
      </form>
    </FormikProvider>
  );
};
