'use client';

import UpdatePasswordPage from '@/components/Dashboard/patient/account/includes/UpdatePassword';
import toast from 'react-hot-toast';
// NOTE: Shipping Address feature temporarily disabled - can be re-enabled if needed
// import PatientShippingAddressPage from '@/appointments/Dashboard/patient/account/includes/ShippingAdress';
import { AccountTab } from '@/components/Dashboard/patient/account/includes/AccountTab';
import { PaymentTab } from '@/components/Dashboard/patient/account/includes/PaymentTab';
import { ROUTES } from '@/constants';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Nav, Tab } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { RootState } from '@/store';
import { setPaymentMethodSuccess } from '@/store/slices/patientAccountSlice';
import { AccountTabsType } from '@/types/account';
import { GetPaymentMethodsResponseData } from '@/services/paymentMethod/types';
import { setPatientActiveSubscription, SubscriptionsData } from '@/store/slices/patientAtiveSubscriptionSlice';
import { removeSearchParamsByObject } from '@/lib/helper';
import { removeAuthCookiesClient } from '@/services/auth';

interface Props {
  tab?: AccountTabsType;
  paymentMethods?: GetPaymentMethodsResponseData;
  subscriptions?: SubscriptionsData;
}

export default function Account({ tab, paymentMethods, subscriptions }: Readonly<Props>) {
  const { push } = useRouter();
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('personal');

  const isPaymentMethodSuccess = useSelector((state: RootState) => state.patientAccount.isPaymentMethodSuccess);

  const logout = async () => {
    try {
      // Clear subscription upgrade modal dismissal keys
      Object.keys(localStorage)
        .filter((key) => key.startsWith('subscription_upgrade_modal_dismissed_'))
        .forEach((key) => localStorage.removeItem(key));

      const success = await removeAuthCookiesClient();
      if (!success) {
        toast.error('Failed to logout');
        return;
      }
      dispatch({ type: 'RESET' });
      push(ROUTES.PATIENT_LOGIN);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Navigation items configuration
  const navItems = [
    {
      eventKey: 'personal',
      label: 'Personal Information',
      element: <AccountTab setIsEditing={setIsEditing} isEditing={isEditing} />,
    },
    {
      eventKey: 'payment',
      label: 'Payment Method',
      element: <PaymentTab data={paymentMethods} />,
    },
    {
      eventKey: 'password',
      label: 'Password & Security',
      element: <UpdatePasswordPage />,
    },
    // NOTE: Shipping Address feature temporarily disabled - can be re-enabled by uncommenting the lines below
    // { eventKey: 'shipping-address', label: 'Shipping Address', className: 'border-0 text-base p-0 bg-transparent' ,element: <PatientShippingAddressPage />},
  ];

  useEffect(() => {
    if (isPaymentMethodSuccess) {
      setSelectedTab('payment');
      dispatch(setPaymentMethodSuccess(false));
    }
  }, [isPaymentMethodSuccess]);

  useEffect(() => {
    if (tab) {
      setSelectedTab(tab);
    }
  }, [tab]);

  useEffect(() => {
    if (subscriptions) {
      dispatch(setPatientActiveSubscription(subscriptions));
    }
  }, [subscriptions]);
  return (
    <Tab.Container
      onSelect={(eKey) => {
        setSelectedTab(eKey || 'personal');

        if (eKey) {
          removeSearchParamsByObject(['tab']);
        }
      }}
      defaultActiveKey={'personal'}
      activeKey={selectedTab}
    >
      <div className='page-title mb-5'>Account</div>
      <div className='row g-5 pb-5'>
        <div className='col-lg-4'>
          <div className='pt-lg-5 border-r-lg border-c-light h-100'>
            <Nav className='flex-column nav-tabs patient-nav-tabs border-0 gap-md-3'>
              {navItems.map((item) => (
                <Nav.Item key={item.eventKey}>
                  <Nav.Link as='button' className='btn-no-style' eventKey={item.eventKey}>
                    {item.label}
                  </Nav.Link>
                </Nav.Item>
              ))}
              <Nav.Item>
                <Nav.Link as='button' className='btn-no-style text-danger' onClick={logout}>
                  Logout
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </div>
        </div>
        <div className='col-lg-8'>
          <Tab.Content className='ps-lg-5 py-lg-3'>
            {navItems.map((item) => (
              <Tab.Pane key={item.eventKey} eventKey={item.eventKey}>
                {item.element}
              </Tab.Pane>
            ))}
          </Tab.Content>
        </div>
      </div>
    </Tab.Container>
  );
}
