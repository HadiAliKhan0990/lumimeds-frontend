'use client';

import { Column, Table } from '@/components/Dashboard/Table';
import { formatToUSD } from '@/lib/helper';
import { Order } from '@/store/slices/orderSlice';
import { useRouter } from 'next/navigation';
import { WiTime8 } from 'react-icons/wi';
import { HiOutlineExternalLink } from 'react-icons/hi';
import { useLazyGetPatientOrdersQuery } from '@/store/slices/ordersApiSlice';
import { Error as ErrorType, MetaPayload } from '@/lib/types';
import { Pagination } from '@/components/Dashboard/Table/includes/Pagination';
import { FilterGroup } from '@/components/Dashboard/Table/includes/FilterGroup';
import { SortState } from '@/store/slices/sortSlice';
import { useEffect, useState } from 'react';
import { MobileCard } from '@/components/Dashboard/MobileCard';
import { RowActions } from '@/modules/protected/patient/orders/includes/Orders/includes/RowActions';
import { RefillSurveyFormSidebar } from '@/components/Dashboard/orders/RefillSurveyFormSidebar';
import { SelectOrderModal } from '@/components/Dashboard/orders/SelectOrderModal';
import { ContactAdminModal } from '@/modules/protected/patient/orders/includes/Orders/includes/ContactAdminModal';
import { formatProviderNameFromString } from '@/lib/utils/providerName';
import { formatUSDate, formatUSTime } from '@/helpers/dateFormatter';
import { FiPlus } from 'react-icons/fi';
import { formatOrderStatusForPatient } from '@/lib';
import { useContactAdminMutation } from '@/store/slices/patientsApiSlice';
import { useLazyCheckExistingRefillQuery } from '@/store/slices/refillsApiSlice';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import Modal from '@/components/elements/Modal';

interface Props {
  activeKey: SortState['orderType'];
}

type PatientOrdersType = {
  data: Order[];
  meta: SortState['meta'];
};

export default function Orders({ activeKey }: Readonly<Props>) {
  const { push } = useRouter();

  const [showRefillSurveyForm, setShowRefillSurveyForm] = useState(false);
  const [showSelectOrderModal, setShowSelectOrderModal] = useState(false);
  const [showContactAdminModal, setShowContactAdminModal] = useState(false);
  const [showRemarksModal, setShowRemarksModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [contactAdminOrder, setContactAdminOrder] = useState<Order | null>(null);
  const [selectedRemarks, setSelectedRemarks] = useState<string>('');
  const [patientOrders, setPatientOrders] = useState<PatientOrdersType>({
    data: [],
    meta: { page: 1, limit: 10, totalPages: 1 },
  });

  const { data = [], meta } = patientOrders || {};
  const { totalPages = 1 } = meta || {};

  const [triggerGetPatientOrders, { isFetching }] = useLazyGetPatientOrdersQuery();
  const [contactAdmin] = useContactAdminMutation();
  const [checkExistingRefill] = useLazyCheckExistingRefillQuery();

  async function handleUpdateOrders({ meta, search, sortStatus, sortOrder, sortField, orderFilterType }: MetaPayload) {
    try {
      const response = await triggerGetPatientOrders({
        search,
        sortStatus,
        sortOrder,
        meta,
        sortField,
        type: orderFilterType,
      }).unwrap();

      if (response.orders && response.meta) {
        setPatientOrders({ data: response.orders, meta: response.meta });
      }
    } catch (error) {
      console.log(error);
    }
  }

  function handleClickRow(row: Order) {
    push(`/patient/orders/${row.id}`);
  }

  const handleSelectOrder = async (order: Order) => {
    if (!order.id) {
      toast.error('Order ID is missing');
      return;
    }

    try {
      const result = await checkExistingRefill(order.id).unwrap();

      if (result.success && result.data?.exists) {
        const status = result.data.refillRequest?.status || 'in progress';
        const statusText = status === 'open' ? 'in progress' : status === 'on_hold' ? 'on hold' : 'in progress';
        toast.error(
          `Refill request is already ${statusText} for this order. Please wait for the current request to be processed.`
        );
        setShowSelectOrderModal(false);
        return;
      }

      setSelectedOrder(order);
      setShowSelectOrderModal(false);
      setShowRefillSurveyForm(true);
    } catch (error) {
      setShowSelectOrderModal(false);
      toast.error(
        isAxiosError(error)
          ? error.response?.data?.message || 'Unable to verify refill status!'
          : (error as ErrorType)?.data?.message || 'Unable to verify refill status!'
      );
    }
  };

  const handleContactAdmin = (order: Order) => {
    setContactAdminOrder(order);
    setShowContactAdminModal(true);
  };

  const handleSubmitContactAdmin = async (message: string, orderId: string) => {
    await contactAdmin({ message, orderId }).unwrap();
  };

  useEffect(() => {
    if (activeKey === 'Orders') {
      handleUpdateOrders({ meta: { page: 1, limit: 10 } });
    }
  }, [activeKey]);

  const columns: Column<Order>[] = [
    {
      header: 'ORDER ID',
      renderCell: (o) => {
        return o.orderUniqueId ? (
          o.orderUniqueId
        ) : (
          <div className='d-flex justify-content-center align-items-center pending-id'>
            <WiTime8 size={17} />
            <span className='ms-1'>Pending ID</span>
          </div>
        );
      },
    },
    {
      header: 'DATE & TIME',
      renderCell: (o) => (o.createdAt ? `${formatUSDate(o.createdAt)} ${formatUSTime(o.createdAt)}` : '-'),
    },
    {
      header: 'ORDER TOTAL',
      renderCell: (o) => (o.amount != null ? formatToUSD(Number(o.amount) * 100) : '-'),
    },
    {
      header: 'PRODUCT',
      renderCell(row) {
        if (row.category && row.medicineType && row.dosageType) {
          return `${row.category} ${row.medicineType} ${row.dosageType}`;
        }
        return row.requestedProductName ?? '-';
      },
      className: 'max-w-320px tw-capitalize',
    },
    {
      header: 'PROVIDER',
      renderCell: (o) => <span className='provider-email'>{formatProviderNameFromString(o?.providerName) || '-'}</span>,
      className: 'text-nowrap',
    },
    {
      header: 'PLAN',
      renderCell: (o) => (o.duration ? `${o.duration} Month(s)` : 'One Time'),
      className: 'text-nowrap',
    },
    {
      header: 'STATUS',
      renderCell: (o) => {
        if (o?.status === 'Pending_Renewal_Intake' && o?.renewalIntakeSurveyUrl) {
          return (
            <a
              href={o?.renewalIntakeSurveyUrl}
              target='_blank'
              rel='noopener noreferrer'
              onClick={(e) => e.stopPropagation()}
              className={`status-badge ${o?.status?.toLowerCase()} tw-inline-flex tw-no-underline tw-items-center tw-gap-1 tw-cursor-pointer hover:tw-opacity-80 tw-transition-opacity`}
            >
              {o.status ? formatOrderStatusForPatient(o.status, true) : '-'}
              <HiOutlineExternalLink className='tw-w-4 tw-h-4' />
            </a>
          );
        }

        const formattedStatus = o.status ? formatOrderStatusForPatient(o.status, true) : '-';
        const isActionRequired =
          o.status === 'Action_Required' || o.status === 'Rolled_Back' || o.status === 'Reverted';

        return (
          <div className='d-flex flex-column'>
            <span className={`status-badge ${o?.status?.toLowerCase()}`}>{formattedStatus}</span>
            {isActionRequired && (
              <span className='tw-text-xs tw-text-muted tw-mt-1'>Please contact the support team</span>
            )}
          </div>
        );
      },
    },
    {
      header: 'VISIT TYPE',
      renderCell: (o) => {
        const visitType = o?.visitType;
        if (!visitType || visitType.trim() === '') {
          return <span className='text-muted'>N/A</span>;
        }
        return (
          <span className={`badge ${visitType === 'video' ? 'bg-primary' : 'bg-secondary'} text-capitalize`}>
            {visitType.toLowerCase()}
          </span>
        );
      },
    },
    {
      header: 'ORDER TYPE',
      accessor: 'type',
      className: 'text-capitalize',
    },
    {
      header: 'REMARKS',
      renderCell: (o) => {
        if (!o.patientRemarks || o.patientRemarks.trim() === '') {
          return <span className='text-muted'>-</span>;
        }

        return (
          <button
            type='button'
            className='tw-text-primary tw-text-sm tw-underline tw-underline-offset-4 tw-bg-transparent tw-border-0 tw-p-0'
            onClick={(e) => {
              e.stopPropagation();
              setSelectedRemarks(o.patientRemarks || '');
              setShowRemarksModal(true);
            }}
          >
            View Remarks
          </button>
        );
      },
      className: 'text-nowrap',
    },
    {
      header: 'ACTION',
      renderCell: (o) => (
        <RowActions
          order={o}
          setSelectedOrder={async (order) => {
            if (!order.id) {
              toast.error('Order ID is missing');
              return;
            }

            try {
              const result = await checkExistingRefill(order.id).unwrap();

              if (result.success && result.data?.exists) {
                const status = result.data.refillRequest?.status || 'in progress';
                const statusText = status === 'open' ? 'in progress' : status === 'on_hold' ? 'on hold' : 'in progress';
                toast.error(
                  `Refill request is already ${statusText} for this order. Please wait for the current request to be processed.`
                );
                return;
              }

              setSelectedOrder(order);
              setShowRefillSurveyForm(true);
            } catch (error) {
              console.error('Error checking existing refill:', error);
              setSelectedOrder(order);
              setShowRefillSurveyForm(true);
            }
          }}
          onContactAdmin={handleContactAdmin}
        />
      ),
    },
  ];

  return (
    <>
      <FilterGroup defaultFilterValue='Status' extendedSortOptions={true} handleChange={handleUpdateOrders} />
      <button
        onClick={() => setShowSelectOrderModal(true)}
        className='tw-flex tw-items-center tw-justify-center tw-gap-2 tw-px-4 tw-py-2 tw-bg-blue-600 tw-text-white tw-text-sm tw-font-medium tw-rounded-md hover:tw-bg-blue-700 tw-transition-colors tw-whitespace-nowrap tw-mt-6 tw-ml-auto'
      >
        <FiPlus className='tw-w-4 tw-h-4' />
        Request Refill
      </button>
      <div className='d-lg-none mt-4'>
        <MobileCard
          data={data}
          columns={columns}
          loading={isFetching && data.length === 0}
          rowOnClick={handleClickRow}
        />
      </div>
      <div className='d-none d-lg-block mt-5 tw-overflow-visible tw-min-h-80 table-responsive'>
        <Table data={data} columns={columns} isFetching={isFetching && data.length === 0} rowOnClick={handleClickRow} />
      </div>

      {totalPages > 1 && <Pagination meta={meta} handleUpdatePagination={handleUpdateOrders} />}

      {/* <div className='text-center mt-4'>
        <span className='me-2 fw-semibold'>Looking for previous order history?</span>
        <a
          href='https://woo.lumimeds.com/'
          className='text-primary text-decoration-underline tw-inline-flex tw-items-center tw-gap-2'
          target='_blank'
          rel='noopener noreferrer'
        >
          Access our old billing portal here
          <GoArrowRight />
        </a>
      </div> */}

      {/* Modals */}
      <SelectOrderModal
        isOpen={showSelectOrderModal}
        onClose={() => setShowSelectOrderModal(false)}
        onSelectOrder={handleSelectOrder}
        isRefillReq={true}
      />
      <RefillSurveyFormSidebar
        selectedOrder={selectedOrder}
        isOpen={showRefillSurveyForm}
        onClose={() => {
          setSelectedOrder(null);
          setShowRefillSurveyForm(false);
        }}
      />
      <ContactAdminModal
        isOpen={showContactAdminModal}
        onClose={() => {
          setContactAdminOrder(null);
          setShowContactAdminModal(false);
        }}
        order={contactAdminOrder}
        onSubmit={handleSubmitContactAdmin}
      />
      <Modal
        isOpen={showRemarksModal}
        onClose={() => {
          setShowRemarksModal(false);
          setSelectedRemarks('');
        }}
        title='Order Remarks'
        size='md'
      >
        <div className='tw-whitespace-pre-wrap tw-text-left tw-pb-4'>{selectedRemarks}</div>
      </Modal>
    </>
  );
}
