import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useLazyGetProductCategoriesQuery } from '@/store/slices/medicationsApiSlice';
import { MetaPayload } from '@/lib/types';
import { scrollToTop } from '@/lib/helper';
import { useEffect, useState } from 'react';
import { FilterGroup } from '@/components/Dashboard/Table/includes/FilterGroup';
import { ProductCategory, setProductCategoriesData } from '@/store/slices/productCategoriesSlice';
import { Column, Table } from '@/components/Dashboard/Table';
import { MobileCard } from '@/components/Dashboard/MobileCard';
import { Spinner } from 'react-bootstrap';
import { ProductPlanType } from './includes/ProductPlanType';
import { UpdateProductCategoryModal } from './includes/UpdateProductCategoryModal';
import { PlanType } from '@/types/medications';
import { ManageArchiveProductCategory } from './includes/ManageArchiveProductCategory';
import { ManageArchiveProductCategoryModal } from './includes/ManageArchiveProductCategoryModal';
import InfiniteScroll from 'react-infinite-scroll-component';

export default function ProductTypes() {
  const dispatch = useDispatch();

  const medicationType = useSelector((state: RootState) => state.medication.medicationType);
  const sortFilter = useSelector((state: RootState) => state.sort.sortFilter);
  const search = useSelector((state: RootState) => state.sort.search);
  const sortStatus = useSelector((state: RootState) => state.sort.sortStatus);
  const productCategories = useSelector((state: RootState) => state.productCategories);
  const { data: oldCategories = [], meta } = productCategories || {};
  const { totalPages = 1, page: currentPage = 1 } = meta || {};
  const allDataLoaded = currentPage >= totalPages;

  const [show, setShow] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>();
  const [showArchiveModal, setShowArchiveModal] = useState(false);

  const [getProductCategories, { isFetching }] = useLazyGetProductCategoriesQuery();

  async function handleProductCategories({ meta, search, append, sortStatus, sortFilter }: MetaPayload) {
    try {
      const { data } = await getProductCategories({
        meta: { page: meta?.page || 1, limit: 30 },
        search: search || undefined,
        type: sortStatus || undefined,
        status: sortFilter?.label.toLowerCase(),
      });

      const { productTypes: newData = [], meta: metaData } = data || {};

      if (append) {
        dispatch(setProductCategoriesData({ data: [...oldCategories, ...newData], meta: metaData }));
      } else {
        await scrollToTop('medicine_type_table_top');
        dispatch(setProductCategoriesData({ data: newData, meta: metaData }));
      }
    } catch (error) {
      console.log(error);
    }
  }

  const fetchMore = () => {
    if (currentPage < totalPages && !isFetching) {
      handleProductCategories({
        meta: { page: currentPage + 1, limit: 30 },
        search,
        append: true,
        sortStatus,
        sortFilter,
      });
    }
  };

  function handleRowClick(category: ProductCategory) {
    setSelectedCategory(category);
    setShow(true);
  }

  function handleArchiveClick(category: ProductCategory) {
    setSelectedCategory(category);
    setShowArchiveModal(true);
  }

  const columns: Column<ProductCategory>[] = [
    {
      header: 'Medicine Type',
      renderCell: (row) => <span className='text-capitalize text-nowrap'>{row.medicineType}</span>,
    },
    { header: 'Plan Type', renderCell: (row) => <ProductPlanType category={row} /> },
    { header: 'Category', renderCell: (row) => <span className='text-capitalize text-nowrap'>{row.category}</span> },
    {
      header: 'Dosage Type',
      renderCell: (row) => <span className='text-capitalize text-nowrap'>{row.dosageType}</span>,
    },
    { header: 'Summary', accessor: 'summaryText' },
    {
      header: 'Actions',
      renderCell: (row) => <ManageArchiveProductCategory category={row} handleArchive={handleArchiveClick} />,
    },
  ];

  useEffect(() => {
    if (medicationType === 'Product Types') handleProductCategories({ meta: { page: 1, limit: 30 } });
  }, [medicationType]);
  return (
    <>
      <div className='row align-items-center mt-4'>
        <span className='text-lg fw-medium d-none d-lg-block col-lg-4'>Product Types</span>
        <div className='col-lg-8'>
          <FilterGroup
            filters={[PlanType.ONE_TIME, PlanType.RECURRING]}
            handleChange={handleProductCategories}
            visibility={{
              showMultiSelect: false,
              showSort: false,
              showStatusFilter: true,
              showSearch: true,
              showArchiveFilter: true,
            }}
            sortFilters={['Archived', 'Active']}
            sortFilterPlaceholder='Select Archive Status'
          />
        </div>
      </div>
      <div className='d-md-none mt-4'>
        <InfiniteScroll
          dataLength={oldCategories.length}
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
            loading={isFetching && oldCategories.length === 0}
            data={oldCategories}
            columns={columns}
            rowOnClick={handleRowClick}
          />
        </InfiniteScroll>
      </div>
      <div className='table-responsive d-none d-md-block mt-4'>
        <InfiniteScroll
          dataLength={oldCategories.length}
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
            data={oldCategories}
            columns={columns}
            isFetching={isFetching && oldCategories.length === 0}
            rowOnClick={handleRowClick}
          />
        </InfiniteScroll>
      </div>

      <UpdateProductCategoryModal
        selectedCategory={selectedCategory}
        onSuccess={handleProductCategories}
        show={show}
        onHide={() => setShow(false)}
      />

      <ManageArchiveProductCategoryModal
        selectedCategory={selectedCategory}
        showArchiveModal={showArchiveModal}
        setShowArchiveModal={setShowArchiveModal}
        handleProductCategories={handleProductCategories}
        setSelectedCategory={setSelectedCategory}
      />
    </>
  );
}
