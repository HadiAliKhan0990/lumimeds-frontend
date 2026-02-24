'use client';

import { setSearch, setSortField, setSortOrder } from '@/store/slices/sortSlice';
import Link from 'next/link';
import React from 'react';
import { useDispatch } from 'react-redux';

interface Props {
  children: React.ReactNode;
  route: string;
  style?: React.CSSProperties;
  className?: string;
}

export default function SidebarButton({ children, style, route, className }: Props) {
  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(setSearch(undefined));
    dispatch(setSortField(undefined));
    dispatch(setSortOrder(undefined));
  };
  return (
    <Link style={style} className={`text-decoration-none d-flex justify-content-center items-center gap-4 sidebar-button ${className}`} href={route} onClick={handleClick}>
      {children}
    </Link>
  );
}
