'use client';

import SurveyResponsesModal from '@/modules/protected/patient/orders/includes/Refills/includes/SurveyResponsesModal';
import { MobileCard } from '@/components/Dashboard/MobileCard';
import { Column, Table } from '@/components/Dashboard/Table';
import { FilterGroup } from '@/components/Dashboard/Table/includes/FilterGroup';
import { Pagination } from '@/components/Dashboard/Table/includes/Pagination';
import { MetaPayload } from '@/lib/types';
import {
  RefillSurveyRequest,
  useLazyCheckExistingRefillQuery,
  useLazyGetRefillSurveyRequestsQuery,
} from '@/store/slices/refillsApiSlice';
import { OrderType } from '@/store/slices/sortSlice';
import { useEffect, useMemo, useState } from 'react';
import { REFILL_STATUSES } from '@/constants';
import { RefillSurveyFormSidebar } from '@/components/Dashboard/orders/RefillSurveyFormSidebar';
import { ProposalModal } from '@/modules/protected/patient/orders/includes/Refills/includes/ProposalModal';
import { Order } from '@/store/slices/orderSlice';
import { FiPlus } from 'react-icons/fi';
import { updateArrayObjectByIdDeep } from '@/helpers/arrayUpdate';
import { Tooltip } from '@/components/elements/Tooltip';
import { SelectOrderModal } from '@/components/Dashboard/orders/SelectOrderModal';
import toast from 'react-hot-toast';

interface Props {
  activeKey: OrderType;
}

export default function Refills({ activeKey }: Readonly<Props>) {
  const [data, setData] = useState<RefillSurveyRequest[]>([]);
  const [showSelectOrderModal, setShowSelectOrderModal] = useState(false);
  const [showRefillSurveyForm, setShowRefillSurveyForm] = useState(false);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [showResponsesModal, setShowResponsesModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<RefillSurveyRequest | null>(null);
  const [meta, setMeta] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });

  const [getRefillSurveyRequests, { isFetching }] = useLazyGetRefillSurveyRequestsQuery();
  const [checkExistingRefill] = useLazyCheckExistingRefillQuery();

  async function handleFetchRefillsRequests({ meta, search, sortOrder, sortStatus }: MetaPayload) {
    try {
      const { page: pageNumber = 1, limit = 10 } = meta || {};
      const { data } = await getRefillSurveyRequests({
        ...(search && { search }),
        ...(sortStatus && { status: sortStatus }),
        ...(sortOrder && { sortOrder }),
        page: pageNumber,
        limit,
      }).unwrap();

      const { requests, total, page, totalPages } = data || {};

      setData(requests);
      setMeta({ page: page, totalPages: totalPages, total: total, limit: limit });
    } catch (error) {
      console.log(error);
    }
  }

  const columns: Column<RefillSurveyRequest>[] = [
    { header: 'Refill ID', accessor: 'uniqueRefillId', className: 'align-middle' },
    {
      header: 'Product Name',
      renderCell: (o) => {
        if (o.order?.category && o.order?.medicineType && o.order?.dosageType) {
          return `${o.order?.category} ${o.order?.medicineType} ${o.order?.dosageType}`;
        }
        return o.order?.productName ?? '-';
      },
      className: 'align-middle tw-capitalize',
    },
    {
      header: 'Refills count',
      accessor: 'vialsRequested',
    },
    {
      header: 'STATUS',
      renderCell: (o) => (
        <span className={'status-badge ' + o.status?.toLowerCase()}>{o.status.replace('_', ' ')}</span>
      ),
      className: 'align-middle',
    },
    {
      header: 'Replacement Price',
      renderCell: (refill) => (refill.replacementPrice?.amount ? `$${refill.replacementPrice?.amount}` : '-'),
    },
    {
      header: 'Remarks',
      renderCell: (o) => {
        if (!o.remarks) return '-';
        const maxLength = 80;
        const isTruncated = o.remarks.length > maxLength;
        const displayText = isTruncated ? `${o.remarks.substring(0, maxLength)}...` : o.remarks;

        if (!isTruncated) {
          return <span className='tw-max-w-xs tw-text-sm'>{displayText}</span>;
        }

        return (
          <Tooltip onClick={(e) => e.stopPropagation()} content={o.remarks} position='bottom'>
            <div className='tw-max-w-xs tw-text-sm tw-cursor-help'>{displayText}</div>
          </Tooltip>
        );
      },
      className: 'align-middle',
    },
    {
      header: 'Actions',
      renderCell: (o) =>
        o.status === 'on_hold' && o.replacementPrice?.id ? (
          <button
            className='btn btn-link text-sm text-nowrap p-0 text-primary'
            onClick={(e) => {
              e.stopPropagation();
              setSelectedRequest(o);
              setShowProposalModal(true);
            }}
          >
            View Request
          </button>
        ) : (
          '-'
        ),
      className: 'align-middle',
    },
  ];

  function handleClickRow(row: RefillSurveyRequest) {
    setSelectedRequest(row);
    setShowResponsesModal(true);
  }

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowSelectOrderModal(false);
    setShowRefillSurveyForm(true);
  };

  const handleCloseRefillSurveyForm = (refill?: RefillSurveyRequest | null) => {
    if (refill) {
      setData([refill, ...data]);
    }

    setShowRefillSurveyForm(false);
    setSelectedOrder(null);
  };

  const handleCloseProposalSuccess = (refill?: RefillSurveyRequest | null) => {
    if (refill) {
      const updatedRefillData = updateArrayObjectByIdDeep(data, refill);
      setData(updatedRefillData.length > 0 ? updatedRefillData : [refill, ...data]);
    }
  };

  const handleCloseProposalModal = () => {
    setShowProposalModal(false);
    setSelectedRequest(null);
  };

  const productName = useMemo(
    () =>
      selectedRequest?.order?.category && selectedRequest?.order?.medicineType && selectedRequest?.order?.dosageType
        ? `${selectedRequest?.order?.category} ${selectedRequest?.order?.medicineType} ${selectedRequest?.order?.dosageType}`
        : selectedRequest?.order?.productName || '',
    [selectedRequest]
  );

  useEffect(() => {
    if (activeKey === 'Refills') {
      handleFetchRefillsRequests({ meta: { page: 1, limit: 10 } as MetaPayload['meta'] });
    }
  }, [activeKey]);

  const handleRefillClick = async (order: Order) => {
    if (!order.id) {
      toast.error('Invalid order selected!');
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

      handleSelectOrder(order);
      return;
    } catch (error) {
      console.log('Unable to verify Refill Status!', error);
      setShowRefillSurveyForm(false);
      toast.error('Unable to verify Refill Status!');
    }
  };

  return (
    <>
      <FilterGroup
        visibility={{ showSearch: true, showStatusFilter: true, showSort: true }}
        handleChange={handleFetchRefillsRequests}
        filters={REFILL_STATUSES}
      />
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
      <div className='d-none d-lg-block table-responsive mt-4 tw-min-h-72'>
        <Table data={data} columns={columns} isFetching={isFetching && data.length === 0} rowOnClick={handleClickRow} />
      </div>
      {meta.totalPages > 1 && <Pagination meta={meta} handleUpdatePagination={handleFetchRefillsRequests} />}

      {/* Select Order Modal */}
      <SelectOrderModal
        isOpen={showSelectOrderModal}
        onClose={() => setShowSelectOrderModal(false)}
        onSelectOrder={handleRefillClick}
        isRefillReq={true}
      />

      {/* Refill Survey Form Modal */}
      <RefillSurveyFormSidebar
        isOpen={showRefillSurveyForm}
        onClose={handleCloseRefillSurveyForm}
        selectedOrder={selectedOrder}
      />

      {/* Proposal Modal */}
      <ProposalModal
        isOpen={showProposalModal}
        onClose={handleCloseProposalModal}
        request={selectedRequest}
        onSuccess={handleCloseProposalSuccess}
      />

      {/* Survey Responses Modal */}
      <SurveyResponsesModal
        isOpen={showResponsesModal}
        onClose={() => {
          setShowResponsesModal(false);
          setSelectedRequest(null);
        }}
        responses={selectedRequest?.formattedResponses || []}
        productName={productName}
      />
    </>
  );
}
