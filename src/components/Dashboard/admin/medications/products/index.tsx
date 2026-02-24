'use client';

import InfiniteScroll from 'react-infinite-scroll-component';
import { FilterGroup } from '@/components/Dashboard/Table/includes/FilterGroup';
import { MobileCard } from '@/components/Dashboard/MobileCard';
import { Column, Table } from '@/components/Dashboard/Table';
import { MetaPayload } from '@/lib/types';
import { RootState } from '@/store';
import { useLazyGetMedicationsProductsListQuery } from '@/store/slices/medicationsApiSlice';
import { Product } from '@/store/slices/medicationsProductsSlice';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { PriceModal } from '@/components/Dashboard/admin/medications/products/includes/PriceModal';
import { capitalizeFirst, formatToUSD, scrollToTop } from '@/lib/helper';
import { Spinner } from 'react-bootstrap';
import { ProductImage } from '@/components/ProductImage';
import { UpdateMedicationProductModal } from '@/components/Dashboard/admin/medications/products/includes/UpdateMedicationProductModal';
import { KlarnaEnabled } from '@/components/Dashboard/admin/medications/products/includes/KlarnaEnabled';
import { ProductActions } from '@/components/Dashboard/admin/medications/products/includes/ProductActions';
import { ProductPharmacyPriorityModal } from '@/components/Dashboard/admin/medications/products/includes/ProductPharmacyPriorityModal';
import { formatUSDateTime } from '@/helpers/dateFormatter';

export default function Products() {
  const medicationType = useSelector((state: RootState) => state.medication.medicationType);
  const search = useSelector((state: RootState) => state.sort.search);
  const sortField = useSelector((state: RootState) => state.sort.sortField);
  const sortOrder = useSelector((state: RootState) => state.sort.sortOrder);
  const sortStatus = useSelector((state: RootState) => state.sort.sortStatus);
  const medicationsProducts = useSelector((state: RootState) => state.medicationsProducts.products);
  const { data = [], meta } = medicationsProducts || {};
  const { totalPages = 1, page: currentPage = 1 } = meta || {};

  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product>();
  const [showUpdateProductModal, setShowUpdateProductModal] = useState(false);
  const [showPharmacyPriorityModal, setShowPharmacyPriorityModal] = useState(false);

  const [triggerMedicationsProductsList, { isFetching }] = useLazyGetMedicationsProductsListQuery();

  function handleRowClick(product: Product) {
    setSelectedProduct(product);
    setShowUpdateProductModal(true);
  }

  async function handleUpdateMedicationsProductsList({
    meta,
    search,
    sortField,
    sortOrder,
    sortStatus,
    append = false,
  }: MetaPayload) {
    try {
      await triggerMedicationsProductsList({
        search,
        sortField,
        sortOrder,
        meta: {
          page: meta?.page || 1,
          limit: 30,
        },
        ...(sortStatus && { sortStatus }),
      });

      if (!append) {
        await scrollToTop('products-table-top');
      }
    } catch (error) {
      console.log(error);
    }
  }

  const fetchMore = () => {
    if (currentPage < totalPages && !isFetching) {
      handleUpdateMedicationsProductsList({
        meta: { page: currentPage + 1, limit: 30 },
        search,
        sortField,
        sortOrder,
        sortStatus,
        append: true,
      });
    }
  };

  const allProductsLoaded = currentPage >= totalPages;

  const columns: Column<Product>[] = [
    {
      header: 'PRODUCT IMAGE',
      renderCell: (row) => <ProductImage centered={false} className='product_image' image={row?.image || ''} />,
    },
    { header: 'Product Type', accessor: 'name', className: 'text-nowrap' },
    {
      header: 'CREATED AT',
      renderCell: (row) => formatUSDateTime(row.createdAt),
    },
    {
      header: 'duration',
      renderCell: (row) =>
        `${row.metadata.intervalCount} ${capitalizeFirst(row.metadata.billingInterval)}${
          row.metadata.intervalCount > 1 ? 's' : ''
        }`,
    },
    {
      header: 'STATUS',
      renderCell: (row) => (
        <span className={'status-badge ' + (row.isActive ? 'active' : 'inactive')}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    { header: 'OPENPAY', accessor: 'openpay', className: 'text-capitalize' },
    {
      header: 'KLARNA ENABLED',
      renderCell: (row) => (
        <KlarnaEnabled
          product={row}
          onRefetch={() => handleUpdateMedicationsProductsList({ meta, search, sortField, sortOrder, sortStatus })}
          isFetching={isFetching}
        />
      ),
    },
    // { header: 'TELEGRA', accessor: 'telegra', className: 'text-capitalize' },
    // { header: 'TELEPATH', accessor: 'telepath', className: 'text-capitalize' },
    { header: 'price', renderCell: (row) => formatToUSD((row.price.amount ?? 0) * 100), className: 'text-nowrap' },
    {
      header: 'Actions',
      renderCell: (row) => (
        <ProductActions
          product={row}
          onClickUpdatePriceAction={() => {
            setSelectedProduct(row);
            setOpen(true);
          }}
          onClickPharmacyPriorityAction={() => {
            setSelectedProduct(row);
            setShowPharmacyPriorityModal(true);
          }}
        />
      ),
    },
  ];

  useEffect(() => {
    if (medicationType === 'Products') {
      handleUpdateMedicationsProductsList({ meta: { page: 1, limit: 30 } as MetaPayload['meta'] });
    }
  }, [medicationType]);

  return (
    <>
      <div className='row align-items-center mt-4'>
        <span className='text-lg fw-medium d-none d-lg-block col-lg-4 col-xl-6'>Products</span>
        <div className='col-lg-8 col-xl-6'>
          <FilterGroup handleChange={handleUpdateMedicationsProductsList} />
        </div>
      </div>
      <div className='d-md-none mt-4'>
        <InfiniteScroll
          dataLength={data?.length || 0}
          next={fetchMore}
          hasMore={!allProductsLoaded}
          loader={
            <div className='d-flex justify-content-center py-4'>
              <Spinner size='sm' />
            </div>
          }
          height={`calc(100vh - 400px)`}
        >
          <MobileCard
            loading={isFetching && data?.length === 0}
            data={data || []}
            columns={columns}
            rowOnClick={handleRowClick}
          />
        </InfiniteScroll>
      </div>
      <div className='table-responsive d-none d-md-block mt-4'>
        <InfiniteScroll
          dataLength={data?.length || 0}
          next={fetchMore}
          hasMore={!allProductsLoaded}
          loader={
            <div className='d-flex justify-content-center py-4'>
              <Spinner size='sm' />
            </div>
          }
          height={`calc(100vh - 280px)`}
        >
          <div id='products-table-top' />
          <Table
            data={data || []}
            columns={columns}
            isFetching={isFetching && data?.length === 0}
            rowOnClick={handleRowClick}
          />
        </InfiniteScroll>
      </div>

      {/* Modals */}

      <PriceModal
        selectedProduct={selectedProduct}
        show={open}
        onHide={() => {
          setOpen(false);
          setSelectedProduct(undefined);
        }}
        onRefetch={async () => await scrollToTop('products-table-top')}
      />

      <UpdateMedicationProductModal
        selectedProduct={selectedProduct}
        show={showUpdateProductModal}
        onHide={() => {
          setShowUpdateProductModal(false);
          setSelectedProduct(undefined);
        }}
      />

      <ProductPharmacyPriorityModal
        show={showPharmacyPriorityModal}
        onHide={() => {
          setShowPharmacyPriorityModal(false);
          setSelectedProduct(undefined);
        }}
        productId={selectedProduct?.id || ''}
        productName={selectedProduct?.name || ''}
      />
    </>
  );
}
