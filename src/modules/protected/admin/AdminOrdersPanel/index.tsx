'use client';

import Orders from '@/modules/protected/admin/AdminOrdersPanel/orders';
import Subscriptions from '@/modules/protected/admin/AdminOrdersPanel/subscriptions';
import Invoices from '@/modules/protected/admin/AdminOrdersPanel/invoices';
import Refills from '@/modules/protected/admin/AdminOrdersPanel/refills';
import Promos from '@/modules/protected/admin/AdminOrdersPanel/promos';
import toast from 'react-hot-toast';
import { RootState } from '@/store';
import {
  setOrderType,
  setSortField,
  setSortOrder,
  setSortStatus,
  setStatusArray,
  setSearch,
  setSearchString,
  resetSortSlice,
  setProductType,
} from '@/store/slices/sortSlice';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Dropdown } from 'react-bootstrap';
import { Tabs, TabPanel } from '@/components/elements';
import { MobileHeader } from '@/components/Dashboard/MobileHeader';
import { usePathname, useRouter } from 'next/navigation';
import { removeSearchParamsObject } from '@/lib/helper';
import { useEffect, useState } from 'react';
import { AdminOrdersPageProvider, useAdminOrdersPage } from '@/contexts/AdminOrdersPageContext';
import { ShadowScroll } from '@/components/LayoutGestures/ShadowScroll';
import { DividerButton } from '@/components/Buttons/DividerButton';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';
import { FiPlus } from 'react-icons/fi';
import { SelectPatientModal } from '@/modules/protected/admin/AdminOrdersPanel/refills/includes/SelectPatientModal';
import { SelectOrderModal } from '@/components/Dashboard/orders/SelectOrderModal';
import { RefillSurveyFormSidebar } from '@/components/Dashboard/orders/RefillSurveyFormSidebar';
import { User } from '@/store/slices/userSlice';
import { Order } from '@/store/slices/orderSlice';
import { RefillSurveyRequest, useLazyCheckExistingRefillQuery } from '@/store/slices/refillsApiSlice';
import { Renewals } from './orders/Renewals';
import { useMounted } from '@/hooks/usemounted';
import { AdminOrdersPanelSkeleton } from './AdminOrdersPanelSkeleton';
import { isAxiosError } from 'axios';
import { Error } from '@/lib/types';

interface Props {
  tab?: string;
  q?: string;
}

export default function AdminOrdersPanel({ tab, q }: Readonly<Props>) {
  const { replace } = useRouter();
  const dispatch = useDispatch();
  const pathname = usePathname();
  const { mounted } = useMounted();

  const orderType = useSelector((state: RootState) => state.sort.orderType);

  const [modalState, setModalState] = useState<{
    type: 'selectPatient' | 'selectOrder' | 'refillForm' | null;
    selectedPatient: User | null;
    selectedOrder: Order | null;
    newRefill: RefillSurveyRequest | null;
  }>({
    type: null,
    selectedPatient: null,
    selectedOrder: null,
    newRefill: null,
  });

  const [checkExistingRefill] = useLazyCheckExistingRefillQuery();

  // Lazy render function - only instantiates the active tab component
  const renderActiveTab = () => {
    switch (orderType) {
      case 'Orders':
        return <Orders query={q} />;
      case 'Renewals':
        return <Renewals query={q} />;
      case 'Refills':
        return (
          <Refills
            query={q}
            newRefill={modalState.newRefill}
            onRefillAdded={() => setModalState((prev) => ({ ...prev, newRefill: null }))}
          />
        );
      case 'Subscriptions':
        return <Subscriptions />;
      case 'Invoices':
        return <Invoices />;
      case 'Promos & Discounts':
        return <Promos />;
      default:
        return <Orders query={q} />;
    }
  };

  // Handlers for Create Refill Request
  const handleCreateRefillRequest = () => {
    setModalState((prev) => ({ ...prev, type: 'selectPatient' }));
  };

  const handlePatientSelect = (patient: User) => {
    setModalState((prev) => ({ ...prev, selectedPatient: patient, type: 'selectOrder' }));
  };

  const handleOrderSelect = async (order: Order) => {
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

      setModalState((prev) => ({ ...prev, selectedOrder: order, type: 'refillForm' }));
    } catch (error) {
      toast.error(
        isAxiosError(error)
          ? error.response?.data?.message || 'Unable to verify refill status!'
          : (error as Error)?.data?.message || 'Unable to verify refill status!'
      );
    }
  };

  const handleRefillFormClose = (refill?: RefillSurveyRequest | null) => {
    setModalState({
      type: null,
      selectedPatient: null,
      selectedOrder: null,
      newRefill: refill || null,
    });
  };

  useEffect(() => {
    if (tab) {
      if (tab !== orderType) {
        dispatch(setProductType(null));
        dispatch(setOrderType(tab));
      }
    } else if (!tab && !orderType) {
      dispatch(setProductType(null));
      dispatch(setOrderType('Orders'));
    }
  }, [tab]);

  useEffect(() => {
    return () => {
      dispatch(resetSortSlice());
    };
  }, []);

  if (!mounted) {
    return <AdminOrdersPanelSkeleton />;
  }

  const handleTabChange = (eKey: string | number) => {
    const tabKey = String(eKey);
    if (q) {
      removeSearchParamsObject(pathname, { q });
    }
    dispatch(setStatusArray(undefined));
    dispatch(setSortOrder(undefined));
    dispatch(setSortStatus(undefined));
    dispatch(setSortField(undefined));
    dispatch(setSearch(''));
    dispatch(setSearchString(''));
    dispatch(setProductType(null));
    dispatch(setOrderType(tabKey));

    if (tabKey) {
      replace(`/admin/orders?tab=${encodeURIComponent(tabKey)}`);
    }
  };

  const tabsData = tabs.map((tab) => ({
    label: tab.title,
    value: tab.title,
  }));

  return (
    <AdminOrdersPageProvider>
      <div>
        <div className='tw-flex tw-items-center tw-justify-between tw-gap-4'>
          <MobileHeader
            title='Orders & Subscriptions'
            className='tw-flex-grow'
            actions={
              <Dropdown.Item
                as='button'
                onClick={handleCreateRefillRequest}
                className='d-flex align-items-center gap-2'
              >
                <FiPlus className='tw-w-4 tw-h-4' />
                Create Refill Request
              </Dropdown.Item>
            }
          />
          {orderType === 'Refills' && (
            <button
              onClick={handleCreateRefillRequest}
              className='btn btn-outline-primary d-none d-lg-flex align-items-center justify-content-center gap-2'
            >
              <FiPlus className='tw-w-4 tw-h-4' />
              Create Refill Request
            </button>
          )}
        </div>
        <Card body className='position-relative rounded-12 border-light zero-styles-mobile tw-mt-5'>
          <div className='tw-grid tw-grid-cols-12 tw-gap-2 tw-items-start'>
            <ShadowScroll>
              {({ containerProps, nextButtonProps, backButtonProps, hasOverflow }) => (
                <div className='tw-col-span-12 xl:tw-col-span-5 tw-flex tw-items-center tw-justify-between tw-gap-2'>
                  {hasOverflow && (
                    <DividerButton
                      icon={<BsChevronLeft className='tw-bg-transparent' />}
                      onClick={backButtonProps.onClick}
                      className={`${backButtonProps.className} tw-bg-primary tw-rounded-full tw-text-white tw-p-1 bouncing-effect`}
                      shadowDirection='right'
                    />
                  )}
                  <div {...containerProps} className={`${containerProps?.className}`}>
                    <Tabs tabs={tabsData} activeTab={orderType || 'Orders'} onTabChange={handleTabChange} />
                  </div>

                  {hasOverflow && (
                    <DividerButton
                      icon={<BsChevronRight className='tw-bg-transparent' />}
                      onClick={nextButtonProps.onClick}
                      className={`${nextButtonProps.className} tw-bg-primary tw-rounded-full tw-text-white tw-p-1 bouncing-effect`}
                      shadowDirection='left'
                    />
                  )}
                </div>
              )}
            </ShadowScroll>

            <div className='tw-col-span-12 xl:tw-col-span-7'>
              <RenderFilters />
            </div>
          </div>

          <div className='tw-mt-4'>
            {tabs.map((tab) => (
              <TabPanel key={tab.title} value={orderType || 'Orders'} index={tab.title}>
                {renderActiveTab()}
              </TabPanel>
            ))}
          </div>
        </Card>

        {/* Modals for Creating Refill Requests */}
        <SelectPatientModal
          isOpen={modalState.type === 'selectPatient'}
          onClose={() => setModalState((prev) => ({ ...prev, type: null }))}
          onSelectPatient={handlePatientSelect}
        />

        <SelectOrderModal
          isOpen={modalState.type === 'selectOrder'}
          onClose={() => setModalState((prev) => ({ ...prev, type: null }))}
          onSelectOrder={handleOrderSelect}
          userId={modalState.selectedPatient?.id || undefined}
          selectedPatient={modalState.selectedPatient}
          closeOnSelect={false}
          isRefillReq={true}
        />

        <RefillSurveyFormSidebar
          isOpen={modalState.type === 'refillForm'}
          onClose={handleRefillFormClose}
          selectedOrder={modalState.selectedOrder}
          patientId={modalState.selectedPatient?.patientId ?? undefined}
          selectedPatient={modalState.selectedPatient}
        />
      </div>
    </AdminOrdersPageProvider>
  );
}

const RenderFilters = () => {
  const { selectedPageFilters } = useAdminOrdersPage();

  return selectedPageFilters;
};

const tabs = [
  { title: 'Orders' },
  { title: 'Renewals' },
  { title: 'Refills' },
  { title: 'Subscriptions' },
  { title: 'Invoices' },
  { title: 'Promos & Discounts' },
] as const;
