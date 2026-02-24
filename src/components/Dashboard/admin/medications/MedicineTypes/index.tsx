'use client';

import { MobileCard } from '@/components/Dashboard/MobileCard';
import { Column, Table } from '@/components/Dashboard/Table';
import { FilterGroup } from '@/components/Dashboard/Table/includes/FilterGroup';
import { scrollToTop } from '@/lib/helper';
import { MetaPayload } from '@/lib/types';
import { RootState } from '@/store';
import { useLazyGetMedicineTypesQuery } from '@/store/slices/medicationsApiSlice';
import { setMedicineTypesData } from '@/store/slices/medicineTypesSlice';
import { MedicineType } from '@/types/medications';
import { useEffect, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { UpdateManageMedicineTypeModal } from '@/components/Dashboard/admin/medications/MedicineTypes/includes/UpdateMedicineTypeModal';
import InfiniteScroll from 'react-infinite-scroll-component';

export default function MedicineTypes() {
  const dispatch = useDispatch();

  const medicationType = useSelector((state: RootState) => state.medication.medicationType);
  const search = useSelector((state: RootState) => state.sort.search);
  const medicineTypesData = useSelector((state: RootState) => state.medicineTypes);
  const { medicineTypes, meta } = medicineTypesData || {};
  const { totalPages = 1, page: currentPage = 1 } = meta || {};

  const allDataLoaded = currentPage >= totalPages;

  const [selectedMedicineType, setSelectedMedicineType] = useState<MedicineType>();
  const [show, setShow] = useState(false);

  const [getMedicineTypes, { isFetching }] = useLazyGetMedicineTypesQuery();

  async function handleMedicineTypes({ meta, search, append }: MetaPayload) {
    try {
      const { data } = await getMedicineTypes({ meta, search });
      const { medicineTypes: newData = [], meta: metaData } = data || {};

      if (append) {
        dispatch(setMedicineTypesData({ medicineTypes: [...medicineTypes, ...newData], meta: metaData }));
      } else {
        await scrollToTop('medicine_type_table_top');
        dispatch(setMedicineTypesData({ medicineTypes: newData, meta: metaData }));
      }
    } catch (error) {
      console.log(error);
    }
  }

  const fetchMore = () => {
    if (currentPage < totalPages && !isFetching) {
      handleMedicineTypes({
        meta: { page: currentPage + 1, limit: 30 },
        search,
        append: true,
      });
    }
  };

  function handleRowClick(med: MedicineType) {
    setSelectedMedicineType(med);
    setShow(true);
  }

  useEffect(() => {
    if (medicationType === 'Medicine Types') handleMedicineTypes({ meta: { page: 1, limit: 30 } });
  }, [medicationType]);
  return (
    <>
      <div className='row align-items-center mt-4'>
        <span className='text-lg fw-medium d-none d-lg-block col-lg-4 col-xl-6'>Medicine Types</span>
        <div className='col-lg-8 col-xl-6'>
          <FilterGroup
            handleChange={handleMedicineTypes}
            visibility={{ showMultiSelect: false, showSort: false, showStatusFilter: false, showSearch: true }}
          />
        </div>
      </div>
      <div className='d-md-none mt-4'>
        <InfiniteScroll
          dataLength={medicineTypes.length}
          next={fetchMore}
          hasMore={!allDataLoaded}
          loader={
            <div className='d-flex justify-content-center py-4'>
              <Spinner className='border-2' size='sm' />
            </div>
          }
          height={`calc(100vh - 400px)`}
        >
          <MobileCard
            loading={isFetching && medicineTypes.length === 0}
            data={medicineTypes}
            columns={columns}
            rowOnClick={handleRowClick}
          />
        </InfiniteScroll>
      </div>
      <div className='table-responsive d-none d-md-block mt-4'>
        <InfiniteScroll
          dataLength={medicineTypes.length}
          next={fetchMore}
          hasMore={!allDataLoaded}
          loader={
            <div className='d-flex justify-content-center py-4'>
              <Spinner className='border-2' size='sm' />
            </div>
          }
          height={`calc(100vh - 276px)`}
        >
          <div id='medicine_type_table_top' />
          <Table
            data={medicineTypes}
            columns={columns}
            isFetching={isFetching && medicineTypes.length === 0}
            rowOnClick={handleRowClick}
          />
        </InfiniteScroll>
      </div>

      {/* Modals */}

      <UpdateManageMedicineTypeModal
        show={show}
        onHide={() => setShow(false)}
        selectedMedicineType={selectedMedicineType}
        onSuccess={handleMedicineTypes}
      />
    </>
  );
}

const columns: Column<MedicineType>[] = [
  { header: 'Name', renderCell: (row) => <span className='text-capitalize'>{row.name}</span> },
  {
    header: 'categories',
    renderCell: (row) => (
      <div className='d-flex align-items-center flex-wrap gap-2'>
        {row.validCategories?.map((item) => (
          <span key={item} className='rounded-1 text-xs fw-normal py-1 px-2 bg-blue-100 text-deep-blue'>
            {item}
          </span>
        ))}
      </div>
    ),
  },
  {
    header: 'Dosage Types',
    renderCell: (row) => (
      <div className='d-flex align-items-center flex-wrap gap-2'>
        {row.dosageTypes?.map((item) => (
          <span key={item} className='rounded-1 text-xs fw-normal py-1 px-2 bg-blue-100 text-deep-blue text-capitalize'>
            {item}
          </span>
        ))}
      </div>
    ),
  },
];
