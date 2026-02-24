'use client';

import toast from 'react-hot-toast';
import * as Yup from 'yup';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import { format } from 'date-fns';
import { useLazyExportProviderApprovalReportQuery } from '@/store/slices/providersApiSlice';
import { downloadFileFromBlob } from '@/lib/helper';
import { extractErrorMessage } from '@/lib/errors';
import { CircularProgress, Modal, ReactDatePicker } from '@/components/elements';
import { validationSchema, ReportFormValues } from '@/schemas/providerApprovalReport';
import { useRef } from 'react';

interface ProviderApprovalReportModalProps {
  show: boolean;
  onHide: () => void;
}

export const ProviderApprovalReportModal = ({ show, onHide }: ProviderApprovalReportModalProps) => {
  const formikRef = useRef<FormikProps<ReportFormValues>>(null);

  const [exportProviderApprovalReport, { isLoading }] = useLazyExportProviderApprovalReportQuery();

  const initialValues: ReportFormValues = {
    startDate: null,
    endDate: null,
  };

  const onSubmit = async (values: ReportFormValues, { resetForm }: FormikHelpers<ReportFormValues>) => {
    try {
      await validationSchema.validate(values, { abortEarly: false });
    } catch (err) {
      // Show validation errors to user via toast
      if (err instanceof Yup.ValidationError && err.errors && err.errors.length > 0) {
        toast.error(err.errors[0]);
      }
      return; // Don't proceed with submission if validation fails
    }

    try {
      const blob = await exportProviderApprovalReport({
        startDate: format(values.startDate!, 'yyyy-MM-dd'),
        endDate: format(values.endDate!, 'yyyy-MM-dd'),
      }).unwrap();

      // Extract filename from Content-Disposition header if available, or use default
      const timestamp = format(new Date(), 'yyyy-MM-dd-HHmmss');
      const filename = `provider-approval-report-${timestamp}.csv`;

      downloadFileFromBlob(blob, filename);
      toast.success('Report downloaded successfully!');
      resetForm();
      onHide();
    } catch (error) {
      const errorMessage = extractErrorMessage(error, 'Failed to export report. Please try again.');
      toast.error(errorMessage);
    }
  };

  const handleClose = () => {
    onHide();
    formikRef.current?.resetForm();
  };

  const footer = (
    <div className='tw-flex tw-gap-2 tw-w-full'>
      <button
        type='button'
        onClick={handleClose}
        disabled={isLoading}
        className='tw-flex-1 tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-text-gray-700 tw-bg-white tw-border tw-border-gray-300 tw-rounded-lg hover:tw-bg-gray-50 disabled:tw-opacity-50 disabled:tw-pointer-events-none tw-transition-all'
      >
        Cancel
      </button>
      <button
        type='submit'
        form='provider-approval-report-form'
        disabled={isLoading}
        className='tw-flex-1 tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-text-white tw-bg-blue-600 tw-border tw-border-transparent tw-rounded-lg hover:tw-bg-blue-700 disabled:tw-opacity-50 disabled:tw-pointer-events-none tw-transition-all tw-flex tw-items-center tw-justify-center tw-gap-2'
      >
        {isLoading && <CircularProgress />}
        {isLoading ? 'Exporting...' : 'Export CSV'}
      </button>
    </div>
  );

  return (
    <Formik innerRef={formikRef} initialValues={initialValues} enableReinitialize onSubmit={onSubmit}>
      {({ values, setFieldValue }) => (
        <Form id='provider-approval-report-form'>
          <Modal
            isOpen={show}
            onClose={handleClose}
            title='Export Provider Approval Report'
            size='md'
            footer={footer}
            showFooter
            isLoading={isLoading}
            loadingText='Exporting...'
          >
            <div className='tw-flex tw-flex-col tw-gap-4'>
              <p className='tw-text-gray-600 tw-text-sm tw-mb-0'>
                Select a date range to export the provider approval report as CSV.
              </p>
              <div className='tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4'>
                <div>
                  <label
                    htmlFor='start-date-picker'
                    className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'
                  >
                    Start Date <span className='tw-text-red-500'>*</span>
                  </label>
                  <div id='start-date-picker'>
                    <ReactDatePicker
                      selected={values.startDate || undefined}
                      onChange={(date) => {
                        setFieldValue('startDate', date || null);
                      }}
                      placeholderText='Select start date'
                      dateFormat='MM/dd/yyyy'
                      maxDate={values.endDate || new Date()}
                      wrapperClassName='tw-w-full'
                      popperClassName='react-datepicker-popper'
                      isClearable
                      clearButtonClassName='q-date-picker-clear-button'
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor='end-date-picker'
                    className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'
                  >
                    End Date <span className='tw-text-red-500'>*</span>
                  </label>
                  <div id='end-date-picker'>
                    <ReactDatePicker
                      selected={values.endDate || undefined}
                      onChange={(date) => {
                        setFieldValue('endDate', date || null);
                      }}
                      placeholderText='Select end date'
                      dateFormat='MM/dd/yyyy'
                      minDate={values.startDate ?? undefined}
                      maxDate={new Date()}
                      wrapperClassName='tw-w-full'
                      popperClassName='react-datepicker-popper'
                      isClearable
                      clearButtonClassName='q-date-picker-clear-button'
                    />
                  </div>
                </div>
              </div>
            </div>
          </Modal>
        </Form>
      )}
    </Formik>
  );
};
