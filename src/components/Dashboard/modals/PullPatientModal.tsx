'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Modal } from '@/components/elements';
import InfiniteScroll from 'react-infinite-scroll-component';
import Spinner from '@/components/Spinner';
import { useLazyGetExistingPatientsQuery } from '@/store/slices/usersApiSlice';
import { debounce } from 'lodash';
import { PatientSideBar } from '@/components/Dashboard/PatientSideBar';
import { OrderDetailsModal } from '@/components/Common/OrderDetailsModal';
import { OrderPopup } from '@/modules/protected/admin/AdminOrdersPanel/orders/includes/OrderPopup';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setPatient } from '@/store/slices/patientSlice';
import { setOrder } from '@/store/slices/orderSlice';
import { formatUSDate } from '@/helpers/dateFormatter';

interface Patient {
  id: string;
  patientId: string;
  firstName: string;
  lastName: string;
  email: string;
  dob?: string;
}

interface PullPatientModalProps {
  show: boolean;
  onHide: () => void;
  onPullPatient: (patientId: string, patientName: string) => void;
  isPulling?: boolean;
  preserveState?: boolean;
}

export const PullPatientModal: React.FC<PullPatientModalProps> = ({
  show,
  onHide,
  onPullPatient,
  isPulling = false,
  preserveState = false,
}) => {
  const dispatch = useDispatch();
  const inputRef = useRef<HTMLInputElement>(null);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [orderModalType, setOrderModalType] = useState<'orderDetails' | 'orderPopup' | null>(null);

  const order = useSelector((state: RootState) => state.order);

  const [getExistingPatients, { isFetching }] = useLazyGetExistingPatientsQuery();

  const fetchPatients = useCallback(
    async (pageNumber: number, reset: boolean = false, searchTerm: string = '') => {
      try {
        const result = await getExistingPatients({
          search: searchTerm || undefined,
          page: pageNumber,
          limit: 30,
        }).unwrap();

        const newPatients = result.patient || [];
        const totalPages = result.totalPages || 1;

        if (reset) {
          setPatients(newPatients);
        } else {
          setPatients((prev) => [...prev, ...newPatients]);
        }

        setHasMore(pageNumber < totalPages);
      } catch (error) {
        console.error('Error fetching patients:', error);
        setHasMore(false);
      }
    },
    [getExistingPatients]
  );

  const debouncedSearch = useCallback(
    debounce((searchTerm: string) => {
      setPage(1);
      setHasMore(true);
      fetchPatients(1, true, searchTerm);
    }, 500),
    [fetchPatients]
  );

  useEffect(() => {
    if (show && !preserveState) {
      setPatients([]);
      setPage(1);
      setHasMore(true);
      setInputValue('');
    }

    if (show) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [show, preserveState]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const fetchMoreData = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPatients(nextPage, false, inputValue.trim());
  };

  const handlePull = (patient: Patient) => {
    const patientName = `${patient.firstName} ${patient.lastName}`;
    onPullPatient(patient.patientId, patientName);
  };

  const handleClose = () => {
    setPatients([]);
    setPage(1);
    setHasMore(true);
    setInputValue('');
    onHide();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSearch(value.trim());
  };

  const handleViewPatient = (patient: Patient) => {
    const patientData = {
      id: patient.patientId,
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email,
      dob: patient.dob,
    };

    dispatch(setPatient(patientData));

    dispatch(
      setOrder({
        id: '',
        patient: patientData,
      })
    );

    setShowPatientDetails(true);
  };

  const footer = (
    <button
      type='button'
      onClick={handleClose}
      className='tw-w-full tw-px-4 sm:tw-px-6 tw-py-2 sm:tw-py-3 tw-text-sm sm:tw-text-base tw-text-gray-700 tw-bg-white tw-border tw-border-gray-300 tw-rounded-lg hover:tw-bg-gray-50 tw-transition-colors'
      disabled={isPulling}
    >
      Cancel
    </button>
  );

  return (
    <>
      <Modal
        isOpen={show}
        onClose={handleClose}
        title='Select Patient to Pull Orders'
        size='md'
        footer={footer}
        bodyClassName='!tw-p-0'
        closeOnBackdropClick={false}
      >
        {/* Search Input */}
        <div className='tw-px-3 sm:tw-px-4 tw-py-0.5'>
          <input
            ref={inputRef}
            type='text'
            placeholder='Search patients by name or email...'
            value={inputValue}
            onChange={handleInputChange}
            disabled={isPulling}
            autoFocus
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className='tw-w-full tw-px-2 sm:tw-px-3 tw-py-2 tw-text-sm sm:tw-text-base tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-1 focus:tw-ring-blue-500 focus:tw-border-transparent'
          />
        </div>

        <div className='tw-relative tw-h-[300px] sm:tw-h-[400px] md:tw-h-[438px]'>
          {isFetching && patients.length === 0 ? (
            <div className='tw-flex tw-flex-col tw-items-center tw-justify-center tw-h-full'>
              <Spinner />
              <p className='tw-mt-3 tw-text-sm tw-text-gray-600'>Loading patients...</p>
            </div>
          ) : !inputValue && patients.length === 0 ? (
            <div className='tw-p-4 tw-h-full tw-flex tw-items-center tw-justify-center'>
              <SearchPrompt />
            </div>
          ) : patients.length === 0 ? (
            <div className='tw-p-4 tw-h-full tw-flex tw-items-center tw-justify-center'>
              <EmptyState />
            </div>
          ) : (
            <InfiniteScroll
              dataLength={patients.length}
              next={fetchMoreData}
              hasMore={hasMore}
              loader={
                <div className='tw-flex tw-justify-center tw-py-3'>
                  <Spinner />
                </div>
              }
              className='tw-px-3 sm:tw-px-4 tw-space-y-2 sm:tw-space-y-3 tw-mt-4'
              height='100%'
            >
              {patients.map((patient) => (
                <PatientCard
                  key={patient.id}
                  patient={patient}
                  onPull={() => handlePull(patient)}
                  onView={() => handleViewPatient(patient)}
                  isPulling={isPulling}
                />
              ))}
            </InfiniteScroll>
          )}
        </div>
      </Modal>

      <PatientSideBar
        show={showPatientDetails}
        onHide={() => setShowPatientDetails(false)}
        showAcceptRejectRXForm={false}
        disableActionButtons={true}
        onOrderClick={() => setOrderModalType('orderDetails')}
      />
      <OrderDetailsModal
        isOpen={orderModalType === 'orderDetails'}
        onClose={() => setOrderModalType(null)}
        onOpenOrderSidebar={(order) => {
          dispatch(setOrder(order));
          setOrderModalType('orderPopup');
        }}
      />
      <OrderPopup
        show={orderModalType === 'orderPopup'}
        onHide={() => setOrderModalType(null)}
        orderUniqueId={order?.orderUniqueId ?? null}
      />
    </>
  );
};

const PatientCard = ({
  patient,
  onPull,
  onView,
  isPulling,
}: {
  patient: Patient;
  onPull: () => void;
  onView: () => void;
  isPulling: boolean;
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onPull();
    }
  };

  return (
    <div className='tw-w-full tw-p-2 sm:tw-p-3 tw-border tw-border-solid tw-border-gray-200 tw-rounded-lg tw-flex tw-flex-col sm:tw-flex-row tw-gap-2 sm:tw-gap-3 sm:tw-justify-between sm:tw-items-center hover:tw-border-blue-300 tw-transition-colors'>
      <div className='tw-min-w-0 tw-flex-1'>
        <h3 className='tw-text-xs sm:tw-text-sm tw-font-medium tw-text-gray-900 tw-capitalize tw-truncate'>
          {patient.firstName} {patient.lastName}
        </h3>
        <span className='tw-text-xs sm:tw-text-sm tw-text-gray-700 tw-truncate tw-block'>{patient.email}</span>
        {patient.dob && (
          <div className='tw-text-xs tw-text-gray-600 tw-mt-0.5 sm:tw-mt-1 tw-truncate'>
            DOB: {formatUSDate(patient.dob)}
          </div>
        )}
      </div>
      <div className='tw-flex tw-gap-1 sm:tw-gap-2 tw-justify-end tw-flex-shrink-0'>
        <button
          type='button'
          onClick={onView}
          disabled={isPulling}
          className='btn btn-outline-primary tw-text-xs sm:tw-text-sm tw-px-2 sm:tw-px-3 tw-py-1.5 sm:tw-py-2 tw-whitespace-nowrap'
        >
          View
        </button>
        <button
          type='button'
          onClick={onPull}
          onKeyDown={handleKeyDown}
          disabled={isPulling}
          className='btn btn-primary tw-text-xs sm:tw-text-sm tw-px-2 sm:tw-px-3 tw-py-1.5 sm:tw-py-2 tw-whitespace-nowrap'
        >
          Select
        </button>
      </div>
    </div>
  );
};

const SearchPrompt = () => (
  <div className='tw-flex tw-flex-col tw-items-center tw-justify-center tw-px-4'>
    <div className='tw-text-6xl tw-mb-3'>🔍</div>
    <h3 className='tw-text-lg tw-font-semibold tw-text-gray-900 tw-mb-2'>Search for Patients</h3>
    <p className='tw-text-sm tw-text-gray-500 tw-text-center tw-max-w-sm'>
      Enter a patient&apos;s name or email in the search box above to view and select their orders.
    </p>
  </div>
);

const EmptyState = () => (
  <div className='tw-flex tw-flex-col tw-items-center tw-justify-center tw-px-4'>
    <div className='tw-text-6xl tw-mb-3'>👥</div>
    <h3 className='tw-text-lg tw-font-semibold tw-text-gray-900 tw-mb-2'>No Patients Found</h3>
    <p className='tw-text-sm tw-text-gray-500 tw-text-center tw-max-w-sm'>No patients match your search criteria.</p>
  </div>
);
