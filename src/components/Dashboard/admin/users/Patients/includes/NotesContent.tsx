'use client';

import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { PatientNote, setPatientNote } from '@/store/slices/patientNoteSlice';
import { FaPlus } from 'react-icons/fa6';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight, MdOutlineSkipNext, MdOutlineSkipPrevious } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setModal, setModalType } from '@/store/slices/modalSlice';
import {
  useArchivePatientNotesMutation,
  useDeletePatientNotesMutation,
  useLazyGetPatientNotesQuery,
} from '@/store/slices/patientsApiSlice';
import { NotesState, triggerNotesRefetch } from '@/store/slices/patientNotesSlice';
import { PatientNoteWithCreatedBy, getCreatorName } from '@/lib/utils/noteUtils';
import { isAxiosError } from 'axios';
import { Error } from '@/lib/types';
import { formatUSDateTime } from '@/helpers/dateFormatter';

export function NotesContent() {
  const dispatch = useDispatch();

  const [localNotes, setLocalNotes] = useState<PatientNoteWithCreatedBy[]>([]);
  const [localMeta, setLocalMeta] = useState<NotesState['meta']>({});

  // Use local state instead of Redux for notes display
  const data = localNotes;
  const meta = localMeta;
  const patient = useSelector((state: RootState) => state.patient);
  const modalType = useSelector((state: RootState) => state.modal.modalType);
  const notesRefetchTrigger = useSelector((state: RootState) => state.patientNotes.refetchTrigger);

  const [selectedNotes, setSelectedNotes] = useState<PatientNote[]>([]);

  const [archivePatientNotes, { isLoading }] = useArchivePatientNotesMutation();
  const [deletePatientNotes, { isLoading: isDeleting }] = useDeletePatientNotesMutation();
  const [triggerGetPatientNotes, { isFetching }] = useLazyGetPatientNotesQuery();

  const onClickFirst = async () => {
    await fetchNotes({ ...meta, page: 1 });
  };

  const onClickLast = async () => {
    await fetchNotes({ ...meta, page: meta?.totalPages });
  };

  const onClickNext = async () => {
    await fetchNotes({ ...meta, page: (meta?.page ?? 1) + 1 });
  };

  const onClickPrev = async () => {
    await fetchNotes({ ...meta, page: (meta?.page ?? 1) - 1 });
  };

  const handleEditNote = (note: PatientNote) => {
    dispatch(setPatientNote(note));
    dispatch(setModal({ modalType: 'Edit Patient Note' }));

    dispatch(setModalType('Patient'));
  };

  const handleCheck = (note: PatientNote) => {
    const isNoteExist = selectedNotes.some((selectedNote) => selectedNote.id === note.id);
    if (isNoteExist) setSelectedNotes(selectedNotes.filter((selectedNote) => selectedNote.id !== note.id));
    else setSelectedNotes([...selectedNotes, note]);
  };

  const handleArchiveNotes = async () => {
    try {
      const ids = selectedNotes.map((note) => note.id) as string[];
      const { error } = await archivePatientNotes({ ids, isDeleted: true });
      if (error) {
        toast.error((error as Error).data.message);
      } else {
        toast.success('Patient Notes Archived Successfuly!');
        setSelectedNotes([]);
        // Refetch notes after successful archive
        await fetchNotes();
        // Trigger refetch for other appointments
        dispatch(triggerNotesRefetch());
      }
    } catch (e) {
      if (isAxiosError(e)) {
        toast.error(e.response?.data.message);
      } else {
        toast.error('Error archiving notes!');
      }
    }
  };

  const handleDeleteNotes = async () => {
    try {
      const ids = selectedNotes.map((note) => note.id) as string[];
      const { error } = await deletePatientNotes(ids);
      if (error) {
        toast.error((error as Error).data.message);
      } else {
        toast.success('Patient Note(s) Deleted Successfuly!');
        setSelectedNotes([]);
        // Refetch notes after successful delete
        await fetchNotes();
        // Trigger refetch for other appointments
        dispatch(triggerNotesRefetch());
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.message);
      } else {
        toast.error('Error deleting Patient Notes!');
      }
    }
  };

  const handleAddPatientNoteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(setModal({ modalType: 'Add Patient Note' }));

    dispatch(setModalType('Patient'));
  };

  async function fetchNotes(queryMeta?: NotesState['meta']) {
    if (!patient.id || isFetching) return;

    try {
      const res = await triggerGetPatientNotes({
        id: patient.id || '',
        type: 'Patient',
        isDeleted: false,
        ...(queryMeta && { page: queryMeta.page || 1, limit: queryMeta.limit || 10 }),
      }).unwrap();

      if (res && res.meta && res.notes) {
        setLocalMeta(res.meta);
        setLocalNotes(res.notes);
      }
    } catch (error) {
      toast.error(
        isAxiosError(error)
          ? error.response?.data?.message || 'Error fetching patient notes'
          : (error as Error)?.data?.message || 'Error fetching patient notes'
      );
    }
  }

  useEffect(() => {
    if (patient.id) {
      fetchNotes();
    }
  }, [patient.id]);

  useEffect(() => {
    if (modalType === undefined && patient.id) {
      triggerGetPatientNotes({ id: patient.id, isDeleted: false, page: 1, type: 'Patient' }).then((result) => {
        if (result.data) {
          setLocalMeta(result.data.meta);
          setLocalNotes(result.data.notes);
        }
      });
    }
  }, [modalType, patient.id]);

  useEffect(() => {
    if (patient.id && notesRefetchTrigger) {
      triggerGetPatientNotes({ id: patient.id, isDeleted: false, page: 1, limit: 10, type: 'Patient' }).then((result) => {
        if (result.data) {
          setLocalMeta(result.data.meta);
          setLocalNotes(result.data.notes);
        }
      });
    }
  }, [notesRefetchTrigger, patient.id]);

  return (
    <div className='tw-space-y-4 border border-c-light d-flex flex-column rounded-12'>
      <div className='pt-2 px-2 tw-flex tw-flex-col'>
        <div className='tw-flex tw-justify-between tw-items-center'>
          <span className='fw-medium'>Notes</span>
          <div className='d-flex align-items-center gap-3'>
            {selectedNotes.length > 0 ? (
              <>
                <button
                  className='btn-no-style text-primary text-xs text-nowrap notes-btn'
                  onClick={() => setSelectedNotes([])}
                >
                  Cancel
                </button>
                <button
                  disabled={isLoading}
                  className={'btn-no-style text-xs text-nowrap notes-btn ' + (isLoading ? '' : 'text-primary')}
                  onClick={handleArchiveNotes}
                >
                  Archive
                </button>
                <button
                  disabled={isDeleting}
                  className={'btn-no-style text-xs text-nowrap notes-btn ' + (isDeleting ? '' : 'text-danger')}
                  onClick={handleDeleteNotes}
                >
                  Remove
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleAddPatientNoteClick}
                  className='notes-btn btn-no-style text-nowrap text-primary d-flex align-items-center justify-content-center gap-1 text-xs'
                >
                  <span>New Note</span>
                  <FaPlus size={12} className='flex-shrink-0' />
                </button>
                <button
                  onClick={() => dispatch(setModal({ modalType: 'Archived Notes' }))}
                  className=' notes-btn btn-no-style text-primary text-xs text-nowrap'
                >
                  Archived
                </button>
              </>
            )}

            {/* <select value={meta?.sortField} onChange={(e) => dispatch(setNotesMeta({ ...meta, sortField: e.target.value }))} className='form-select form-select-sm shadow-none'>
            <option value=''>Sort By</option>
            <option value='title'>Name</option>
            <option value='createdAt'>Date</option>
          </select> */}
          </div>
        </div>
      </div>
      <div className='px-2 tw-flex tw-flex-col overflow-auto notes_container tw-flex-1 flex-grow-1'>
        <div className='d-flex flex-column gap-3 tw-flex-1 flex-grow-1 h-100'>
          {data && data.length > 0 ? (
            data
              .filter((note) => !note.isDeleted)
              .map((note) => (
                <div key={note.id} className='border-bottom pb-3'>
                  <div onClick={() => handleEditNote(note)} className='d-flex flex-column cursor-pointer gap-2'>
                    <div className='d-flex align-items-center justify-content-between'>
                      <span className='tw-text-xs tw-text-[#7E7E7E]'>
                        Created at {formatUSDateTime(note.createdAt)}
                        {getCreatorName(note) && <span> - by {getCreatorName(note)}</span>}
                      </span>
                      <input
                        onClick={(e) => e.stopPropagation()}
                        className='c_checkbox'
                        type='checkbox'
                        checked={selectedNotes.some((selectedNote) => selectedNote.id === note.id)}
                        onChange={() => handleCheck(note)}
                      />
                    </div>
                    {/* <span>{note.title}</span> */}
                    <span className='tw-text-[#7E7E7E] tw-text-xs'>{note.description}</span>
                  </div>
                </div>
              ))
          ) : (
            <div className='py-5 my-5 d-flex flex-grow-1 align-items-center justify-content-center w-100 h-100 text-muted text-center'>
              No recent notes found!
            </div>
          )}
        </div>
      </div>
      <div className='d-flex align-items-center justify-content-end gap-3 p-2'>
        <div>
          {meta?.page ?? 0} of {meta?.totalPages || 1}
        </div>
        <div className='d-flex align-items-center gap-3'>
          <button disabled={isFetching || meta?.page === 1} onClick={onClickFirst} className='btn-no-style'>
            <MdOutlineSkipPrevious />
          </button>
          <button disabled={isFetching || meta?.page === 1} onClick={onClickPrev} className='btn-no-style'>
            <MdKeyboardArrowLeft />
          </button>
          <button
            disabled={isFetching || meta?.page === meta?.totalPages || meta?.totalPages === 0}
            onClick={onClickNext}
            className='btn-no-style'
          >
            <MdKeyboardArrowRight />
          </button>
          <button
            disabled={isFetching || meta?.page === meta?.totalPages || meta?.totalPages === 0}
            onClick={onClickLast}
            className='btn-no-style'
          >
            <MdOutlineSkipNext />
          </button>
        </div>
      </div>
    </div>
  );
}