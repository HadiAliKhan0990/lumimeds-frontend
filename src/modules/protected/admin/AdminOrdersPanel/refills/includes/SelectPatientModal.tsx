'use client';

import { Modal } from '@/components/elements';
import InfiniteScroll from 'react-infinite-scroll-component';
import Spinner from '@/components/Spinner';
import { useLazyGetChatUsersQuery } from '@/store/slices/chatApiSlice';
import { useEffect, useState, useCallback } from 'react';
import { debounce } from 'lodash';
import { User } from '@/store/slices/userSlice';
import { formatUSDate } from '@/helpers/dateFormatter';
import Search from '@/components/Dashboard/Search';

interface PatientWithDob extends User {
  dob?: string | Date | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectPatient: (patient: User) => void;
}

export const SelectPatientModal = ({ isOpen, onClose, onSelectPatient }: Readonly<Props>) => {
  const [patients, setPatients] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [inputValue, setInputValue] = useState('');

  const [getChatUsers, { isFetching }] = useLazyGetChatUsersQuery();

  const fetchPatients = useCallback(
    async (pageNumber: number, reset: boolean = false, searchTerm: string = '') => {
      try {
        const { data } = await getChatUsers({
          role: 'patient',
          page: pageNumber,
          limit: 30,
          search: searchTerm || null,
        });

        const newPatients = data?.patient || [];
        const totalPages = data?.totalPages || 1;

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
    [getChatUsers]
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
    if (isOpen) {
      setPatients([]);
      setPage(1);
      setHasMore(true);
      setInputValue('');
      fetchPatients(1, true, '');
    }
  }, [isOpen, fetchPatients]);

  useEffect(() => {
    // Cleanup debounce on unmount
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const fetchMoreData = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPatients(nextPage, false, inputValue);
  };

  const handleSelectPatient = (patient: User) => {
    onSelectPatient(patient);
  };

  const handleClose = () => {
    setPatients([]);
    setPage(1);
    setHasMore(true);
    setInputValue('');
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSearch(value);
  };

  const footer = (
    <button
      type='button'
      onClick={handleClose}
      className='tw-w-full tw-px-6 tw-py-3 tw-text-gray-700 tw-bg-white tw-border tw-border-gray-300 tw-rounded-lg hover:tw-bg-gray-50 tw-transition-colors'
    >
      Cancel
    </button>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title='Select Patient'
      size='xl'
      footer={footer}
      isLoading={isFetching && patients.length === 0}
      loadingText='Loading patients...'
      bodyClassName='!tw-p-0'
      closeOnBackdropClick={false}
    >
      {/* Search Input */}
      <div className='tw-px-4 tw-py-0.5'>
        <Search
          isLoading={isFetching}
          placeholder='Search patients by name or email...'
          value={inputValue}
          onChange={handleInputChange}
        />
      </div>

      {patients.length === 0 && !isFetching ? (
        <div className='tw-p-4'>
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
          className='tw-px-4 tw-space-y-3 tw-mt-4'
          height={438}
        >
          {patients.map((patient) => (
            <PatientCard key={patient.id} patient={patient} onSelect={handleSelectPatient} />
          ))}
        </InfiniteScroll>
      )}
    </Modal>
  );
};

const PatientCard = ({ patient, onSelect }: { patient: User; onSelect: (patient: User) => void }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(patient);
    }
  };

  return (
    <button
      type='button'
      onClick={() => onSelect(patient)}
      onKeyDown={handleKeyDown}
      className='tw-w-full tw-p-3 tw-border tw-border-solid tw-border-gray-200 tw-rounded-lg hover:tw-bg-gray-100 tw-transition-colors tw-text-left tw-flex tw-items-center tw-gap-3'
    >
      <div
        className='tw-rounded-full tw-text-sm tw-font-medium tw-w-8 tw-h-8 tw-min-w-8 tw-min-h-8 tw-uppercase tw-bg-neutral-100 tw-flex tw-items-center tw-justify-center tw-flex-shrink-0'
        style={{ aspectRatio: '1/1' }}
      >
        {patient.firstName?.[0]?.toUpperCase() || 'P'}
      </div>
      <div className='tw-text-sm tw-font-medium tw-text-gray-900 tw-flex-1'>
        <span className='tw-capitalize'>
          {[patient.firstName, patient.lastName].filter(Boolean).join(' ') || 'N/A'}
        </span>
        {(patient as PatientWithDob).dob && (
          <>
            {' - '}
            {formatUSDate((patient as PatientWithDob).dob)}
          </>
        )}
        {patient.email && (
          <>
            {' - '}
            <span className='tw-normal-case'>{patient.email}</span>
          </>
        )}
      </div>
    </button>
  );
};

const EmptyState = () => (
  <div className='tw-flex tw-flex-col tw-items-center tw-justify-center tw-py-16 tw-px-4'>
    <div className='tw-text-6xl tw-mb-3'>👥</div>
    <h3 className='tw-text-lg tw-font-semibold tw-text-gray-900 tw-mb-2'>No Patients Found</h3>
    <p className='tw-text-sm tw-text-gray-500 tw-text-center tw-max-w-sm'>No patients match your search criteria.</p>
  </div>
);
