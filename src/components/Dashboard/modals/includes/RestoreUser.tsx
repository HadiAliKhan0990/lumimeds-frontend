'use client';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useEffect, useState } from 'react';
import { setModal } from '@/store/slices/modalSlice';
import { unselectAll } from '@/store/slices/selectedRowsSlice';
import { useArchiveProvidersMutation } from '@/store/slices/providersApiSlice';
import toast from 'react-hot-toast';
import { Provider } from '@/store/slices/providerSlice';
import { formatProviderName } from '@/lib/utils/providerName';

export function RestoreUser() {
  const [singleProvider, setSingleProvider] = useState<Provider | null>(null);

  const dispatch = useDispatch();

  const selectedRows = useSelector((state: RootState) => state.selectedRows);

  const [archiveProviders, { isLoading }] = useArchiveProvidersMutation();

  useEffect(() => {
    const handleProvidersRestored = (event?: CustomEvent) => {
      if (event?.detail?.provider) setSingleProvider(event?.detail?.provider);
    };

    window.addEventListener('singleProviderToRestore', handleProvidersRestored as EventListener);
  }, []);

  const handleClose = () => {
    dispatch(setModal({ modalType: undefined }));

    dispatch(unselectAll());
  };

  const handleConfirm = async () => {
    try {
      await archiveProviders({ providerIds: selectedRows, isArchived: false }).unwrap();
      toast.success(
        selectedRows?.length > 1
          ? `${selectedRows?.length} Providers have been restored successfully`
          : 'Provider has been restored successfully'
      );

      // Emit custom event to notify archived users page to refetch data
      const event = new CustomEvent('providersRestored', {
        detail: { providerIds: selectedRows },
      });
      window.dispatchEvent(event);

      handleClose();
    } catch (error) {
      console.log(error);
      toast.error(
        selectedRows?.length > 1 ? `${selectedRows?.length} Providers failed to restore` : 'Provider failed to restore'
      );
    }
  };

  return (
    <div>
      <p className={'text-2xl text-black text-center fw-medium mb-4 pb-2 mt-2'}>
        Restore{' '}
        {singleProvider ? (
          <span className='text-capitalize'>
            {formatProviderName(singleProvider?.provider?.firstName, singleProvider?.provider?.lastName).toLowerCase()}
          </span>
        ) : (
          `${selectedRows.length} Providers`
        )}
        ?
      </p>
      <div className={'d-flex align-items-center gap-3'}>
        <button
          onClick={handleClose}
          type={'button'}
          className={'btn btn-outline-primary flex-grow-1'}
          disabled={isLoading}
        >
          No
        </button>
        <button
          onClick={handleConfirm}
          type={'button'}
          className={'btn btn-primary flex-grow-1 d-flex align-items-center justify-content-center gap-2'}
          disabled={isLoading}
        >
          {isLoading && <span className='spinner-border spinner-border-sm' role='status' aria-hidden='true'></span>}
          Yes
        </button>
      </div>
    </div>
  );
}
