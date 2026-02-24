'use client';

import toast from 'react-hot-toast';
import InfiniteScroll from 'react-infinite-scroll-component';
import { formatUSDateTime } from '@/helpers/dateFormatter';
import { MetaPayload, SingleOrder } from '@/lib/types';
import { PatientNoteWithCreatedBy, getCreatorName } from '@/lib/utils/noteUtils';
import { RootState } from '@/store';
import { ModalType, setModal, setModalType } from '@/store/slices/modalSlice';
import {
  useArchiveOrderNotesMutation,
  useDeleteOrderNotesMutation,
  useLazyGetOrderNotesQuery,
} from '@/store/slices/orderNotesApiSlice';
import { Order, setOrderPatient } from '@/store/slices/orderSlice';
import { setPatientNote } from '@/store/slices/patientNoteSlice';
import { setPatient } from '@/store/slices/patientSlice';
import { useLazyGetPatientNotesQuery } from '@/store/slices/patientsApiSlice';
import { SortState } from '@/store/slices/sortSlice';
import { isAxiosError } from 'axios';
import { useEffect, useRef, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa6';
import { useDispatch, useSelector } from 'react-redux';

interface NotesState {
  data: PatientNoteWithCreatedBy[];
  meta: SortState['meta'];
}

type NoteTabType = 'order' | 'patient';

interface Props {
  type?: NoteTabType;
  orderData?: SingleOrder;
}

export function OrderNotesContent({ type, orderData }: Readonly<Props>) {
  const dispatch = useDispatch();

  // Separate state for each note type
  const [orderNotes, setOrderNotes] = useState<NotesState>({
    data: [] as PatientNoteWithCreatedBy[],
    meta: { page: 1, limit: 30 },
  });

  const [patientNotes, setPatientNotes] = useState<NotesState>({
    data: [] as PatientNoteWithCreatedBy[],
    meta: { page: 1, limit: 30 },
  });

  const [hasInitializedOrder, setHasInitializedOrder] = useState(false);
  const [hasInitializedPatient, setHasInitializedPatient] = useState(false);

  const order = useSelector((state: RootState) => state.order);
  const modalType = useSelector((state: RootState) => state.modal.modalType);
  const prevModalTypeRef = useRef<ModalType['modalType']>(modalType);

  const [selectedOrderNotes, setSelectedOrderNotes] = useState<PatientNoteWithCreatedBy[]>([]);
  const [selectedPatientNotes, setSelectedPatientNotes] = useState<PatientNoteWithCreatedBy[]>([]);

  // API hooks for both note types
  const [archiveOrderNotes, { isLoading: isArchivingOrderNotes }] = useArchiveOrderNotesMutation();
  const [deleteOrderNotes, { isLoading: isDeletingOrderNotes }] = useDeleteOrderNotesMutation();
  const [triggerGetOrderNotes, { isFetching: isFetchingOrderNotes }] = useLazyGetOrderNotesQuery();
  const [triggerGetPatientNotes, { isFetching: isFetchingPatientNotes }] = useLazyGetPatientNotesQuery();

  const appendNotesDataLocally = (currentData: NotesState, newData: NotesState): NotesState => {
    if (currentData?.data) {
      const existingIds = new Set(currentData.data.map((note) => note.id));
      const uniqueNewNotes = (newData?.data || []).filter((note) => !existingIds.has(note.id));

      return {
        data: [...currentData.data, ...uniqueNewNotes],
        meta: newData?.meta || currentData.meta,
      };
    } else {
      // If no existing data, return the new data
      return {
        data: newData?.data || [],
        meta: newData?.meta,
      };
    }
  };

  async function handleUpdateOrderNotes({ meta, append = false }: MetaPayload) {
    try {
      const { data: orderRes } = await triggerGetOrderNotes({
        orderId: order.id || '',
        page: meta?.page,
        limit: 30,
        sortBy: 'DESC',
        sortField: 'createdAt',
      });

      const { notes: newNotes } = orderRes || {};

      if (append) {
        setOrderNotes((prev) =>
          appendNotesDataLocally(prev, {
            data: newNotes || [],
            meta: orderRes?.meta,
          })
        );
      } else {
        setOrderNotes({ data: newNotes || [], meta: orderRes?.meta });
      }
    } catch (error) {
      console.error('Error fetching order notes:', error);
    }
  }

  async function handleUpdatePatientNotes({ meta, append = false }: MetaPayload) {
    try {
      const { data: patientRes } = await triggerGetPatientNotes({
        id: order?.patient?.id ?? '',
        page: meta?.page,
        limit: 30,
        type: 'Chart',
      });

      const { notes: newNotes } = patientRes || {};

      if (append) {
        setPatientNotes((prev) =>
          appendNotesDataLocally(prev, {
            data: newNotes || [],
            meta: patientRes?.meta,
          })
        );
      } else {
        setPatientNotes({ data: newNotes || [], meta: patientRes?.meta });
      }
    } catch (error) {
      console.error('Error fetching patient notes:', error);
    }
  }

  const handleEditOrderNote = (note: PatientNoteWithCreatedBy) => {
    dispatch(setPatientNote(note));
    dispatch(setModal({ modalType: 'Edit Order Note' }));
    dispatch(setModalType(undefined));
  };

  const handleEditPatientNote = (note: PatientNoteWithCreatedBy) => {
    dispatch(setPatientNote(note));
    dispatch(setModal({ modalType: 'Edit Patient Note' }));
    dispatch(setModalType('Chart'));
  };

  const handleCheckOrderNote = (note: PatientNoteWithCreatedBy) => {
    const isNoteExist = selectedOrderNotes.some((selectedNote) => selectedNote.id === note.id);
    if (isNoteExist) {
      setSelectedOrderNotes(selectedOrderNotes.filter((selectedNote) => selectedNote.id !== note.id));
    } else {
      setSelectedOrderNotes([...selectedOrderNotes, note]);
    }
  };

  const handleCheckPatientNote = (note: PatientNoteWithCreatedBy) => {
    const isNoteExist = selectedPatientNotes.some((selectedNote) => selectedNote.id === note.id);
    if (isNoteExist) {
      setSelectedPatientNotes(selectedPatientNotes.filter((selectedNote) => selectedNote.id !== note.id));
    } else {
      setSelectedPatientNotes([...selectedPatientNotes, note]);
    }
  };

  const handleArchiveOrderNotes = async () => {
    try {
      const ids = selectedOrderNotes.map((note) => note.id) as string[];
      const result = await archiveOrderNotes({ ids, isDeleted: true });
      if ('error' in result) {
        toast.error('Error archiving notes');
      } else {
        toast.success('Order Notes Archived Successfully!');
        setSelectedOrderNotes([]);
        setOrderNotes((prev) => ({
          ...prev,
          data: prev.data.filter((note) => !ids.includes(note.id || '')),
        }));
      }
    } catch (e) {
      if (isAxiosError(e)) {
        toast.error(e.response?.data.message);
      } else {
        toast.error('Error archiving notes!');
      }
    }
  };

  const handleArchivePatientNotes = async () => {
    try {
      const ids = selectedPatientNotes.map((note) => note.id) as string[];
      const result = await archiveOrderNotes({ ids, isDeleted: true });
      if ('error' in result) {
        toast.error('Error archiving notes');
      } else {
        toast.success('Chart Notes Archived Successfully!');
        setSelectedPatientNotes([]);
        setPatientNotes((prev) => ({
          ...prev,
          data: prev.data.filter((note) => !ids.includes(note.id || '')),
        }));
      }
    } catch (e) {
      if (isAxiosError(e)) {
        toast.error(e.response?.data.message);
      } else {
        toast.error('Error archiving notes!');
      }
    }
  };

  const handleDeleteOrderNotes = async () => {
    try {
      const ids = selectedOrderNotes.map((note) => note.id) as string[];
      const result = await deleteOrderNotes(ids);
      if ('error' in result) {
        toast.error('Error deleting Order Notes');
      } else {
        toast.success('Order Note(s) Deleted Successfully!');
        setSelectedOrderNotes([]);
        setOrderNotes((prev) => ({
          ...prev,
          data: prev.data.filter((note) => !ids.includes(note.id || '')),
        }));
        if (orderNotes.data.length === 0) {
          setOrderNotes({ data: [], meta: { page: 1, limit: 30 } });
        }
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.message);
      } else {
        toast.error('Error deleting Order Notes!');
      }
    }
  };

  const handleDeletePatientNotes = async () => {
    try {
      const ids = selectedPatientNotes.map((note) => note.id) as string[];
      const result = await deleteOrderNotes(ids);
      if ('error' in result) {
        toast.error('Error deleting Chart Notes');
      } else {
        toast.success('Chart Note(s) Deleted Successfully!');
        setSelectedPatientNotes([]);
        setPatientNotes((prev) => ({
          ...prev,
          data: prev.data.filter((note) => !ids.includes(note.id || '')),
        }));
        if (patientNotes.data.length === 0) {
          setPatientNotes({ data: [], meta: { page: 1, limit: 30 } });
        }
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.message);
      } else {
        toast.error('Error deleting Chart Notes!');
      }
    }
  };

  const handleAddOrderNoteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!order.patient?.id) {
      dispatch(setOrderPatient(orderData?.patient as Order['patient']));
    }
    dispatch(setModal({ modalType: 'Add Order Note' }));
    dispatch(setModalType(undefined));
  };

  const handleAddPatientNoteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!order.patient?.id) {
      dispatch(setOrderPatient(orderData?.patient as Order['patient']));
    }
    dispatch(setModal({ modalType: 'Add Patient Note' }));
    dispatch(setModalType('Chart'));
  };

  // Initialize both note types
  useEffect(() => {
    if (order.id && !hasInitializedOrder) {
      handleUpdateOrderNotes({ meta: { page: 1, limit: 30 } });
      setHasInitializedOrder(true);
    }
  }, [order.id, hasInitializedOrder]);

  useEffect(() => {
    if (order.id && order.patient?.id && !hasInitializedPatient) {
      handleUpdatePatientNotes({ meta: { page: 1, limit: 30 } });
      setHasInitializedPatient(true);
    }
  }, [order.id, order.patient?.id, hasInitializedPatient]);

  // Refetch notes when relevant modal closes
  useEffect(() => {
    const prev = prevModalTypeRef.current;
    const wasNotesModal =
      prev === 'Add Order Note' ||
      prev === 'Edit Order Note' ||
      prev === 'Archived Order Notes' ||
      prev === 'Archived Notes' ||
      prev === 'Add Patient Note' ||
      prev === 'Edit Patient Note' ||
      prev === 'View Note Details';
    if (modalType === undefined && order.id && wasNotesModal) {
      handleUpdateOrderNotes({ meta: { page: 1, limit: 30 } });
      if (order.patient?.id) {
        handleUpdatePatientNotes({ meta: { page: 1, limit: 30 } });
      }
    }
    prevModalTypeRef.current = modalType;
  }, [modalType, order.id, order.patient?.id]);

  useEffect(() => {
    if (type) {
      if (type === 'patient') {
        dispatch(setModalType('Chart'));
      } else if (type === 'order') {
        dispatch(setModalType(undefined));
      }
    } else {
      dispatch(setModalType(undefined));
    }
  }, [type, dispatch]);

  const fetchMoreOrderNotes = () => {
    const { totalPages = 1, page: currentPage = 1 } = orderNotes.meta || {};
    if (currentPage < totalPages && !isFetchingOrderNotes) {
      handleUpdateOrderNotes({
        meta: { page: currentPage + 1, limit: 30 },
        append: true,
      });
    }
  };

  const fetchMorePatientNotes = () => {
    const { totalPages = 1, page: currentPage = 1 } = patientNotes.meta || {};
    if (currentPage < totalPages && !isFetchingPatientNotes) {
      handleUpdatePatientNotes({
        meta: { page: currentPage + 1, limit: 30 },
        append: true,
      });
    }
  };

  const allOrderNotesLoaded = (orderNotes.meta?.page || 1) >= (orderNotes.meta?.totalPages || 1);
  const allPatientNotesLoaded = (patientNotes.meta?.page || 1) >= (patientNotes.meta?.totalPages || 1);

  const renderNotesSection = (
    title: string,
    notes: PatientNoteWithCreatedBy[],
    selectedNotes: PatientNoteWithCreatedBy[],
    setSelectedNotes: (notes: PatientNoteWithCreatedBy[]) => void,
    onEdit: (note: PatientNoteWithCreatedBy) => void,
    onCheck: (note: PatientNoteWithCreatedBy) => void,
    onArchive: () => void,
    onDelete: () => void,
    onAdd: (e: React.MouseEvent) => void,
    onArchivedClick: () => void,
    isLoading: boolean,
    isDeleting: boolean,
    isFetching: boolean,
    fetchMore: () => void,
    allNotesLoaded: boolean,
    scrollId: string
  ) => {
    return (
      <div className='col-md-6 tw-flex tw-flex-col'>
        <div className='pt-2 tw-flex tw-flex-col'>
          <div className='tw-flex tw-justify-between tw-items-center mb-3'>
            <span className='fw-medium'>{title}</span>
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
                    onClick={onArchive}
                  >
                    Archive
                  </button>
                  <button
                    disabled={isDeleting}
                    className={'btn-no-style text-xs text-nowrap notes-btn ' + (isDeleting ? '' : 'text-danger')}
                    onClick={onDelete}
                  >
                    Remove
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={onAdd}
                    className='notes-btn btn-no-style text-nowrap text-primary d-flex align-items-center justify-content-center gap-1 text-xs'
                  >
                    <span>New Note</span>
                    <FaPlus size={12} className='flex-shrink-0' />
                  </button>
                  <button onClick={onArchivedClick} className='notes-btn btn-no-style text-primary text-xs text-nowrap'>
                    Archived
                  </button>
                </>
              )}
            </div>
          </div>
          <div id={scrollId} style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <InfiniteScroll
              dataLength={notes.length}
              next={fetchMore}
              hasMore={!allNotesLoaded}
              loader={
                isFetching && (
                  <div className='d-flex justify-content-center py-4'>
                    <Spinner size='sm' />
                  </div>
                )
              }
              scrollableTarget={scrollId}
            >
              <div className='d-flex flex-column gap-3 pe-3'>
                {notes && notes.length > 0 ? (
                  notes
                    .filter((note) => !note.isDeleted || note.isDeleted === undefined)
                    .map((note) => (
                      <div key={note.id} className='border-bottom pb-3'>
                        <div onClick={() => onEdit(note)} className='d-flex flex-column cursor-pointer gap-2'>
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
                              onChange={() => onCheck(note)}
                            />
                          </div>
                          <span className='tw-text-[#7E7E7E] tw-text-xs'>{note.description}</span>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className='d-flex align-items-center justify-content-center text-muted text-center py-4'>
                    No recent notes found!
                  </div>
                )}
              </div>
            </InfiniteScroll>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className='tw-space-y-4 col-12'>
      <div className='row g-4'>
        {renderNotesSection(
          'Order Notes',
          orderNotes.data,
          selectedOrderNotes,
          setSelectedOrderNotes,
          handleEditOrderNote,
          handleCheckOrderNote,
          handleArchiveOrderNotes,
          handleDeleteOrderNotes,
          handleAddOrderNoteClick,
          () => dispatch(setModal({ modalType: 'Archived Order Notes' })),
          isArchivingOrderNotes,
          isDeletingOrderNotes,
          isFetchingOrderNotes,
          fetchMoreOrderNotes,
          allOrderNotesLoaded,
          'order-notes-scroll'
        )}
        {renderNotesSection(
          'Chart Notes',
          patientNotes.data,
          selectedPatientNotes,
          setSelectedPatientNotes,
          handleEditPatientNote,
          handleCheckPatientNote,
          handleArchivePatientNotes,
          handleDeletePatientNotes,
          handleAddPatientNoteClick,
          () => {
            if (order.patient) {
              //eslint-disable-next-line @typescript-eslint/no-explicit-any
              dispatch(setPatient(order.patient as any));
            } else if (orderData?.patient) {
              //eslint-disable-next-line @typescript-eslint/no-explicit-any
              dispatch(setPatient(orderData.patient as any));
            }
            dispatch(setModal({ modalType: 'Archived Notes', type: 'Chart' }));
          },
          isArchivingOrderNotes,
          isDeletingOrderNotes,
          isFetchingPatientNotes,
          fetchMorePatientNotes,
          allPatientNotesLoaded,
          'patient-notes-scroll'
        )}
      </div>
    </div>
  );
}