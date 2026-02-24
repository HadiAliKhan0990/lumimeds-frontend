import Search from '@/components/Dashboard/Search';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useLazyGetProviderPatientsQuery } from '@/store/slices/usersApiSlice';
import { useEffect, useState, useCallback } from 'react';
import { ProviderChatLogsPatient } from '@/types/users';
import { UserCard } from './includes/UserCard';
import { useScrollToLoad } from '@/hooks/useScrollToLoad';
import { useDebounce } from '@/hooks/useDebounce';
import { MessagesLog } from './includes/MessagesLog';

interface Props {
  selectedPatient: ProviderChatLogsPatient | null;
  setSelectedPatient: (patient: ProviderChatLogsPatient | null) => void;
  onOpenChatRoom?: (patient: ProviderChatLogsPatient) => void;
}

export const ChatLogs = ({ selectedPatient, setSelectedPatient, onOpenChatRoom }: Readonly<Props>) => {
  const { provider } = useSelector((state: RootState) => state.provider);

  const [patients, setPatients] = useState<ProviderChatLogsPatient[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const debouncedSearchTerm = useDebounce(searchTerm, 750);

  const [getProviderPatients, { isFetching }] = useLazyGetProviderPatientsQuery();

  const fetchPatients = useCallback(
    async (page: number, search?: string) => {
      if (!provider?.id) return;

      try {
        const result = await getProviderPatients({
          providerId: provider.id,
          page,
          limit: 20,
          ...(search && { search }),
        }).unwrap();

        if (result?.data) {
          const newPatients = result.data.patients || [];
          const meta = result.data.meta;

          if (page === 1) {
            setPatients(newPatients);
          } else {
            setPatients((prev) => {
              // Avoid duplicates
              const existingIds = new Set(prev.map((p) => p.id));
              const uniqueNew = newPatients.filter((p) => !existingIds.has(p.id));
              return [...prev, ...uniqueNew];
            });
          }

          setHasMore(meta.page < meta.totalPages);
        }
      } catch (error) {
        console.error('Failed to fetch provider patients:', error);
      }
    },
    [provider?.id, getProviderPatients]
  );

  // Initial load and when provider or search term changes
  useEffect(() => {
    if (provider?.id) {
      setCurrentPage(1);
      setPatients([]);
      setHasMore(true);
      fetchPatients(1, debouncedSearchTerm || undefined);
    }
  }, [provider?.id, debouncedSearchTerm, fetchPatients]);

  // Load more when page changes
  useEffect(() => {
    if (currentPage > 1 && provider?.id) {
      fetchPatients(currentPage, debouncedSearchTerm || undefined);
    }
  }, [currentPage, provider?.id, debouncedSearchTerm, fetchPatients]);

  const loadMore = useCallback(() => {
    if (!isFetching && hasMore) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [isFetching, hasMore]);

  const { loadMoreRef } = useScrollToLoad(loadMore, {
    enabled: hasMore && !isFetching,
  });

  const handlePatientSelect = useCallback((patient: ProviderChatLogsPatient) => {
    setSelectedPatient(patient);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  return (
    <div className='tw-grid tw-grid-cols-12 tw-h-full tw-border-t'>
      <div className='tw-border-r tw-col-span-12 md:tw-col-span-4 tw-flex tw-flex-col tw-overflow-hidden'>
        <div className='tw-p-3 tw-border-b'>
          <Search
            placeholder='Search patients...'
            value={searchTerm}
            onChange={handleSearchChange}
            isLoading={isFetching && patients.length === 0}
          />
        </div>
        <div className='tw-flex-1 tw-overflow-y-auto'>
          {(() => {
            if (isFetching && patients.length === 0) {
              return <div className='tw-p-4 tw-text-center tw-text-gray-500'>Loading patients...</div>;
            }
            if (patients.length === 0) {
              return <div className='tw-p-4 tw-text-center tw-text-gray-500'>No patients found</div>;
            }
            return (
              <>
                {patients.map((patient) => (
                  <UserCard
                    key={patient.id}
                    patient={patient}
                    isSelected={selectedPatient?.id === patient.id}
                    onSelect={handlePatientSelect}
                  />
                ))}
                {hasMore && (
                  <div ref={loadMoreRef} className='tw-p-4 tw-text-center'>
                    {isFetching && <div className='tw-text-gray-500'>Loading more...</div>}
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div>
      <div className='tw-col-span-12 md:tw-col-span-8 tw-flex tw-flex-col tw-overflow-hidden tw-h-full'>
        {selectedPatient ? (
          <MessagesLog patient={selectedPatient} onOpenChatRoom={onOpenChatRoom} />
        ) : (
          <div className='tw-flex tw-items-center tw-justify-center tw-h-full'>
            <p className='tw-text-gray-500'>Select a patient to view chat logs</p>
          </div>
        )}
      </div>
    </div>
  );
};
