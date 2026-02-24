'use client';

import StateList from './includes/state-list';
import StateModal from './includes/state-modal';
import { FiPlus } from 'react-icons/fi';
import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
  fetchLicensedStates,
  addLicensedState,
  updateLicensedState,
  deleteLicensedState,
  selectLoading,
  selectError,
  clearError,
  StateItem,
} from '@/store/slices/licensedStatesSlice';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store';
import { Card } from 'react-bootstrap';
import { formatProviderName } from '@/lib/utils/providerName';
import { Error as ErrorType } from '@/lib/types';
import { isAxiosError } from 'axios';
import { useUploadLicensesStatesMutation } from '@/store/slices/providersApiSlice';
import { CircularProgress } from '@/components/elements';

export default function LicensedStates() {
  const dispatch = useDispatch<AppDispatch>();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loading = useSelector(selectLoading);
  const providerId = useSelector(
    (s: RootState) => s.provider?.id || s.provider?.provider?.id || s.user?.id || s.user?.user?.id
  );
  const doctorName = useSelector((s: RootState) => s.licensedStates.doctorName);
  const error = useSelector(selectError);
  const currentStates = useSelector((s: RootState) => s.licensedStates.states);

  const [editing, setEditing] = useState<StateItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<{
    adding: boolean;
    updating: boolean;
    removing: boolean;
  }>({
    adding: false,
    updating: false,
    removing: false,
  });

  const [uploadLicensesStates, { isLoading: isUploading }] = useUploadLicensesStatesMutation();

  const openModal = (state: StateItem | null) => {
    setEditing(state);
    setShowModal(true);
  };

  const showPopup = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    if (type === 'success') toast.success(msg);
    else toast.error(msg);
  }, []);

  const handleSave = async (data: Omit<StateItem, 'id'> & { id?: string }) => {
    if (data.id) {
      if (actionLoading.updating) return;

      if (!providerId) {
        showPopup('Unable to update licensed state: provider not loaded yet', 'error');
        return;
      }

      const isDuplicateOnEdit = currentStates.some(
        (state) => state.name.toLowerCase() === data.name.toLowerCase() && state.id !== data.id
      );
      if (isDuplicateOnEdit) {
        showPopup('This licensed state already exists. Please choose a different state.', 'error');
        return;
      }

      setActionLoading((prev) => ({ ...prev, updating: true }));

      const action = await dispatch(
        updateLicensedState({
          id: data.id,
          data: {
            name: data.name,
            licenseNumber: data.licenseNumber,
            expiration: data.expiration,
          },
          providerId,
        })
      );

      setActionLoading((prev) => ({ ...prev, updating: false }));

      if (updateLicensedState.fulfilled.match(action)) {
        showPopup('Licensed state updated successfully!', 'success');
        setShowModal(false);
      } else if (updateLicensedState.rejected.match(action)) {
        showPopup(action.payload || action.error.message || 'Failed to update licensed state', 'error');
      }
    } else {
      if (actionLoading.adding) return;

      if (!providerId) {
        showPopup('Unable to add licensed state: data not loaded yet', 'error');
        return;
      }

      const isDuplicate = currentStates.some(
        (state) => state.name.toLowerCase() === data.name.toLowerCase() && state.id !== data.id
      );

      if (isDuplicate) {
        showPopup('This licensed state already exists. Please choose a different state.', 'error');
        return;
      }

      setActionLoading((prev) => ({ ...prev, adding: true }));

      const action = await dispatch(
        addLicensedState({
          name: data.name,
          licenseNumber: data.licenseNumber,
          expiration: data.expiration,
          providerId,
        })
      );

      setActionLoading((prev) => ({ ...prev, adding: false }));

      if (addLicensedState.fulfilled.match(action)) {
        showPopup('Licensed state added successfully!', 'success');
        setShowModal(false);
      } else if (addLicensedState.rejected.match(action)) {
        showPopup(action.payload || action.error.message || 'Failed to add licensed state', 'error');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (actionLoading.removing) return;

    if (!providerId) {
      showPopup('Unable to remove licensed state: provider not loaded yet', 'error');
      return;
    }

    setActionLoading((prev) => ({ ...prev, removing: true }));

    const action = await dispatch(deleteLicensedState({ id, providerId }));

    setActionLoading((prev) => ({ ...prev, removing: false }));

    if (deleteLicensedState.fulfilled.match(action)) {
      showPopup('Licensed state removed successfully!', 'success');
    } else if (deleteLicensedState.rejected.match(action)) {
      showPopup(action.payload || action.error.message || 'Failed to remove licensed state', 'error');
    }
    setShowModal(false);
    setEditing(null);
  };

  const handleExport = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

      const response = await fetch(`${apiUrl}/providers/licenses/template`, {
        method: 'GET',
        headers: {
          Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download template');
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'provider-licenses-template.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      showPopup('Template downloaded successfully', 'success');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to download template';
      showPopup(msg, 'error');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!providerId) {
      showPopup('Provider not loaded yet', 'error');
      return;
    }

    const toastId = toast.loading('Uploading file...');

    try {
      const form = new FormData();
      form.append('file', file);

      const { success, message, data } = await uploadLicensesStates({ providerId, data: form }).unwrap();

      if (success) {
        await dispatch(fetchLicensedStates({ providerId }));
        if (data?.processedCount && data?.processedCount > 0) {
          toast.success('File uploaded successfully', { id: toastId });
        } else {
          toast.error('File upload failed', { id: toastId });
        }
      } else {
        toast.error(message || 'File upload failed', { id: toastId });
      }
    } catch (error) {
      const errorMessage = isAxiosError(error)
        ? error.response?.data.message
        : (error as ErrorType).data.message || 'Failed to import file';
      toast.error(errorMessage, { id: toastId });
    }
  };

  useEffect(() => {
    if (providerId) {
      dispatch(fetchLicensedStates({ providerId }));
    }
  }, [dispatch, providerId]);

  useEffect(() => {
    if (error) {
      setTimeout(() => dispatch(clearError()), 1500);
    }
  }, [error, dispatch]);

  // Show loading state while fetching data or when doctorName is not available yet
  if (loading || !doctorName) {
    return (
      <div className='d-flex flex-column justify-content-center' style={{ minHeight: '50vh' }}>
        <div className='d-flex justify-content-center'>
          <CircularProgress className='!tw-w-10 !tw-h-10' />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Card body className='rounded-12 border-light tw-pt-4'>
        <div className='d-flex flex-wrap gap-2 justify-content-between align-items-center mb-1 px-2 px-md-3'>
          <div className='d-flex flex-column gap-2'>
            <h2 className='fw-semibold fs-5 text-muted mb-0'>Licensed States</h2>
            <span className='fw-semibold fs-2 mb-0'>{formatProviderName(doctorName || '')}</span>
            {loading && <span className='text-muted'>Loading…</span>}
          </div>
          <div className='d-flex tw-self-start flex-wrap gap-2'>
            <button
              className='btn ls-btn-outline-primary btn-outline-primary d-flex align-items-center ps-1 pe-2 py-2 btn-sm me-1'
              onClick={() => openModal(null)}
            >
              <FiPlus className='me-1' size={18} />
              <span className='d-none d-md-inline'>Add More States</span>
              <span className='d-inline d-md-none' style={{ fontSize: '12px' }}>
                Add
              </span>
            </button>
            <button className='btn btn-outline-primary btn-sm' onClick={handleExport}>
              <span className='d-none d-sm-inline'>Download Template</span>
              <span className='d-inline d-sm-none'>Download</span>
            </button>
            <button className='btn btn-outline-primary btn-sm' disabled={isUploading} onClick={handleImportClick}>
              <span className='d-none d-sm-inline'>Upload File</span>
              <span className='d-inline d-sm-none'>Upload</span>
            </button>
          </div>
        </div>
        <div
          className='pt-2 pb-2 rounded-3 ls-scroll-container tw-overflow-y-auto px-2 px-md-3'
          style={{ maxHeight: 'calc(100vh - 240px)' }}
        >
          <StateList setEditing={(state) => openModal(state)} />
        </div>
      </Card>

      <StateModal
        show={showModal}
        initialData={editing || undefined}
        onSave={handleSave}
        onClose={() => setShowModal(false)}
        onDelete={editing ? () => handleDelete(editing.id) : undefined}
        isAdding={actionLoading.adding}
        isUpdating={actionLoading.updating}
        isRemoving={actionLoading.removing}
      />

      <input
        ref={fileInputRef}
        type='file'
        accept='.xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv'
        className='tw-hidden'
        onChange={handleImportFile}
      />
    </div>
  );
}
