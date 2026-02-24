'use client';
import { FiSearch } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { setSearch, selectSearch } from '../../../../../store/slices/licensedStatesSlice';
import type { AppDispatch } from '@/store';


export const LicensedStatesHeader = () => {
  const dispatch = useDispatch<AppDispatch>();
  const search = useSelector(selectSearch);

  return (



    <div className='tw-w-full' >
      <div className='d-flex border rounded overflow-hidden bg-white py-2'>
        <span className='d-flex align-items-center ps-3 text-muted'>
          <FiSearch />
        </span>
        <input
          type='text'
          className='form-control border-0 ps-1 text-sm tw-w-full'
          placeholder='Search by state name'
          value={search}
          onChange={(e) => dispatch(setSearch(e.target.value))}
        />
      </div>
    </div>

  );
}
