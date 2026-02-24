import Modal from '@/components/elements/Modal';
import { useState, useCallback } from 'react';
import { Formik, Form } from 'formik';
import { capitalizeFirst } from '@/lib/helper';
import {
  useLazyGetPatientSendIntakeFormsQuery,
  useSendPatientIntakeFormMutation,
  SendIntakeFormResponseSurveyData,
  SendIntakeFormQueryParams,
  SendIntakeFormPayload,
} from '@/store/slices/patientApiSlice';
import { useLazyGetPatientOrdersListQuery } from '@/store/slices/ordersApiSlice';
import { AsyncPaginate, LoadOptions } from 'react-select-async-paginate';
import { GroupBase, MultiValue, SingleValue } from 'react-select';
import { toast } from 'react-hot-toast';
import { SendIntakeFormValues, validationSchema } from '@/schemas/sendIntakeForm';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { CircularProgress } from '@/components/elements';
import { Error } from '@/lib/types';
import { isAxiosError } from 'axios';

export interface SendIntakFormProps {
  isOpen: boolean;
  onClose: () => void;
  onFormSent?: () => void;
  patientInfo: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface IntakeFormOption {
  value: string;
  label: string;
  survey: SendIntakeFormResponseSurveyData;
}

interface OrderOption {
  value: string;
  label: string;
  order: {
    id: string;
    orderUniqueId?: string;
    requestedProductName: string;
    status?: string;
  };
}

interface Additional {
  page: number;
}

export const SendIntakForm = ({ patientInfo, isOpen, onClose, onFormSent }: SendIntakFormProps) => {
  const { userId = '' } = useSelector((state: RootState) => state.chat);

  const [selectedOptions, setSelectedOptions] = useState<IntakeFormOption[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderOption | null>(null);

  const { id, firstName, lastName } = patientInfo;

  const patientName = capitalizeFirst(`${firstName} ${lastName}`);

  const [triggerGetPatientSendIntakeForms, { isFetching: isFetchingSendIntakeForms }] =
    useLazyGetPatientSendIntakeFormsQuery();

  const [triggerGetPatientOrdersList, { isFetching: isFetchingOrders }] = useLazyGetPatientOrdersListQuery();

  const [triggerSendPatientIntakeForm, { isLoading: isSendingPatientIntakeForm }] = useSendPatientIntakeFormMutation();

  const handleClose = () => {
    setSelectedOptions([]);
    setSelectedOrder(null);
    onClose();
  };

  const defaultAdditional: Additional = { page: 1 };

  // Load function for AsyncPaginate
  const loadIntakeForms = useCallback<LoadOptions<IntakeFormOption, GroupBase<IntakeFormOption>, Additional>>(
    async (search, _loadedOptions, additional = defaultAdditional) => {
      const { page = 1 } = additional;
      try {
        const params: SendIntakeFormQueryParams = {
          page: search ? 1 : page, // Reset to page 1 when searching
          limit: 10,
          search: search || undefined,
          sortBy: 'createdAt',
          sortOrder: 'DESC',
        };

        const response = await triggerGetPatientSendIntakeForms(params).unwrap();
        const { surveyData = [], page: resPage = 1, totalPages = 1 } = response || {};

        // Transform survey data to options
        const options: IntakeFormOption[] = surveyData.map((survey) => ({
          value: survey.id,
          label: survey.name,
          survey,
        }));

        const result = {
          options,
          hasMore: resPage < totalPages,
          additional: {
            page: search ? 2 : page + 1, // Next page number
          },
        };

        return result;
      } catch {
        return {
          options: [],
          hasMore: false,
          additional: {
            page: 1,
          },
        };
      }
    },
    [triggerGetPatientSendIntakeForms]
  );

  // Load function for orders AsyncPaginate
  const loadOrders = useCallback<LoadOptions<OrderOption, GroupBase<OrderOption>, Additional>>(
    async (search, _loadedOptions, additional = defaultAdditional) => {
      const { page = 1 } = additional;
      try {
        const response = await triggerGetPatientOrdersList({
          userId,
          meta: {
            page: search ? 1 : page,
            limit: 10,
          },
          search: search || undefined,
          sortOrder: 'DESC',
        }).unwrap();

        const { orders = [], meta: { page: resPage = 1, totalPages = 1 } = {} } = response || {};

        // Transform orders to options
        const options: OrderOption[] = orders
          .filter((order) => order.id && order.requestedProductName)
          .map((order) => ({
            value: order.id!,
            label: order.orderUniqueId
              ? `${order.orderUniqueId} - ${order.requestedProductName!}`
              : order.requestedProductName!,
            order: {
              id: order.id!,
              orderUniqueId: order.orderUniqueId,
              requestedProductName: order.requestedProductName!,
              status: order.status || undefined,
            },
          }));

        const result = {
          options,
          hasMore: resPage < totalPages,
          additional: {
            page: search ? 2 : page + 1,
          },
        };

        return result;
      } catch {
        return {
          options: [],
          hasMore: false,
          additional: {
            page: 1,
          },
        };
      }
    },
    [triggerGetPatientOrdersList, id]
  );

  const handleIntakeFormChange = (newSelectedOptions: MultiValue<IntakeFormOption>) => {
    const options = newSelectedOptions ? Array.from(newSelectedOptions) : [];
    setSelectedOptions(options.filter((option) => option.survey.isActive));
  };

  const handleOrderChange = (newSelectedOrder: SingleValue<OrderOption>) => {
    setSelectedOrder(newSelectedOrder);
  };

  const handleSubmit = (values: SendIntakeFormValues) => {
    const surveyIds = selectedOptions.map((option) => option.value);
    const payload: SendIntakeFormPayload = {
      patientId: id,
      surveyIds,
    };

    if (values.orderId) {
      payload.orderId = values.orderId;
    }

    triggerSendPatientIntakeForm(payload)
      .unwrap()
      .then(({ success, message }) => {
        if (success) {
          toast.success(
            `${selectedOptions.length} intake form${
              selectedOptions.length > 1 ? 's' : ''
            } sent successfully to ${patientName}`
          );
          handleClose();
          // Call onFormSent callback if provided
          onFormSent?.();
        } else {
          toast.error(message);
        }
      })
      .catch((err) => {
        toast.error(
          isAxiosError(err) ? err.response?.data?.message : (err as Error).data?.message || 'Failed to send intake form'
        );
      });
  };

  const initialValues: SendIntakeFormValues = {
    orderId: selectedOrder?.value || null,
    surveyIds: selectedOptions.map((opt) => opt.value),
  };

  const isConfirmDisabled =
    isSendingPatientIntakeForm || isFetchingSendIntakeForms || isFetchingOrders || selectedOptions.length === 0;

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={handleSubmit}
    >
      {({ setFieldValue, values, errors, touched }) => (
        <Form>
          <Modal
            isOpen={isOpen}
            onClose={handleClose}
            size='sm'
            bodyClassName='tw-py-4'
            footer={
              <div className='tw-flex tw-gap-3 tw-w-full'>
                <button
                  type='button'
                  onClick={handleClose}
                  disabled={isSendingPatientIntakeForm}
                  className='tw-flex-1 tw-px-4 tw-py-2 tw-border tw-border-primary tw-border-solid tw-rounded-lg tw-text-primary tw-bg-white hover:tw-bg-primary/10 tw-transition-all disabled:tw-opacity-50 disabled:tw-pointer-events-none'
                >
                  Dismiss
                </button>
                <button
                  type='button'
                  onClick={() => handleSubmit(values)}
                  disabled={isConfirmDisabled}
                  className='tw-flex-1 tw-px-4 tw-py-2 tw-bg-blue-600 tw-text-white tw-rounded-lg hover:tw-bg-blue-700 tw-transition-colors disabled:tw-opacity-50 disabled:tw-pointer-events-none tw-flex tw-items-center tw-justify-center tw-gap-2'
                >
                  {isSendingPatientIntakeForm && <CircularProgress />}
                  Send Form
                </button>
              </div>
            }
          >
            <div className='tw-mb-4'>
              <span className='tw-text-lg sm:tw-text-xl tw-font-semibold'>Send Form</span>
              <div className='tw-text-sm tw-text-gray-500 tw-flex tw-gap-1'>
                <span className='tw-flex-shrink-0'>to</span>
                <span title={patientName} className='tw-line-clamp-1 tw-capitalize'>
                  {patientName}
                </span>
              </div>
            </div>
            <div className='tw-text-start tw-space-y-4 tw-min-h-80'>
              <div>
                <label htmlFor='order-select' className='form-label !tw-mb-1 tw-font-medium'>
                  Select Order
                </label>
                <AsyncPaginate
                  inputId='order-select'
                  value={selectedOrder}
                  loadOptions={loadOrders}
                  onChange={(newValue) => {
                    handleOrderChange(newValue);
                    setFieldValue('orderId', newValue?.value || null);
                  }}
                  isLoading={isFetchingOrders}
                  isSearchable
                  isClearable
                  debounceTimeout={750}
                  additional={{ page: 1 }}
                  maxMenuHeight={160}
                  placeholder='Select an order'
                  noOptionsMessage={({ inputValue }) =>
                    inputValue ? `No orders found for "${inputValue}"` : 'No orders available'
                  }
                  loadingMessage={() => 'Loading orders...'}
                  classNames={{
                    control: (state) => {
                      const hasError = errors.orderId && touched.orderId;
                      let borderClass = 'tw-border-gray-300 hover:tw-border-gray-400';
                      if (hasError) {
                        borderClass = 'tw-border-red-500 hover:tw-border-red-500';
                      } else if (state.isFocused) {
                        borderClass =
                          'tw-border-blue-500 hover:tw-border-blue-500 tw-shadow-[0_0_0_0.2rem_rgba(13,110,253,0.25)]';
                      }
                      return `tw-w-full tw-rounded-lg tw-min-h-[42px] ${borderClass}`;
                    },
                    menu: () => 'tw-z-[1000] tw-rounded-lg tw-shadow-lg',
                    option: (state) => {
                      let bgClass = 'tw-bg-transparent';
                      let textClass = 'tw-text-gray-900';
                      if (state.isSelected) {
                        bgClass = 'tw-bg-blue-600 tw-text-white';
                        textClass = 'tw-text-white';
                      } else if (state.isFocused) {
                        bgClass = 'tw-bg-gray-100';
                      }
                      return `tw-px-3 tw-py-2 tw-text-sm tw-cursor-pointer tw-my-0.5 active:tw-bg-blue-600 active:tw-text-white ${bgClass} ${textClass}`;
                    },
                    indicatorSeparator: () => 'tw-hidden',
                    placeholder: () => 'tw-text-start tw-text-gray-500 tw-text-sm',
                  }}
                  defaultOptions
                  loadOptionsOnMenuOpen
                />
                {errors.orderId && touched.orderId && (
                  <div className='tw-text-red-500 tw-text-sm tw-mt-1'>{errors.orderId}</div>
                )}
              </div>
              <div>
                <label htmlFor='intake-form-select' className='form-label !tw-mb-1 tw-font-medium'>
                  Select the form
                </label>
                <AsyncPaginate
                  inputId='intake-form-select'
                  isMulti
                  value={selectedOptions}
                  loadOptions={loadIntakeForms}
                  onChange={(newValue) => {
                    handleIntakeFormChange(newValue);
                    setFieldValue('surveyIds', newValue ? Array.from(newValue).map((opt) => opt.value) : []);
                  }}
                  isLoading={isFetchingSendIntakeForms}
                  isSearchable={true}
                  closeMenuOnSelect={false}
                  debounceTimeout={750}
                  additional={{ page: 1 }}
                  placeholder='Select from the list'
                  maxMenuHeight={160}
                  noOptionsMessage={({ inputValue }) =>
                    inputValue ? `No intake forms found for "${inputValue}"` : 'No intake forms available'
                  }
                  loadingMessage={() => 'Loading intake forms...'}
                  classNames={{
                    control: (state) => {
                      const borderClass = state.isFocused
                        ? 'tw-border-blue-500 hover:tw-border-blue-500 tw-shadow-[0_0_0_0.2rem_rgba(13,110,253,0.25)]'
                        : 'tw-border-gray-300 hover:tw-border-gray-400';
                      return `tw-w-full tw-rounded-lg tw-min-h-[42px] ${borderClass}`;
                    },
                    valueContainer: () =>
                      'tw-max-h-24 !tw-overflow-y-auto !tw-overflow-x-hidden [&::-webkit-scrollbar]:tw-w-1.5 [&::-webkit-scrollbar-track]:tw-bg-transparent [&::-webkit-scrollbar-thumb]:tw-bg-gray-300 [&::-webkit-scrollbar-thumb]:tw-rounded [&::-webkit-scrollbar-thumb]:hover:tw-bg-gray-400',
                    input: () => 'tw-m-0 tw-p-0 tw-text-sm',
                    menu: () => 'tw-z-[1000] tw-rounded-lg tw-shadow-lg',
                    option: (state) => {
                      let bgClass = 'tw-bg-transparent';
                      let textClass = 'tw-text-gray-900';
                      if (state.isSelected) {
                        bgClass = 'tw-bg-blue-600 tw-text-white';
                        textClass = 'tw-text-white';
                      } else if (state.isFocused) {
                        bgClass = 'tw-bg-gray-100';
                      }
                      return `tw-px-3 tw-py-2 tw-text-sm tw-cursor-pointer tw-my-0.5 active:tw-bg-blue-600 active:tw-text-white ${bgClass} ${textClass}`;
                    },
                    indicatorSeparator: () => 'tw-hidden',
                    placeholder: () => 'tw-text-start tw-text-gray-500 tw-text-sm',
                  }}
                  defaultOptions
                  loadOptionsOnMenuOpen
                />
                {errors.surveyIds && touched.surveyIds && (
                  <div className='tw-text-red-500 tw-text-sm tw-mt-1'>{errors.surveyIds}</div>
                )}
              </div>
            </div>
          </Modal>
        </Form>
      )}
    </Formik>
  );
};
