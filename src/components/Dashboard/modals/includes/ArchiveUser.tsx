'use client';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useMemo } from 'react';
import { setModal } from '@/store/slices/modalSlice';
import { unselectAll } from '@/store/slices/selectedRowsSlice';

export function ArchiveUser() {
  const dispatch = useDispatch();
  const patients = useSelector((state: RootState) => state.patients);
  const selectedRows = useSelector((state: RootState) => state.selectedRows);

  const singleUser = useMemo(() => {
    if (selectedRows.length === 1) {
      return patients.find((patient) => patient.id === selectedRows[0]);
    }
    return null;
  }, [selectedRows, patients]);

  const handleClose = () => {
    dispatch(setModal({ modalType: undefined }));
    dispatch(unselectAll());
  };

  return (
    <div>
      <p className={'text-2xl text-black text-center fw-medium mb-4 pb-2 mt-2'}>
        Archive{' '}
        {singleUser ? (
          <span className="text-capitalize">{`“${singleUser.firstName} ${singleUser.lastName}”`}</span>
        ) : (
          `${selectedRows.length} Patients`
        )}
        ?
      </p>
      <div className={'d-flex align-items-center gap-3'}>
        <button
          onClick={handleClose}
          type={'button'}
          className={'btn btn-outline-primary flex-grow-1'}
        >
          No
        </button>
        <button
          onClick={handleClose}
          type={'button'}
          className={'btn btn-primary flex-grow-1'}
        >
          Yes
        </button>
      </div>
    </div>
  );
}
