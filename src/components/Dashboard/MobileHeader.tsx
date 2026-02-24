'use client';

import { setSidebarOpen } from '@/store/slices/generalSlice';
import { ReactNode } from 'react';
import { Dropdown } from 'react-bootstrap';
import { FiMenu } from 'react-icons/fi';
import { MdMoreVert } from 'react-icons/md';
import { useDispatch } from 'react-redux';

interface Props {
  title: string;
  actions?: ReactNode;
  className?: string;
  showMenuButton?: boolean;
  classNameTitle?: string;
}

export const MobileHeader = ({
  title,
  actions,
  className,
  showMenuButton = true,
  classNameTitle = '',
}: Readonly<Props>) => {
  const dispatch = useDispatch();
  return (
    <div className={'tw-flex tw-items-center tw-justify-between tw-flex-wrap tw-gap-2 ' + className}>
      {showMenuButton && (
        <FiMenu size={24} className='cursor-pointer d-lg-none' onClick={() => dispatch(setSidebarOpen(true))} />
      )}
      <span className={`text-2xl fw-semibold tw-flex-grow ${classNameTitle}`}>{title}</span>
      {actions && (
        <Dropdown className='forms-options-dropdown d-lg-none'>
          <Dropdown.Toggle
            variant='light'
            className='p-0 d-flex align-items-center justify-content-center border border-secondary'
          >
            <MdMoreVert size={24} />
          </Dropdown.Toggle>
          <Dropdown.Menu className='border-light overflow-auto shadow'>{actions}</Dropdown.Menu>
        </Dropdown>
      )}
    </div>
  );
};
