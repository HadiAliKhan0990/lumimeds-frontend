'use client';

import { IoIosSearch } from 'react-icons/io';
import { InputHTMLAttributes } from 'react';
import { Spinner } from 'react-bootstrap';

export interface SearchProps extends InputHTMLAttributes<HTMLInputElement> {
  inputClassName?: string;
  isLoading?: boolean;
}

export default function Search({ className, inputClassName, isLoading, ...props }: Readonly<SearchProps>) {
  return (
    <div className={'tw-relative ' + className}>
      <IoIosSearch className='tw-absolute tw-left-2.5 tw-top-2.5 tw-pointer-events-none' size={18} />
      <input className={`form-control !tw-pl-[34px] shadow-none ${inputClassName} tw-pl-8`} type='search' {...props} />
      {isLoading && (
        <Spinner
          size='sm'
          variant='primary'
          className='border-2 tw-absolute tw-right-8 tw-top-[11px] tw-pointer-events-none'
        />
      )}
    </div>
  );
}
