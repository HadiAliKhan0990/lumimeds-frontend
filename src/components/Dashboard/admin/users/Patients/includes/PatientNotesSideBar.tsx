'use client';
import { PatientDetailGroup } from '@/components/Dashboard/PatientDetailGroup';
import { formatUSDateTime } from '@/helpers/dateFormatter';
import { Error, MetaPayload } from '@/lib/types';
import { PatientNoteWithCreatedBy, getCreatorName } from '@/lib/utils/noteUtils';
import { RootState } from '@/store';
import { ModalType, setModal, setModalType } from '@/store/slices/modalSlice';
import {
  useArchiveOrderNotesMutation,
  useDeleteOrderNotesMutation,
  useLazyGetOrderNotesQuery,
} from '@/store/slices/orderNotesApiSlice';
import { triggerNotesRefetch } from '@/store/slices/patientNotesSlice';
import { useArchivePatientNotesMutation, useDeletePatientNotesMutation } from '@/store/slices/patientsApiSlice';
import { SortState } from '@/store/slices/sortSlice';
import { isAxiosError } from 'axios';
import { useEffect, useRef, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { FaPlus } from 'react-icons/fa';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useDispatch, useSelector } from 'react-redux';

interface NotesState {
  data: PatientNoteWithCreatedBy[];
  meta: SortState['meta'];
}

export const PatientNotesSideBar = () => {
  //eslint-disable-next-line
  const activeTab = 'adminNotes';

  const dispatch = useDispatch();

  const order = useSelector((state: RootState) => state.order);
  const patientOrders = useSelector((state: RootState) => state.patientOrders.data || []);

  // Get reason data from patientOrders array if order data is not available
  const currentOrder = patientOrders.find((o) => o.id === order?.id);
  const orderReason = order?.reason || currentOrder?.reason || null;
  const reasonAddedBy = order?.reasonAddedBy || currentOrder?.reasonAddedBy || null;
  const reasonCreatedAt = order?.reasonCreatedAt || currentOrder?.reasonCreatedAt || null;

  const [orderNotes, setOrderNotes] = useState<NotesState>({
    data: [] as PatientNoteWithCreatedBy[],
    meta: { page: 1, limit: 30 },
  });

  const [refetchNotesCounter, setRefetchNotesCounter] = useState(0);

  const { data, meta } = orderNotes;

  const { totalPages = 1, page: currentPage = 1 } = meta || {};

  const modalType = useSelector((state: RootState) => state.modal.modalType);

  const prevModalTypeRef = useRef<ModalType['modalType']>(modalType);

  const [selectedAdminNotes, setSelectedAdminNotes] = useState<PatientNoteWithCreatedBy[]>([]);
  const [selectedOrderNotes, setSelectedOrderNotes] = useState<PatientNoteWithCreatedBy[]>([]);

  const [triggerGetOrderNotes, { isFetching }] = useLazyGetOrderNotesQuery();

  const [archivePatientNotes, { isLoading: isArchivingPatientNotes }] = useArchivePatientNotesMutation();

  const [deletePatientNotes, { isLoading: isDeletingPatientNotes }] = useDeletePatientNotesMutation();

  const [archiveOrderNotes, { isLoading }] = useArchiveOrderNotesMutation();

  const [deleteOrderNotes, { isLoading: isDeleting }] = useDeleteOrderNotesMutation();

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

  const handleCheckOrderNote = (note: PatientNoteWithCreatedBy) => {
    const isNoteExist = selectedOrderNotes.some((selectedNote) => selectedNote.id === note.id);
    if (isNoteExist) setSelectedOrderNotes(selectedOrderNotes.filter((selectedNote) => selectedNote.id !== note.id));
    else setSelectedOrderNotes([...selectedOrderNotes, note]);
  };

  const handleAddNoteClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    dispatch(setModal({ modalType: 'Add Order Note' }));
  };

  async function handleUpdateNotes({ meta, append = false }: MetaPayload) {
    if(!order.id) return;
    try {
      // Fetch order notes
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
          }),
        );
      } else {
        setOrderNotes({ data: newNotes || [], meta: orderRes?.meta });
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  }

  const handleArchiveOrderNotes = async () => {
    try {
      const ids = selectedOrderNotes.map((note) => note.id) as string[];

      const result = await archiveOrderNotes({ ids, isDeleted: true });
      if ('error' in result) {
        toast.error('Error archiving notes');
      } else {
        toast.success('Order Notes Archived Successfully!');
        setSelectedOrderNotes([]);
        // Update order notes state
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
        // If we deleted all notes, reset pagination
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
  const refetchNotes = () => {
    setRefetchNotesCounter((prev) => prev + 1);
  };

  const handleArchivePatientNotes = async () => {
    try {
      const ids = selectedAdminNotes
        .map((note) => note.id)
        .filter((id): id is string => typeof id === 'string' && id.length > 0);

      const { success, message } = await archivePatientNotes({ ids, isDeleted: true }).unwrap();

      setSelectedAdminNotes([]);

      if (success) {
        toast.success(message);

        refetchNotes();
        dispatch(triggerNotesRefetch());
      } else {
        toast.error(message || 'Patient Notes Archived Successfully!');
      }
    } catch (e) {
      toast.error(isAxiosError(e) ? e.response?.data.message : (e as Error).data.message || 'Error archiving notes!');
    }
  };

  const handleDeletePatientNotes = async () => {
    try {
      const ids = selectedAdminNotes
        .map((note) => note.id)
        .filter((id): id is string => typeof id === 'string' && id.length > 0);
      const { success, message } = await deletePatientNotes(ids).unwrap();
      setSelectedAdminNotes([]);
      if (success) {
        toast.success(message);
        refetchNotes();
        dispatch(triggerNotesRefetch());
      } else {
        toast.error(message || 'Patient Note(s) Deleted Successfully!');
      }
    } catch (error) {
      toast.error(
        isAxiosError(error)
          ? error.response?.data.message
          : (error as Error).data.message || 'Error deleting Patient Notes!',
      );
    }
  };

  const fetchMore = () => {
   
    if (currentPage < totalPages && !isFetching) {
      handleUpdateNotes({
        meta: { page: currentPage + 1, limit: 30 },
        append: true,
      });
    }
  };

  const allNotesLoaded = currentPage >= totalPages;

  const orderId = order?.id ?? '';

  const prevOrderIdRef = useRef<string>('');

  // Initial fetch when component mounts with orderId or when orderId changes
  useEffect(() => {
    if (orderId && orderId !== prevOrderIdRef.current) {
      prevOrderIdRef.current = orderId;
     
      handleUpdateNotes({ meta: { page: 1, limit: 30 } });
    }
  }, [orderId]);

  useEffect(() => {
    // const prev = prevModalTypeRef.current;
    // const wasNotesModal =
    //   prev === 'Add Order Note' ||
    //   prev === 'Edit Order Note' ||
    //   prev === 'Archived Order Notes' ||
    //   prev === 'Add Patient Note' ||
    //   prev === 'Edit Patient Note' ||
    //   prev === 'View Note Details';
    // if ((modalType === undefined && orderId && wasNotesModal) || activeTab === 'orderNotes') {
      handleUpdateNotes({ meta: { page: 1, limit: 30 } });
    // }
    prevModalTypeRef.current = modalType;
  }, [modalType, orderId, activeTab]);

  return (
    <div className='tw-flex tw-flex-col tw-gap-4 tw-overflow-y-auto'>
      <div className='tw-h-[245px]'>
        <PatientDetailGroup
        type="Patient"
          data={undefined}
          title='Notes'
          overrideTitle='Patient Notes'
          showDangerClass={false}
          isAdmin={true}
          fullWidth
          selectedNotes={selectedAdminNotes}
          onNotesSelectionChange={setSelectedAdminNotes}
          refetchNotesCounter={refetchNotesCounter}
          className='tw-overflow-y-auto'
          actionButton={
            <div className='d-flex align-items-center gap-3'>
              {selectedAdminNotes && selectedAdminNotes.length > 0 ? (
                <>
                  <button
                    className='btn-no-style text-xs text-primary text-nowrap notes-btn'
                    onClick={() => setSelectedAdminNotes([])}
                  >
                    Cancel
                  </button>
                  <button
                    disabled={isArchivingPatientNotes}
                    className={
                      'btn-no-style text-xs text-nowrap notes-btn ' + (isArchivingPatientNotes ? '' : 'text-primary')
                    }
                    onClick={handleArchivePatientNotes}
                  >
                    Archive
                  </button>
                  <button
                    disabled={isDeletingPatientNotes}
                    className={
                      'btn-no-style text-xs text-nowrap notes-btn ' + (isDeletingPatientNotes ? '' : 'text-danger')
                    }
                    onClick={handleDeletePatientNotes}
                  >
                    Remove
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      dispatch(
                        setModal({
                          modalType: 'Add Patient Note',
                        }),
                      );
                      dispatch(setModalType('Patient'));
                    }}
                    className='notes-btn btn-no-style text-nowrap text-primary d-flex align-items-center justify-content-center gap-1 text-xs'
                  >
                    <span>New Note</span>
                    <FaPlus size={12} className='flex-shrink-0' />
                  </button>
                  <button
                    onClick={() =>
                      dispatch(
                        setModal({
                          modalType: 'Archived Notes',
                        }),
                      )
                    }
                    className='notes-btn btn-no-style text-primary text-xs text-nowrap'
                  >
                    Archived
                  </button>
                </>
              )}
            </div>
          }
        />
      </div>

      <div className='tw-flex tw-flex-col tw-gap-4 tw-py-4 tw-px-2 tw-border tw-rounded-xl tw-border-light-gray tw-h-full tw-overflow-y-auto'>
        <div className='tw-flex tw-gap-2 tw-justify-between'>
          <span className='tw-font-semibold'>Order Notes</span>
          <div className='tw-flex tw-gap-2'>
            {selectedOrderNotes.length > 0 ? (
              <>
                <button
                  className='btn-no-style text-primary text-xs text-nowrap notes-btn'
                  onClick={() => setSelectedOrderNotes([])}
                >
                  Cancel
                </button>
                <button
                  disabled={isLoading}
                  className={'btn-no-style text-xs text-nowrap notes-btn ' + (isLoading ? '' : 'text-primary')}
                  onClick={handleArchiveOrderNotes}
                >
                  Archive
                </button>
                <button
                  disabled={isDeleting}
                  className={'btn-no-style text-xs text-nowrap notes-btn ' + (isDeleting ? '' : 'text-danger')}
                  onClick={handleDeleteOrderNotes}
                >
                  Remove
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleAddNoteClick}
                  className='notes-btn btn-no-style text-nowrap text-primary d-flex align-items-center justify-content-center gap-1 text-xs'
                >
                  <span>New Note</span>
                  <FaPlus size={12} className='flex-shrink-0' />
                </button>
                <button
                  onClick={() => dispatch(setModal({ modalType: 'Archived Order Notes' }))}
                  className=' notes-btn btn-no-style text-primary text-xs text-nowrap'
                >
                  Archived
                </button>
              </>
            )}
          </div>
        </div>
        <InfiniteScroll
          dataLength={data.length}
          next={fetchMore}
          hasMore={!allNotesLoaded}
          loader={
            isFetching && (
              <div className='d-flex justify-content-center py-4'>
                <Spinner size='sm' />
              </div>
            )
          }
          height={300}
        >
          <div className='d-flex flex-column gap-3 flex-grow-1 h-100 pe-3 '>
            {data && data.length > 0 && data.length !== 0 ? (
              data
                .filter((note) => !note.isDeleted || note.isDeleted === undefined)
                .map((note) => (
                  <div key={note.id} className='border-bottom pb-3'>
                    <div className='d-flex flex-column cursor-pointer gap-2'>
                      <div className='d-flex align-items-center justify-content-between'>
                        <span className='tw-text-xs tw-text-[#7E7E7E]'>
                          Created at {formatUSDateTime(note.createdAt)}
                          {getCreatorName(note) && <span> - by {getCreatorName(note)}</span>}
                        </span>
                        <input
                          onClick={(e) => e.stopPropagation()}
                          className='c_checkbox'
                          type='checkbox'
                          checked={selectedOrderNotes.some((selectedNote) => selectedNote.id === note.id)}
                          onChange={() => handleCheckOrderNote(note)}
                        />
                      </div>
                      <span className='tw-text-[#7E7E7E] tw-text-xs'>{note.description}</span>
                    </div>
                  </div>
                ))
            ) : (
              <div className='d-flex flex-grow-1 align-items-center justify-content-center text-muted text-center'>
                No recent notes found!
              </div>
            )}
          </div>
        </InfiniteScroll>
      </div>

      <div className='tw-flex tw-flex-col tw-gap-4 tw-p-3 tw-border tw-rounded-xl tw-border-light-gray tw-min-h-[150px]'>
        <div className='tw-flex tw-gap-2 tw-justify-between'>
          <span className='tw-font-semibold'>Remarks</span>
        </div>
        {orderReason ? (
          <div className='tw-flex tw-flex-col tw-gap-2'>
            <div className='tw-text-xs tw-text-[#7E7E7E] tw-flex tw-items-center tw-justify-between'>
              <span>
                {(() => {
                  const name = `${reasonAddedBy?.firstName || ''} ${reasonAddedBy?.lastName || ''}`.trim();
                  return `Added by ${name || reasonAddedBy?.email || 'Unknown'}`;
                })()}
              </span>
              {reasonCreatedAt && <span>{formatUSDateTime(reasonCreatedAt)}</span>}
            </div>
            <div className='tw-text-muted'>{orderReason}</div>
          </div>
        ) : (
          <div className='tw-text-muted'>No remarks found</div>
        )}
      </div>
    </div>
  );
};
