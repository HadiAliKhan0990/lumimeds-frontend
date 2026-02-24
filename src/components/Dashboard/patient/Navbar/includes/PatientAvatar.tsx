'use client';

import Link from 'next/link';
import toast from 'react-hot-toast';
import { Dropdown } from 'react-bootstrap';
import { CustomToggle } from '@/components/Dashboard/CustomToggle';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { ROUTES } from '@/constants';
import { MdLogout, MdOutlineManageAccounts, MdOutlinePayment } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import { removeAuthCookiesClient } from '@/services/auth';
import { persistor } from '@/store';

interface Props {
  className?: string;
}

export const PatientAvatar = ({ className }: Readonly<Props>) => {
  const dispatch = useDispatch();
  const { push } = useRouter();

  const profile = useSelector((state: RootState) => state.patientProfile);

  const logout = async () => {
    try {
      await persistor.purge();
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

  return (
    <Dropdown className={className}>
      <Dropdown.Toggle as={CustomToggle}>
        <span
          className={
            'user-avatar d-flex text-uppercase rounded-circle fw-bold align-items-center justify-content-center user-select-none'
          }
        >
          {profile?.firstName || profile?.lastName ? `${profile?.firstName?.[0]}${profile?.lastName?.[0]}` : 'U'}
        </span>
      </Dropdown.Toggle>
      <Dropdown.Menu className='border-light overflow-auto shadow'>
        <Dropdown.Item
          as={Link}
          href={`${ROUTES.PATIENT_ACCOUNT}?tab=personal`}
          className='d-flex align-items-center gap-2 py-2 text-base'
        >
          <MdOutlineManageAccounts />
          My Account
        </Dropdown.Item>
        <Dropdown.Item
          as={Link}
          href={`${ROUTES.PATIENT_ACCOUNT}?tab=payment`}
          className='d-flex align-items-center gap-2 py-2 text-base'
        >
          <MdOutlinePayment />
          Payment Methods
        </Dropdown.Item>
        <Dropdown.Item onClick={logout} as='button' className='d-flex align-items-center gap-2 py-2 text-base'>
          <MdLogout />
          Logout
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};
