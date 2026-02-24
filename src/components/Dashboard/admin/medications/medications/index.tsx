'use client';

import InfiniteScroll from 'react-infinite-scroll-component';
import { MobileCard } from '@/components/Dashboard/MobileCard';
import { Column, Table } from '@/components/Dashboard/Table';
import { Medication, setMedication } from '@/store/slices/medicationSlice';
import { useEffect, useState } from 'react';
import { MedicationType } from '@/components/Dashboard/admin/medications/medications/includes/MedicationType';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { PharmacySelect } from '@/components/Dashboard/admin/medications/medications/includes/PharmacySelect';
import { setPopup } from '@/store/slices/popupSlice';
import { FilterGroup } from '@/components/Dashboard/Table/includes/FilterGroup';
import { useLazyGetMedicationsQuery } from '@/store/slices/medicationsApiSlice';
import { MetaPayload } from '@/lib/types';
import { useLazyGetPharmaciesQuery } from '@/store/slices/pharmaciesApiSlice';
import { SortState } from '@/store/slices/sortSlice';
import { Spinner } from 'react-bootstrap';
import { scrollToTop } from '@/lib/helper';

type MedicationsType = {
  data: Medication[];
  meta: SortState['meta'];
};

export default function Medications() {
  const dispatch = useDispatch();

  const medicationType = useSelector((state: RootState) => state.medication.medicationType);
  const search = useSelector((state: RootState) => state.sort.search);
  const sortField = useSelector((state: RootState) => state.sort.sortField);
  const sortOrder = useSelector((state: RootState) => state.sort.sortOrder);
  const sortStatus = useSelector((state: RootState) => state.sort.sortStatus);

  const [medicationsData, setMedicationsData] = useState<MedicationsType>({
    data: [] as Medication[],
    meta: { page: 1, limit: 30 },
  });
  const { data, meta } = medicationsData || {};
  const { totalPages = 1, page: currentPage = 1 } = meta || {};

  const [triggerMedications, { isFetching }] = useLazyGetMedicationsQuery();
  const [triggerPharmacies] = useLazyGetPharmaciesQuery();

  const appendMeedicationsDataLocally = (currentData: MedicationsType, newData: MedicationsType): MedicationsType => {
    if (currentData?.data) {
      const existingIds = new Set(currentData.data.map((medication) => medication.id));
      const uniqueNewMedications = (newData?.data || []).filter((medication) => !existingIds.has(medication.id));

      return {
        data: [...currentData.data, ...uniqueNewMedications],
        meta: newData?.meta || currentData.meta,
      };
    } else {
      // If no existing data, return the new data
      return {
        data: newData?.data || [],
        meta: newData?.meta,
      };
    }
  };

  async function handleFetchMedications({
    meta,
    search,
    sortField,
    sortOrder,
    sortStatus,
    append = false,
  }: MetaPayload) {
    try {
      const { data } = await triggerMedications({
        search,
        sortField,
        sortOrder,
        meta: { page: meta?.page || 1, limit: 30 },
        sortStatus,
      });

      if (append) {
        setMedicationsData((prev) =>
          appendMeedicationsDataLocally(prev, {
            data: data?.data || [],
            meta: data?.meta,
          })
        );
      } else {
        await scrollToTop('medications-table-top');
        setMedicationsData({ data: data?.data || [], meta: data?.meta });
      }
    } catch (error) {
      console.log(error);
    }
  }

  const fetchMore = () => {
    if (currentPage < totalPages && !isFetching) {
      if (search || sortOrder || sortStatus || sortField) {
        handleFetchMedications({
          meta: { page: currentPage + 1, limit: 30 },
          search,
          sortField,
          sortOrder,
          sortStatus,
          append: true,
        });
      } else {
        handleFetchMedications({
          meta: { page: currentPage + 1, limit: 30 },
          append: true,
        });
      }
    }
  };
  function handleRowClick(medication: Medication) {
    dispatch(setPopup(true));
    dispatch(setMedication({ ...medication, medicationType: 'Medications' }));
  }

  useEffect(() => {
    if (medicationType === 'Medications') {
      handleFetchMedications({ meta: { page: 1, limit: 10 } as MetaPayload['meta'] });
    }
  }, [medicationType]);

  useEffect(() => {
    triggerPharmacies();
  }, []);

  const allMedicationsLoaded = currentPage >= totalPages;
  return (
    <>
      <div className='row justify-content-end align-items-center mt-4'>
        <span className='text-lg fw-medium d-none d-lg-block col-lg-4 col-xl-6'>Medications</span>
        <div className='col-lg-8 col-xl-6'>
          <FilterGroup handleChange={handleFetchMedications} />
        </div>
      </div>
      <div className='d-md-none mt-4'>
        <InfiniteScroll
          dataLength={data?.length || 0}
          next={fetchMore}
          hasMore={!allMedicationsLoaded}
          loader={
            <div className='d-flex justify-content-center py-4'>
              <Spinner size='sm' />
            </div>
          }
          height={`calc(100vh - 400px)`}
        >
          <MobileCard
            loading={isFetching && data.length === 0}
            data={data || []}
            columns={columns}
            rowOnClick={handleRowClick}
          />
        </InfiniteScroll>
      </div>
      <div className='d-none d-md-block mt-4'>
        <InfiniteScroll
          dataLength={data.length}
          next={fetchMore}
          hasMore={!allMedicationsLoaded}
          loader={
            <div className='d-flex justify-content-center py-4'>
              <Spinner size='sm' />
            </div>
          }
          height={`calc(100vh - 280px)`}
        >
          <div id='medications-table-top' />
          <Table
            data={data || []}
            columns={columns}
            isFetching={isFetching && data.length === 0}
            rowOnClick={handleRowClick}
          />
        </InfiniteScroll>
      </div>
    </>
  );
}

const columns: Column<Medication>[] = [
  {
    header: 'TYPE',
    renderCell: (row) => <MedicationType medication={row} />,
  },
  {
    header: 'PRODUCT DESCRIPTION',
    renderCell: (row) => <div className='product_description overflow-hidden'>{row.description || '-'}</div>,
  },
  { header: 'dosage', accessor: 'dosage' },
  {
    header: 'PHARMACY',
    renderCell: (o) => <PharmacySelect medication={o} />,
  },
];
