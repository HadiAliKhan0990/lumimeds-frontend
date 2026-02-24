'use client';

import { setPopup } from '@/store/slices/popupSlice';
import { unselectAll } from '@/store/slices/selectedRowsSlice';
import { setOrderType } from '@/store/slices/sortSlice';
import { usePathname } from 'next/navigation';
import { PropsWithChildren, useEffect } from 'react';
import { useDispatch } from 'react-redux';

export default function DashboardWrapper({ children }: Readonly<PropsWithChildren>) {
  const pathname = usePathname();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(unselectAll());
    dispatch(setPopup(false));
    dispatch(setOrderType('Orders'));
  }, [pathname]);

  return children;
}
