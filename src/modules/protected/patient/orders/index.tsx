'use client';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useEffect, useMemo, useState } from 'react';
import { setOrderType, setSortStatus, setSortField, OrderType } from '@/store/slices/sortSlice';
import { Tab, Nav } from 'react-bootstrap';
import Orders from '@/modules/protected/patient/orders/includes/Orders';
import Invoices from '@/modules/protected/patient/orders/includes/Invoices';
import Refills from '@/modules/protected/patient/orders/includes/Refills';
import './includes/styles.css';

interface Props {
  tabParam: string;
}

export default function OrdersPageContent({ tabParam }: Readonly<Props>) {
  const dispatch = useDispatch();

  const { data = [] } = useSelector((state: RootState) => state.patientOrders);

  const [activeKey, setActiveKey] = useState<OrderType>('Orders');

  const tabs = [
    {
      title: 'Orders',
      component: <Orders activeKey={activeKey} />,
      eventKey: 'Orders',
    },
    {
      title: 'Refills',
      component: <Refills activeKey={activeKey} />,
      eventKey: 'Refills',
    },
    {
      title: 'Invoices',
      component: <Invoices activeKey={activeKey} />,
      eventKey: 'Invoices',
    },
  ];

  const ordersLength = useMemo(() => data.filter((order) => order.status === 'Completed').length || 0, [data]);

  useEffect(() => {
    if (tabParam) {
      const normalizedTab = tabParam.charAt(0).toUpperCase() + tabParam.slice(1).toLowerCase();
      if (normalizedTab === 'Orders' || normalizedTab === 'Refills' || normalizedTab === 'Invoices') {
        setActiveKey(normalizedTab as OrderType);
        dispatch(setOrderType(normalizedTab as OrderType));
      }
    }
  }, [tabParam, dispatch]);

  return (
    <>
      <h1 className='tw-text-2xl md:tw-text-[40px] tw-font-normal tw-mb-6'>Orders & Invoices</h1>
      <p className='tw-mb-10 tw-font-medium tw-max-w-screen-md'>
        This section provides a comprehensive record of your prescriptions, order fulfillment dates, order status, and
        payment history. You can view and download your invoices for your records.
      </p>
      <Tab.Container
        onSelect={(k) => {
          if (k) {
            setActiveKey(k as OrderType);
            dispatch(setOrderType(k));
            dispatch(setSortStatus(undefined));
            dispatch(setSortField(undefined));
          }
        }}
        activeKey={activeKey}
      >
        <Nav variant='tabs' className='mb-5 surveys-tabs border-0 gap-0'>
          {tabs.map((item) => (
            <Nav.Item key={item.title}>
              <Nav.Link
                as={'button'}
                eventKey={item.eventKey}
                className='fw-semibold d-flex align-items-center bg-transparent justify-content-center gap-3 fs-6'
              >
                {item.title}{' '}
                {item.eventKey === 'Orders' && ordersLength > 0 && (
                  <span className='badge rounded-circle fw-bold text-bg-danger'>{ordersLength}</span>
                )}
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>
        <Tab.Content>
          {tabs.map((item) => (
            <Tab.Pane key={item.title} eventKey={item.eventKey}>
              {item.component}
            </Tab.Pane>
          ))}
        </Tab.Content>
      </Tab.Container>
    </>
  );
}
