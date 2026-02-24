import { MobileCard } from '@/components/Dashboard/MobileCard';
import { Column, Table } from '@/components/Dashboard/Table';
import { useAdminOrdersPage } from '@/contexts/AdminOrdersPageContext';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useEffect } from 'react';

export default function Promos() {
  const orderType = useSelector((state: RootState) => state.sort.orderType);
  const { setSelectedPageFilters } = useAdminOrdersPage();

  useEffect(() => {
    if (orderType === 'Promos & Discounts') setSelectedPageFilters(null);
  }, [orderType]);
  return (
    <>
      <div className='d-md-none tw-h-[calc(100vh-10rem)]'>
        <MobileCard data={[]} columns={columns} />
      </div>
      <div className='table-responsive d-none d-md-block tw-h-[calc(100vh-12rem)]'>
        <Table data={[]} columns={columns} />
      </div>
    </>
  );
}

const columns: Column<unknown>[] = [
  { header: 'active' },
  { header: 'SITEWIDE' },
  {
    header: 'Promo code',
  },
  { header: 'Product' },
  { header: 'Start Date' },
  {
    header: 'End Date',
  },
  {
    header: 'End Date',
  },
  {
    header: 'ACTIONS',
  },
];
