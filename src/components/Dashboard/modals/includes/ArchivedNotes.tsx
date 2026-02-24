'use client';

import { formatUSDateTime } from '@/helpers/dateFormatter';
import type { Error } from '@/lib/types';
import { PatientNoteWithCreatedBy, getCreatorName } from '@/lib/utils/noteUtils';
import { RootState } from '@/store';
import { setModal } from '@/store/slices/modalSlice';
import { NotesState, setNotesMeta, setPatientNotes, triggerNotesRefetch } from '@/store/slices/patientNotesSlice';
import {
  useArchivePatientNotesMutation,
  useDeletePatientNotesMutation,
  useLazyGetPatientNotesQuery,
} from '@/store/slices/patientsApiSlice';
import { isAxiosError } from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight, MdOutlineSkipNext, MdOutlineSkipPrevious } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { Modal } from '@/components/elements';

export const ArchivedNotes = () => {
  const dispatch = useDispatch();
  const { modalType: currentModalType, type: modalType } = useSelector((state: RootState) => state.modal);
  const patient = useSelector((state: RootState) => state.patient);
  const isModalOpen = currentModalType === 'Archived Notes';
  const [meta, setMeta] = useState<NotesState['meta']>({});
  const [selectedNotes, setSelectedNotes] = useState<PatientNoteWithCreatedBy[]>([]);
  const [notes, setNotes] = useState<PatientNoteWithCreatedBy[]>([]);
  const [loading, setLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);

  const isFirstLoad = useRef(true);
  const isMounted = useRef(false);
  const lastModalType = useRef<string | undefined>(undefined);
  const lastPatientId = useRef<string | undefined>(undefined);

  const [unArchivePatientNotes] = useArchivePatientNotesMutation();
  const [deletePatientNotes] = useDeletePatientNotesMutation();
  const [triggerGetPatientNotes] = useLazyGetPatientNotesQuery();

  const handleUnArchiveNotes = async () => {
    try {
      setIsMutating(true);
      const ids = selectedNotes.map((note) => note.id) as string[];
      const { error } = await unArchivePatientNotes({ ids, isDeleted: false });
      if (error) {
        toast.error((error as Error).data.message);
      } else {
        await fetchNotes({ ...meta, page: 1 });

        const res = await triggerGetPatientNotes({
          id: patient.id || '',
          isDeleted: false,
          page: 1,
          type: modalType === 'Chart' ? 'Chart' : undefined,
        }).unwrap();
        if (res) {
          dispatch(setNotesMeta(res.meta));
          dispatch(setPatientNotes(res.notes));
        }

        toast.success('Patient Notes UnArchived Successfully!');
        // Trigger refetch for other appointments.
        dispatch(triggerNotesRefetch());
      }
    } catch (e) {
      if (isAxiosError(e)) {
        toast.error(e.response?.data.message);
      } else {
        toast.error('Error unarchiving notes!');
      }
    } finally {
      setIsMutating(false);
    }
  };

  const handleDeleteNotes = async () => {
    try {
      setIsMutating(true);
      const ids = selectedNotes.map((note) => note.id) as string[];
      const { error } = await deletePatientNotes(ids);
      if (error) {
        toast.error((error as Error).data.message);
      } else {
        await fetchNotes({ ...meta, page: 1 });
        const res = await triggerGetPatientNotes({
          id: patient.id || '',
          isDeleted: false,
          page: 1,
          type: modalType === 'Chart' ? 'Chart' : undefined,
        }).unwrap();
        if (res) {
          dispatch(setNotesMeta(res.meta));
          dispatch(setPatientNotes(res.notes));
        }

        toast.success('Patient Note(s) Deleted Successfully!');
        // Trigger refetch for other appointments
        dispatch(triggerNotesRefetch());
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.message);
      } else {
        toast.error('Error deleting Patient Notes!');
      }
    } finally {
      setIsMutating(false);
    }
  };

  const handleCheck = (note: PatientNoteWithCreatedBy) => {
    const exists = selectedNotes.some((n) => n.id === note.id);
    if (exists) {
      setSelectedNotes(selectedNotes.filter((n) => n.id !== note.id));
    } else {
      setSelectedNotes([...selectedNotes, note]);
    }
  };

  async function fetchNotes(queryMeta?: NotesState['meta']) {
    console.log('--------');

    if (loading || (!isFirstLoad.current && false)) return;
    if (!patient.id) {
      return;
    }
    try {
      console.log('--------');

      if (isFirstLoad.current) {
        setLoading(true);
      }
      const result = await triggerGetPatientNotes({
        id: patient.id,
        isDeleted: true,
        type: modalType === 'Chart' ? 'Chart' : modalType === 'Patient' ? 'Patient' : undefined,
        ...(queryMeta && { page: queryMeta.page, limit: queryMeta.limit }),
      }).unwrap();
      if (result && result.notes && result.meta) {
        setMeta(result.meta);
        setNotes(result.notes);
        setSelectedNotes([]);
      } else {
        setNotes([]);
        setMeta({});
      }
    } catch (error: unknown) {
      // Safely handle error without causing additional errors
      try {
        if (isAxiosError(error)) {
          const errorMessage = error.response?.data?.message || error.message || 'Error fetching archived notes';
          console.error('Error fetching archived notes:', errorMessage);
        } else if (error instanceof Error) {
          console.error('Error fetching archived notes:', error.message);
        } else {
          console.error('Error fetching archived notes:', String(error));
        }
      } catch (logError) {
        console.log(logError);

        // If even logging fails, silently fail
      }
      setNotes([]);
      setMeta({});
    } finally {
      if (isFirstLoad.current) {
        setLoading(false);
        isFirstLoad.current = false;
      }
    }
  }

  const onClickFirst = () => {
    if (meta?.page && meta.page > 1) {
      fetchNotes({ ...meta, page: 1 });
    }
  };

  const onClickLast = () => {
    if (meta?.page && meta?.totalPages && meta.page < meta.totalPages) {
      fetchNotes({ ...meta, page: meta.totalPages });
    }
  };

  const onClickNext = () => {
    if (meta?.page && meta?.totalPages && meta.page < meta.totalPages) {
      fetchNotes({ ...meta, page: meta.page + 1 });
    }
  };

  const onClickPrev = () => {
    if (meta?.page && meta.page > 1) {
      fetchNotes({ ...meta, page: meta.page - 1 });
    }
  };

  useEffect(() => {
    // Only fetch when modal is actually open
    if (!isModalOpen) {
      // Reset refs when modal closes
      isMounted.current = false;
      isFirstLoad.current = true;
      lastModalType.current = undefined;
      lastPatientId.current = undefined;
      return;
    }

    // Reset refs when modal closes (patient.id becomes undefined or changes)
    if (!patient.id) {
      isMounted.current = false;
      isFirstLoad.current = true;
      lastModalType.current = undefined;
      lastPatientId.current = undefined;
      return;
    }

    isFirstLoad.current = true;
    fetchNotes();
    isMounted.current = true;
    lastModalType.current = modalType;
    lastPatientId.current = patient.id;
  }, [isModalOpen, patient.id, modalType]);

  const handleClose = () => {
    dispatch(setModal({ modalType: undefined }));
  };

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={handleClose}
      title={`Archived ${modalType === 'Chart' ? 'Chart' : 'Patient'} Notes`}
      size='md'
      headerClassName='!tw-text-left'
      isLoading={loading}
      loadingText='Loading archived notes...'
    >
      {selectedNotes.length > 0 && (
        <div className='row gx-3 tw-mb-4'>
          <div className='col-4'>
            <button
              disabled={isMutating}
              className='btn btn-sm btn-outline-primary w-100'
              onClick={() => setSelectedNotes([])}
            >
              Cancel
            </button>
          </div>
          <div className='col-4'>
            <button
              disabled={isMutating}
              className='btn btn-sm d-flex align-items-center justify-content-center gap-2 btn-outline-primary w-100'
              onClick={handleUnArchiveNotes}
            >
              Unarchive
            </button>
          </div>
          <div className='col-4'>
            <button
              disabled={isMutating}
              className='btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center gap-2 w-100'
              onClick={handleDeleteNotes}
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {notes.length > 0 ? (
        <div className='d-flex flex-column gap-3 border border-c-light p-3 rounded-12 max-h-400 overflow-auto mb-4'>
          {notes.map((note, index) => (
            <div key={note.id} className={index === notes.length - 1 ? '' : 'border-bottom pb-3'}>
              <div className='d-flex flex-column gap-2'>
                <div className='d-flex align-items-center justify-content-between'>
                  <span className='tw-text-xs tw-text-[#7E7E7E]'>
                    Created at {formatUSDateTime(note.createdAt)}
                    {getCreatorName(note) && <span> - by {getCreatorName(note)}</span>}
                  </span>
                  <input
                    className='c_checkbox'
                    type='checkbox'
                    checked={selectedNotes.some((n) => n.id === note.id)}
                    onChange={() => handleCheck(note)}
                  />
                </div>
                {/* <span>{note.title}</span> */}
                <span className='tw-text-[#7E7E7E] tw-text-xs'>{note.description}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='py-5 my-5 d-flex flex-grow-1 align-items-center justify-content-center w-100 h-100 text-muted text-center'>
          No archived notes found!
        </div>
      )}

      {!loading && notes.length > 0 && (
        <div className='d-flex align-items-center justify-content-end gap-3 tw-mb-4'>
          <div>
            {meta?.page} of {meta?.totalPages}
          </div>
          <div className='d-flex align-items-center gap-3'>
            <button disabled={meta?.page === 1 || loading} onClick={onClickFirst} className='btn-no-style'>
              <MdOutlineSkipPrevious />
            </button>
            <button disabled={meta?.page === 1 || loading} onClick={onClickPrev} className='btn-no-style'>
              <MdKeyboardArrowLeft />
            </button>
            <button
              disabled={meta?.page === meta?.totalPages || loading}
              onClick={onClickNext}
              className='btn-no-style'
            >
              <MdKeyboardArrowRight />
            </button>
            <button
              disabled={meta?.page === meta?.totalPages || loading}
              onClick={onClickLast}
              className='btn-no-style'
            >
              <MdOutlineSkipNext />
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
