'use client';

import ProductIntake from './productIntake';
import ProductRefill from './productRefill';
import GeneralForms from './general';
import ProviderIntake from './providerIntake';
import { setOrderType, setSortOrder, setSearch, setSearchString } from '@/store/slices/sortSlice';
import { useDispatch } from 'react-redux';
import { Card, Nav, Tab } from 'react-bootstrap';
import { MobileHeader } from '@/components/Dashboard/MobileHeader';
import { useState } from 'react';
import { FormSubmissionsType } from '@/store/slices/surveysApiSlice';

export default function SubmissionsPanel() {
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState<FormSubmissionsType>('PRODUCT_INTAKE');

  return (
    <Tab.Container
      onSelect={(eKey) => {
        dispatch(setSortOrder(undefined));
        dispatch(setSearch(''));
        dispatch(setSearchString(''));
        dispatch(setOrderType(eKey));
        setActiveTab(eKey as FormSubmissionsType);
      }}
      activeKey={activeTab}
    >
      <MobileHeader title='Forms Submissions' />
      <Card body className='rounded-12 border-light zero-styles-mobile mt-4'>
        <Nav className='underlined_tabs flex-nowrap overflow-auto pb-1 text-nowrap nav-tabs border-0 gap-0'>
          {tabs.map((item) => (
            <Nav.Item key={item.title}>
              <Nav.Link as={'button'} eventKey={item.eventKey}>
                {item.title}
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>
        <Tab.Content className='mt-4'>
          {tabs.map((item) => (
            <Tab.Pane key={`${item.title}-${activeTab}`} eventKey={item.eventKey}>
              {item.eventKey === activeTab && <item.component type={activeTab} />}
            </Tab.Pane>
          ))}
        </Tab.Content>
      </Card>
    </Tab.Container>
  );
}

const tabs = [
  {
    title: 'Product Intake',
    component: ProductIntake,
    eventKey: 'PRODUCT_INTAKE',
  },
  {
    title: 'Product Refill',
    component: ProductRefill,
    eventKey: 'PRODUCT_REFILL',
  },
  {
    title: 'Provider Intake',
    component: ProviderIntake,
    eventKey: 'PROVIDER_INTAKE',
  },
  {
    title: 'General',
    component: GeneralForms,
    eventKey: 'GENERAL',
  },
];
