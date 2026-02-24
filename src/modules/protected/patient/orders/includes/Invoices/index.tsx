'use client';

import { useState, useEffect } from 'react';
import { Invoice } from '@/store/slices/invoiceSlice';
import { Column, Table } from '@/components/Dashboard/Table';
import { formatToUSD } from '@/lib/helper';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { Dropdown } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useLazyGetPatientInvoicesQuery } from '@/store/slices/invoicesApiSlice';
import { MetaPayload } from '@/lib/types';
import { SortState } from '@/store/slices/sortSlice';
import { Pagination } from '@/components/Dashboard/Table/includes/Pagination';
import { FilterGroup } from '@/components/Dashboard/Table/includes/FilterGroup';
import { InvoicePreviewModal } from './includes/InvoicePreviewModal';
import { MobileCard } from '@/components/Dashboard/MobileCard';
import { CustomToggle } from '@/components/Dashboard/CustomToggle';

interface Props {
  activeKey: SortState['orderType'];
}

export default function Invoices({ activeKey }: Readonly<Props>) {
  const [triggerGetPatientInvoices, { isFetching }] = useLazyGetPatientInvoicesQuery();

  const router = useRouter();

  const invoicesData = useSelector((state: RootState) => state.invoices);
  const { data, meta } = invoicesData || {};
  const { totalPages = 1 } = meta || {};

  const [showModal, setShowModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [modalAction, setModalAction] = useState<'print' | 'download' | null>(null);

  async function handleUpdateInvoices({ meta, search, sortStatus, sortOrder }: MetaPayload) {
    try {
      await triggerGetPatientInvoices({
        meta: { page: meta?.page ?? 1, limit: 10 },
        sortOrder,
        sortStatus,
        search,
      });
    } catch (error) {
      console.log(error);
    }
  }

  const columns: Column<Invoice>[] = [
    { header: 'INVOICE NO.', accessor: 'invoiceNumber' },
    {
      header: 'DESCRIPTION',
      renderCell: (o) => <p className='m-0'>{o.description || '-'}</p>,
    },
    {
      header: 'STATUS',
      renderCell: (o) => (
        <span className={`status-badge text-nowrap text-capitalize ${o.status?.toLowerCase()}`}>
          {o.status?.replace('_', ' ')}
        </span>
      ),
    },
    {
      header: 'AMOUNT PAID',
      renderCell: (o) => <p className='m-0'>{o.amountPaid != null ? formatToUSD(Number(o.amountPaid) * 100) : '-'}</p>,
    },
    // {
    //   header: 'PAYMENT DATE',
    //   renderCell: (o) => {
    //     const date = new Date(o.paymentDate ?? '');
    //     return (
    //       <p className='m-0'>
    //         {isNaN(date.getTime())
    //           ? '-'
    //           : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)}
    //       </p>
    //     );
    //   },
    // },

    {
      header: 'PAYMENT METHOD',
      renderCell: (o) => {
        const method = o.paymentMethod;
        const formatted = method ? method.charAt(0).toUpperCase() + method.slice(1) : '-';
        return <p className='m-0'>{formatted}</p>;
      },
    },
    {
      header: 'ACTIONS',
      renderCell: (row) => (
        <div className='d-flex w-100' onClick={(e) => e.stopPropagation()}>
          <Dropdown align='end'>
            <Dropdown.Toggle as={CustomToggle}>
              <BsThreeDotsVertical className='text-primary' />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item
                as='button'
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedInvoice(row);
                  setModalAction('print');
                  setShowModal(true);
                }}
              >
                Print Invoice
              </Dropdown.Item>
              <Dropdown.Item
                as='button'
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedInvoice(row);
                  setModalAction('download');
                  setShowModal(true);
                }}
              >
                Download PDF
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      ),
    },
  ];

  function handleClickRow(row: Invoice) {
    if (row.id) {
      router.push(`/patient/orders/invoices/${row.id}`);
    }
  }

  useEffect(() => {
    if (activeKey === 'Invoices') {
      handleUpdateInvoices({ meta: { page: 1, limit: 10 } as MetaPayload['meta'] });
    }
  }, [activeKey]);

  return (
    <>
      <FilterGroup defaultFilterValue='Status' isPatient={true} handleChange={handleUpdateInvoices} />
      <div className='d-lg-none'>
        <MobileCard data={data || []} columns={columns} loading={isFetching} rowOnClick={handleClickRow} />
      </div>
      <div className='d-none d-lg-block mt-5'>
        <Table data={data} columns={columns} isFetching={isFetching} rowOnClick={handleClickRow} />
      </div>
      {totalPages > 1 && <Pagination meta={meta} handleUpdatePagination={handleUpdateInvoices} />}

      {/* Invoice Preview Modal */}
      <InvoicePreviewModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setModalAction(null);
        }}
        selectedInvoice={selectedInvoice}
        modalAction={modalAction}
      />
    </>
  );
}
