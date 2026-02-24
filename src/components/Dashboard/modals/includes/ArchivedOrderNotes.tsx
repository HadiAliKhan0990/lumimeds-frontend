'use client';

import toast from 'react-hot-toast';
import { formatUSDateTime } from '@/helpers/dateFormatter';
import { PatientNoteWithCreatedBy, getCreatorName } from '@/lib/utils/noteUtils';
import { RootState } from '@/store';
import { setModal } from '@/store/slices/modalSlice';
import {
  useArchiveOrderNotesMutation,
  useDeleteOrderNotesMutation,
  useLazyGetOrderNotesQuery,
} from '@/store/slices/orderNotesApiSlice';
import { isAxiosError } from 'axios';
import { useEffect, useState, useRef } from 'react';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight, MdOutlineSkipNext, MdOutlineSkipPrevious } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { Modal } from '@/components/elements';

interface NotesState {
  meta: {
    page: number;
    limit: number;
    totalPages: number;
    total: number;
  };
}

export const ArchivedOrderNotes = () => {
  const dispatch = useDispatch();
  const { modalType } = useSelector((state: RootState) => state.modal);
  const order = useSelector((state: RootState) => state.order);
  const isModalOpen = modalType === 'Archived Order Notes';

  const [meta, setMeta] = useState<NotesState['meta']>({
    page: 1,
    limit: 10,
    totalPages: 0,
    total: 0,
  });
  const [selectedNotes, setSelectedNotes] = useState<PatientNoteWithCreatedBy[]>([]);
  const [notes, setNotes] = useState<PatientNoteWithCreatedBy[]>([]);
  const [loading, setLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);

  const isFirstLoad = useRef(true);

  const [unArchiveOrderNotes] = useArchiveOrderNotesMutation();
  const [deleteOrderNotes] = useDeleteOrderNotesMutation();
  const [triggerGetOrderNotes] = useLazyGetOrderNotesQuery();

  const handleUnArchiveNotes = async () => {
    try {
      setIsMutating(true);
      const ids = selectedNotes.map((note) => note.id) as string[];
      const result = await unArchiveOrderNotes({ ids, isDeleted: false });
      if ('error' in result) {
        toast.error('Error unarchiving notes');
      } else {
        await fetchNotes({ ...meta, page: 1 });
        toast.success('Order Notes unarchived Successfully!');
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
      const result = await deleteOrderNotes(ids);
      if ('error' in result) {
        toast.error('Error deleting Order Notes');
      } else {
        await fetchNotes({ ...meta, page: 1 });
        toast.success('Order Note(s) Deleted Successfully!');
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.message);
      } else {
        toast.error('Error deleting Order Notes!');
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
    if (loading || (!isFirstLoad.current && false)) return;
    try {
      if (isFirstLoad.current) {
        setLoading(true);
      }
      const { notes, meta } = await triggerGetOrderNotes({
        orderId: order.id || '',
        isDeleted: true,
        page: queryMeta?.page || 1,
        limit: queryMeta?.limit || 10,
        sortBy: 'DESC',
        sortField: 'createdAt',
      }).unwrap();
      setMeta(meta);
      setNotes(notes);
      setSelectedNotes([]);
    } catch (error) {
      console.error(error);
    } finally {
      if (isFirstLoad.current) {
        setLoading(false);
        isFirstLoad.current = false;
      }
    }
  }

  const handleClose = () => {
    dispatch(setModal({ modalType: undefined }));
  };

  const onClickFirst = () => {
    if (meta?.page && meta.page > 1) {
      fetchNotes({ ...meta, page: 1 });
    }
  };

  const onClickLast = () => {
    if (meta?.page && meta.page < meta.totalPages) {
      fetchNotes({ ...meta, page: meta.totalPages });
    }
  };

  const onClickNext = () => {
    if (meta?.page && meta.page < meta.totalPages) {
      fetchNotes({ ...meta, page: meta.page + 1 });
    }
  };

  const onClickPrev = () => {
    if (meta?.page && meta.page > 1) {
      fetchNotes({ ...meta, page: meta.page - 1 });
    }
  };

  useEffect(() => {
    if (order.id) {
      fetchNotes();
    }
  }, [order.id]);

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={handleClose}
      title='Archived Order Notes'
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
