'use client';

import { PropsWithChildren, useEffect } from 'react';
import { setUser, User } from '@/store/slices/userSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { setPharmacyType } from '@/store/slices/sortSlice';
import { useLazyGetPharmaciesListQuery } from '@/store/slices/pharmaciesApiSlice';

interface Props extends PropsWithChildren {
  adminProfile: User;
}

export function AdminWrapper({ children, adminProfile }: Readonly<Props>) {
  const dispatch = useDispatch<AppDispatch>();
  const [getPharmaciesList] = useLazyGetPharmaciesListQuery();

  useEffect(() => {
    dispatch(setUser({ ...adminProfile, role: 'admin' }));
  }, [adminProfile]);

  useEffect(() => {
    getPharmaciesList()
      .unwrap()
      .then((res) => {
        dispatch(setPharmacyType(res?.[0]?.id ?? ''));
      });
  }, []);

  return children;
}
