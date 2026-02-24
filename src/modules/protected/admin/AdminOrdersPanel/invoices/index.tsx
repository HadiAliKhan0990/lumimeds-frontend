'use client';

import FilterButton from '@/components/Dashboard/FilterButton';
import InfiniteScroll from 'react-infinite-scroll-component';
import { MobileCard } from '@/components/Dashboard/MobileCard';
import { Column, Table } from '@/components/Dashboard/Table';
import { capitalizeFirst, formatToUSD, scrollToTop } from '@/lib/helper';
import { MetaPayload } from '@/lib/types';
import { RootState } from '@/store';
import { useLazyGetInvoicesQuery } from '@/store/slices/invoicesApiSlice';
import { Invoice } from '@/store/slices/invoiceSlice';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Spinner } from 'react-bootstrap';
import { appendInvoicesData, setInvoicesData } from '@/store/slices/invoicesSlice';
import { useAdminOrdersPage } from '@/contexts/AdminOrdersPageContext';

const columns: Column<Invoice>[] = [
  { header: 'INVOICE NO.', accessor: 'invoiceNumber' },
  { header: 'PATIENT', renderCell: (row) => `${row.patient?.firstName} ${row.patient?.lastName}` },
  {
    header: 'status',
    renderCell: (row) => (
      <span className={`status-badge ${row?.status?.toLowerCase()}`}>
        {capitalizeFirst(
          row?.status?.includes('_')
            ? row?.status?.includes('cancel')
              ? 'Cancelled'
              : row?.status.replace('_', ' ')
            : row?.status
        )}
      </span>
    ),
  },
  { header: 'BILLING REASON', accessor: 'billingReason' },
  {
    header: 'AMOUNT',
    renderCell: (row) => {
      const amount = Number(row.amount);
      return <span className={amount === 0 ? 'coupon-adjust2' : ''}>{formatToUSD(amount * 100)}</span>;
    },
  },
];

export default function Invoices() {
  const dispatch = useDispatch();

  const orderType = useSelector((state: RootState) => state.sort.orderType);
  const invoicesData = useSelector((state: RootState) => state.invoices);
  const search = useSelector((state: RootState) => state.sort.search);
  const sortOrder = useSelector((state: RootState) => state.sort.sortOrder);
  const sortField = useSelector((state: RootState) => state.sort.sortField);

  const { setSelectedPageFilters } = useAdminOrdersPage();

  const { data = [], meta } = invoicesData || {};
  const { totalPages = 1, page: currentPage = 1 } = meta || {};

  const [triggerInvoices, { isFetching }] = useLazyGetInvoicesQuery();

  const handleUpdateInvoices = async ({
    meta,
    search,
    sortField,
    sortOrder,
    sortStatus,
    append = false,
  }: MetaPayload) => {
    try {
      const { data: res } = await triggerInvoices({
        search,
        page: meta?.page || 1,
        limit: 30,
        ...(sortStatus && { status: sortStatus }),
        sortOrder,
        sortField,
      });

      const { page, invoiceData: newInvoices } = res?.data || {};

      if (append) {
        dispatch(
          appendInvoicesData({
            meta: { page: page || 1, total: res?.data.total, totalPages: res?.data.totalPages, limit: 30 },
            data: newInvoices,
          })
        );
      } else {
        await scrollToTop('invoice-table-top');
        dispatch(
          setInvoicesData({
            data: newInvoices,
            meta: { page: page || 1, total: res?.data.total, totalPages: res?.data.totalPages, limit: 30 },
          })
        );
      }
    } catch (error) {
      console.error('Error fetching Subscriptions:', error);
    }
  };

  const fetchMore = () => {
    if (currentPage < totalPages && !isFetching) {
      handleUpdateInvoices({
        meta: { page: currentPage + 1, limit: 30 },
        search,
        sortOrder,
        sortField,
        append: true,
      });
    }
  };

  useEffect(() => {
    if (orderType === 'Invoices') {
      handleUpdateInvoices({});

      setSelectedPageFilters(
        <FilterButton
          onFilterChange={handleUpdateInvoices}
          visibility={{
            showSearch: true,
            showSort: true,
            showStatusFilter: true,
            showSearchClassName: 'col-md-6 col-lg-4 col-xl-3',
            showSortClassName: 'col-md-6 col-lg-4 col-xl-3',
            showStatusFilterClassName: 'col-md-6 col-lg-4 col-xl-3',
          }}
        />
      );
    }
  }, [orderType]);

  const allInvoicesLoaded = currentPage >= totalPages;

  return (
    <>
      <div className='d-lg-none'>
        <InfiniteScroll
          dataLength={data.length}
          next={fetchMore}
          hasMore={!allInvoicesLoaded}
          loader={
            <div className='d-flex justify-content-center py-4'>
              <Spinner className='border-2' />
            </div>
          }
          height={`calc(100vh - 9rem)`}
        >
          <MobileCard loading={isFetching && data.length === 0} data={data} columns={columns} />
        </InfiniteScroll>
      </div>

      <div className='d-none d-lg-block'>
        <InfiniteScroll
          dataLength={data.length}
          next={fetchMore}
          hasMore={!allInvoicesLoaded}
          loader={
            <div className='d-flex justify-content-center py-4'>
              <Spinner className='border-2' />
            </div>
          }
          height={'calc(100vh - 198px)'}
        >
          <div id='invoice-table-top' />
          <Table data={data} columns={columns} isFetching={isFetching && data.length === 0} />
        </InfiniteScroll>
      </div>
    </>
  );
}
