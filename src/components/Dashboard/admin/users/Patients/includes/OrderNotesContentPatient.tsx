'use client';

import Image from 'next/image';
import InfiniteScroll from 'react-infinite-scroll-component';
import { PatientNote } from '@/store/slices/patientNoteSlice';
import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { ModalType, setModal, setModalType } from '@/store/slices/modalSlice';
import { useLazyGetOrderNotesQuery } from '@/store/slices/orderNotesApiSlice';
import { SortState } from '@/store/slices/sortSlice';
import { MetaPayload } from '@/lib/types';
import { Spinner } from 'react-bootstrap';
import { useLazyGetPatientNotesQuery } from '@/store/slices/patientsApiSlice';
import { formatUSDate } from '@/helpers/dateFormatter';

// Extended interface to include createdByInfo from API response
interface PatientNoteWithCreatedBy extends PatientNote {
  createdByInfo?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

interface NotesState {
  data: PatientNoteWithCreatedBy[];
  meta: SortState['meta'];
}

export interface OrderNotesContentPatientProps extends React.ComponentPropsWithoutRef<'div'> {
  type?: 'patient' | 'order';
  disabled?: boolean;
}

export function OrderNotesContentPatient({
  type = 'order',
  disabled = false,
  ...props
}: OrderNotesContentPatientProps) {
  const dispatch = useDispatch();

  const [localNotes, setLocalNotes] = useState<NotesState>({
    data: [] as PatientNote[],
    meta: { page: 1, limit: 30 },
  });
  const [hasInitialized, setHasInitialized] = useState(false);

  // Use local state instead of Redux for notes display
  const { data, meta } = localNotes;
  const { totalPages = 1, page: currentPage = 1 } = meta || {};

  const order = useSelector((state: RootState) => state.order);
  const patient = useSelector((state: RootState) => state.patient);
  const modalType = useSelector((state: RootState) => state.modal.modalType);

  const [triggerGetOrderNotes, { isFetching: isFetchingOrderNotes }] = useLazyGetOrderNotesQuery();

  const [triggerGetPatientNotes, { isFetching: isFetchingPatientNotes }] = useLazyGetPatientNotesQuery();

  const isFetching = type === 'order' ? isFetchingOrderNotes : isFetchingPatientNotes;

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
      const apiFetchHandler = () => {
        if (type === 'order') {
          return triggerGetOrderNotes({
            orderId: order.id || '',
            page: meta?.page,
            limit: 30,
            sortBy: 'DESC',
            sortField: 'createdAt',
          });
        }

        return triggerGetPatientNotes({
          id: order?.patient?.id || patient?.id || '',
          page: meta?.page,
          limit: 30,
          type: 'Chart',
        });
      };

      const { data: res } = await apiFetchHandler();

      if (append) {
        setLocalNotes((prev) => appendNotesDataLocally(prev, { data: res?.notes || [], meta: res?.meta }));
      } else setLocalNotes({ data: res?.notes || [], meta: res?.meta });
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  }

  const handleAddOrderNoteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(setModal({ modalType: type === 'order' ? 'Add Order Note' : 'Add Patient Note' }));

    dispatch(setModalType('Chart'));
  };

  const relevantId = type === 'patient' ? (order?.patient?.id || patient?.id) : order.id;



  useEffect(() => {
    setHasInitialized(false);
    setLocalNotes({
      data: [],
      meta: { page: 1, limit: 30 },
    });
  }, [relevantId]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    const configsManage = () => {
      if (relevantId && !hasInitialized) {
        handleUpdateOrderNotes({ meta: { page: meta?.page || 1, limit: 30 } });
        setHasInitialized(true);
      }
    };

    timer = setTimeout(configsManage, 1000);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [relevantId, hasInitialized]);

  // Refetch notes when relevant modal closes (add/edit/archive/unarchive)
  const prevModalTypeRef = useRef<ModalType['modalType']>(modalType);
  useEffect(() => {
    const prev = prevModalTypeRef.current;
    const wasNotesModal =
      prev === 'Add Order Note' ||
      prev === 'Edit Order Note' ||
      prev === 'Archived Order Notes' ||
      prev === 'Add Patient Note' ||
      prev === 'Edit Patient Note';
    if (modalType === undefined && order.id && wasNotesModal) {
      handleUpdateOrderNotes({ meta: { page: 1, limit: 30 } });
    }
    prevModalTypeRef.current = modalType;
  }, [modalType, order.id]);

  const fetchMore = () => {
    if (currentPage < totalPages && !isFetching) {
      handleUpdateOrderNotes({
        meta: { page: currentPage + 1, limit: 30 },
        append: true,
      });
    }
  };

  const allNotesLoaded = currentPage >= totalPages;

  return (
    <div className='tw-space-y-4 col-12' {...props}>
      <div className='tw-flex tw-flex-col'>
        <div className='tw-flex tw-justify-between tw-items-center'>
          <span className='fw-medium'>{type === 'order' ? 'Order Notes' : 'Chart Notes'}</span>
          <div className='d-flex align-items-center gap-3'>
            <button
              type='button'
              onClick={handleAddOrderNoteClick}
              className='btn-no-style text-primary'
              disabled={disabled}
              style={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
            >
              Add Chart Note
            </button>
          </div>
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
        <div className='d-flex flex-column gap-3 flex-grow-1 h-100 pe-3'>
          {data && data.length > 0 && data.length !== 0 ? (
            data
              .filter((note) => !note.isDeleted || note.isDeleted === undefined)
              .map((note) => (
                <div key={note.id} className='tw-bg-[#F0FDF4] rounded-3 p-3 border-0'>
                  <div className='cursor-pointer'>
                    {/* Top Row: Note Content + Date */}
                    <div className='tw-flex tw-justify-between tw-items-start tw-mb-2 tw-gap-2'>
                      <p className='tw-text-[#3F434B] tw-text-sm tw-truncate tw-max-w-[263px] mb-1 sm:mb-2'>
                        {note.description}
                      </p>
                      <span className='tw-flex-shrink-0  tw-text-sm tw-text-muted'>{formatUSDate(note.createdAt)}</span>
                    </div>

                    {/* Bottom Row: Author Info + View Button */}
                    <div className='d-flex justify-content-between align-items-center'>
                      <div className='d-flex align-items-center gap-2'>
                        <Image src='/assets/svg/document-normal.svg' alt='Document' width={12} height={12} />
                        <span className='tw-text-[#2E2E2E] text-sm'>
                          Added by {(() => {
                            const name = `${note.createdByInfo?.firstName || ''} ${note.createdByInfo?.lastName || ''}`.trim();
                            return name || note.createdByInfo?.email || 'Unknown';
                          })()}
                        </span>
                      </div>
                      <button
                        type='button'
                        className='tw-text-[#008236] p-0 bg-transparent'
                        style={{ fontSize: '12px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(
                            setModal({
                              modalType: 'View Note Details',
                              ctx: { note },
                            })
                          );
                        }}
                      >
                        View
                      </button>
                    </div>
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
  );
}
