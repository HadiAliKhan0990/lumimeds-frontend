'use client';

import InfiniteScroll from 'react-infinite-scroll-component';
import toast from 'react-hot-toast';
import { PublicPharmacy } from '@/store/slices/adminPharmaciesSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, store } from '@/store';
import { useEffect, useState, useCallback } from 'react';
import {
  Prescription,
  useLazyGetPharmacyPrescriptionsQuery,
  PharmacyPrescriptionParams,
} from '@/store/slices/pharmaciesApiSlice';
import { MetaPayload } from '@/lib/types';
import { MobileCard } from '@/components/Dashboard/MobileCard';
import { Column, Table } from '@/components/Dashboard/Table';
import { FilterGroup } from '@/components/Dashboard/Table/includes/FilterGroup';
import { Spinner } from 'react-bootstrap';
import { PrescriptionsPopup } from '@/components/Dashboard/admin/pharmacies/PharmacyPrescriptions/includes/PrescriptionsPopup';
import { OrderPopup } from '@/modules/protected/admin/AdminOrdersPanel/orders/includes/OrderPopup';
import { setOrder } from '@/store/slices/orderSlice';
import { setSelectedOrderId } from '@/store/slices/selectedOrderSlice';
import { formatProviderName } from '@/lib/utils/providerName';
import { copyToClipboard, downloadFileFromBlob } from '@/lib/helper';
import { MdContentCopy } from 'react-icons/md';
import { formatCustom, formatUSDateTime } from '@/helpers/dateFormatter';
import { SortState } from '@/store/slices/sortSlice';
import { generatePrescriptionsExcel } from '@/helpers/pharmacy';
import { PharmacyDownloadPrescription } from '@/components/Dashboard/admin/pharmacies/PharmacyPrescriptions/includes/PharmacyDownloadPrescription';

interface Props {
  pharmacy: PublicPharmacy;
  onExportButton?: (handler: () => Promise<void>) => void;
}

type PrescriptionsData = {
  data: Prescription[];
  meta: SortState['meta'];
};

export function PharmacyPrescriptions({ pharmacy, onExportButton }: Readonly<Props>) {
  const dispatch = useDispatch();

  const pharmacyType = useSelector((state: RootState) => state.sort.pharmacyType);
  const search = useSelector((state: RootState) => state.sort.search);
  const sortField = useSelector((state: RootState) => state.sort.sortField);
  const sortOrder = useSelector((state: RootState) => state.sort.sortOrder);
  const dateRange = useSelector((state: RootState) => state.sort.dateRange);
  const [startDate, endDate] = dateRange || [null, null];

  const [prescriptions, setPrescriptions] = useState<PrescriptionsData>({ data: [], meta: { page: 1, limit: 30 } });
  const { data, meta } = prescriptions || {};
  const { page = 1, totalPages = 1 } = meta || {};

  const [show, setShow] = useState(false);
  const [prescription, setPrescription] = useState<Prescription>();
  const [openOrderModal, setOpenOrderModal] = useState(false);
  const order = useSelector((state: RootState) => state.order);

  const [getPharmacyPrescriptions, { isFetching }] = useLazyGetPharmacyPrescriptionsQuery();

  async function handleUpdatePrescriptions({
    meta,
    search,
    sortField,
    sortOrder,
    startDate,
    endDate,
    append = false,
  }: MetaPayload) {
    try {
      const { page = 1 } = meta || {};

      const pharmacyId = pharmacy.id ?? store?.getState()?.sort?.pharmacyType ?? '';

      const dates = {
        ...(startDate &&
          endDate && {
            startDate: formatCustom(new Date(startDate), 'yyyy-MM-dd'),
            endDate: formatCustom(new Date(endDate), 'yyyy-MM-dd'),
          }),
      };

      const res = await getPharmacyPrescriptions({
        search,
        sortField,
        page,
        limit: 30,
        pharmacyId,
        sortOrder,
        ...dates,
      }).unwrap();

      if (append) {
        setPrescriptions((prev) => ({
          data: [...prev.data, ...res.data],
          meta: res.meta,
        }));
      } else {
        setPrescriptions(res);
      }
    } catch (error) {
      console.log(error);
    }
  }

  function fetchMore() {
    if (page < totalPages && !isFetching) {
      handleUpdatePrescriptions({
        meta: { page: page + 1, limit: 30 },
        search,
        sortField,
        sortOrder,
        startDate,
        endDate,
        append: true,
      });
    }
  }

  function handleClickRow(p: Prescription) {
    setPrescription(p);
    setShow(true);
  }

  function handleClosePopup() {
    setPrescription(undefined);
    setShow(false);
  }

  const handleExportToCSV = useCallback(async () => {
    try {
      const pharmacyId = store?.getState()?.sort?.pharmacyType ?? '';

      const dates = {
        ...(startDate &&
          endDate && {
            startDate: formatCustom(new Date(startDate), 'yyyy-MM-dd'),
            endDate: formatCustom(new Date(endDate), 'yyyy-MM-dd'),
          }),
      };

      const params: PharmacyPrescriptionParams = {
        search,
        sortField,
        page: 1,
        limit: 10000, // Large limit to get all records
        pharmacyId,
        sortOrder,
        ...dates,
      };

      // Fetch all prescription data to generate Excel
      const res = await getPharmacyPrescriptions(params).unwrap();

      // Generate Excel file using helper
      const blob = await generatePrescriptionsExcel(res.data);

      const fileName = `pharmacy-prescriptions-${pharmacy.name}-${new Date().toISOString().split('T')[0]}.xlsx`;
      downloadFileFromBlob(blob, fileName);
      toast.success('Excel export started!');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast.error('Failed to export Excel. Please try again.');
    }
  }, [pharmacy, search, sortField, sortOrder, startDate, endDate, getPharmacyPrescriptions]);

  const columns: Column<Prescription>[] = [
    {
      header: 'Prescription id',
      renderCell: (row) =>
        row.prescriptionId ? (
          <div className='d-flex align-items-center gap-2'>
            <span className='text-nowrap'>{row.prescriptionId}</span>
            <MdContentCopy
              className='cursor-pointer text-primary'
              onClick={async (e) => {
                e.stopPropagation();
                try {
                  await copyToClipboard(row.prescriptionId);
                  toast.success('Prescription ID copied to clipboard');
                } catch {
                  toast.error('Failed to copy tracking ID');
                }
              }}
            />
          </div>
        ) : (
          <span className='text-nowrap'>Not generated yet</span>
        ),
    },
    {
      header: 'Patient',
      renderCell: (row) => (
        <button
          type='button'
          className='text-nowrap btn btn-link p-0 text-sm'
          onClick={(e) => {
            e.stopPropagation();

            if (row.orderId) {
              dispatch(setSelectedOrderId(row.orderId));
              dispatch(setOrder({ id: row.orderId }));
              setOpenOrderModal(true);
            } else {
              toast.error('Order does not exist!');
            }
          }}
        >
          {row.patient.firstName} {row.patient.lastName}
        </button>
      ),
    },
    {
      header: 'Patient Type',
      renderCell: (row) => (
        <span className={`status-badge ${row.orderId && row.patientid ? 'in-system' : 'walk-in'}`}>
          {row.orderId && row.patientid ? 'In-System' : 'Walk-In'}
        </span>
      ),
    },
    { header: 'PRODUCT NAME', renderCell: (row) => row.productDetails[0].drugName, className: 'text-nowrap' },
    {
      header: 'Signed by',
      renderCell: (row) => formatProviderName(row.doctor.firstName, row.doctor.lastName),
      className: 'text-nowrap',
    },
    {
      header: 'Email',
      renderCell(row) {
        return <span className='text-nowrap'>{row.patient.email}</span>;
      },
    },
    { header: 'courier', accessor: 'courier', className: 'text-uppercase' },
    {
      header: 'Status',
      renderCell: (row) => (
        <span className={`custom-badge custom-badge-${row.status.toLowerCase()}`}>
          {row?.status?.split('_')?.join('-')?.toLowerCase()}
        </span>
      ),
    },
    {
      header: 'Tracking ID',
      renderCell: (row) => (
        <div className='d-flex align-items-center gap-2'>
          <span className='text-nowrap'>{row.trackingId}</span>
          {!row.trackingId.toLowerCase().includes('yet') && (
            <MdContentCopy
              className='cursor-pointer text-primary'
              onClick={async (e) => {
                e.stopPropagation();
                try {
                  await copyToClipboard(row.trackingId);
                  toast.success('Tracking ID copied to clipboard');
                } catch {
                  toast.error('Failed to copy tracking ID');
                }
              }}
            />
          )}
        </div>
      ),
    },
    {
      header: 'Updated At',
      renderCell: (row) => {
        return formatUSDateTime(row?.updatedAt);
      },
    },
    {
      header: 'Actions',
      renderCell: (row) => {
        return <PharmacyDownloadPrescription prescription={row} />;
      },
    },
  ];

  useEffect(() => {
    if (!isFetching && pharmacyType === pharmacy.id) {
      handleUpdatePrescriptions({ meta: { page: 1, limit: 30 } as MetaPayload['meta'] });
    }
  }, [pharmacyType, pharmacy]);

  // Expose export handler to parent component
  useEffect(() => {
    if (onExportButton) {
      onExportButton(handleExportToCSV);
    }
  }, [onExportButton, handleExportToCSV]);

  return (
    <>
      <div className='row align-items-center mb-4'>
        <div className='text-lg fw-medium d-none text-capitalize d-lg-flex align-items-center gap-2 col-lg-4 col-xl-6'>
          {pharmacy.name}
          {isFetching && <Spinner className='border-2' size='sm' />}
        </div>
        <div className={`col-lg-8 col-xl-6 text-end`}>
          <FilterGroup
            handleChange={handleUpdatePrescriptions}
            extendedSortOptions={true}
            isPrescriptions={true}
            visibility={{
              showSearch: true,
              showSort: true,
              showDateRange: true,
              showDateRangeClassName: 'col-lg-6 col-xl-3',
            }}
          />
        </div>
      </div>

      <div className='d-lg-none'>
        <InfiniteScroll
          key={`mobile-${search}-${sortField}-${sortOrder}-${startDate}-${endDate}`}
          dataLength={data.length}
          next={fetchMore}
          hasMore={page < totalPages && !isFetching}
          loader={
            <div className='d-flex justify-content-center py-4'>
              <Spinner className='border-2' size='sm' />
            </div>
          }
          height={'100vh'}
        >
          <MobileCard
            rowOnClick={handleClickRow}
            loading={isFetching && data.length === 0}
            data={data}
            columns={columns}
          />
        </InfiniteScroll>
      </div>
      <div className=' d-none d-lg-block'>
        <InfiniteScroll
          key={`desktop-${search}-${sortField}-${sortOrder}-${startDate}-${endDate}`}
          dataLength={data.length}
          next={fetchMore}
          hasMore={page < totalPages && !isFetching}
          loader={
            <div className='d-flex justify-content-center py-4'>
              <Spinner className='border-2' size='sm' />
            </div>
          }
          height={'calc(100vh - 276px)'}
        >
          <Table
            rowOnClick={handleClickRow}
            isFetching={isFetching && data.length === 0}
            data={data}
            columns={columns}
          />
        </InfiniteScroll>
      </div>

      <OrderPopup
        hidePatientBtn
        show={openOrderModal}
        onHide={() => setOpenOrderModal(false)}
        orderUniqueId={order?.orderUniqueId}
      />

      <PrescriptionsPopup prescription={prescription} show={show} onHide={handleClosePopup} />
    </>
  );
}
