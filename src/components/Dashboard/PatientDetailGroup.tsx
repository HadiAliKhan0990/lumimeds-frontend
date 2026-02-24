import { useWindowWidth } from '@/hooks/useWindowWidth';
import { formatUSPhoneWithoutPlusOne } from '@/lib/helper';
import { SinglePatient } from '@/lib/types';
import { PatientNoteWithCreatedBy, getCreatorName } from '@/lib/utils/noteUtils';
import { RootState } from '@/store';
import { setModal, setModalType } from '@/store/slices/modalSlice';
import { PatientNote, setPatientNote } from '@/store/slices/patientNoteSlice';
import { useLazyGetPatientNotesQuery } from '@/store/slices/patientsApiSlice';
import { Fragment, ReactNode, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { formatUSDateTime } from '@/helpers/dateFormatter';

export type PatientDetails =
  | 'General'
  | 'Remarks'
  | 'Latest Treatment'
  | 'Billing'
  | 'Medical History'
  | 'Body Metrics'
  | 'Tracking and Shipping'
  | 'Contact Details'
  | 'Address'
  | 'Coupon Affiliate'
  | 'Notes'
  |  'Notes'
  | 'Attachments';

interface Item {
  key?: string | undefined | null;
  value?: string | number | undefined | null;
  element?: ReactNode | undefined | null;
  direction?: 'row' | 'column';
  className?: string;
}

interface PatientDetailGroupProps {
  title: PatientDetails;
  actionButton?: ReactNode;
  data?: SinglePatient;
  fullWidth?: boolean;
  className?: string;
  onNotesSelectionChange?: (selectedNotes: PatientNote[]) => void;
  selectedNotes?: PatientNote[];
  children?: ReactNode;
  customContent?: ReactNode;
  showEmailClass?: boolean;
  showDangerClass?: boolean;
  isAdmin?: boolean;
  refetchNotesCounter?: number;
  hideNotesCheckBox?: boolean;
  overrideTitle?: string;
  type?: 'Chart' | 'Patient';
}

export const PatientDetailGroup = ({
  title,
  actionButton,
  data,
  fullWidth,
  className,
  onNotesSelectionChange,
  selectedNotes: externalSelectedNotes,
  children,
  customContent,
  showEmailClass = true,
  showDangerClass = true,
  isAdmin = false,
  refetchNotesCounter,
  hideNotesCheckBox = false,
  overrideTitle,
  type='Chart'
}: PatientDetailGroupProps) => {
  const dispatch = useDispatch();
  const { windowWidth } = useWindowWidth();

  const patient = useSelector((state: RootState) => state.patient);
  const modalType = useSelector((state: RootState) => state.modal.modalType);
  const notesRefetchTrigger = useSelector((state: RootState) => state.patientNotes.refetchTrigger);

  const [triggerGetPatientNotes, { data: notesData, isFetching: isFetchingNotes }] = useLazyGetPatientNotesQuery();
  const [internalSelectedNotes, setInternalSelectedNotes] = useState<PatientNote[]>([]);
  const [showAllNotes, setShowAllNotes] = useState(false);

  // Use external selectedNotes if provided, otherwise use internal state
  const selectedNotes = externalSelectedNotes || internalSelectedNotes;
  const setSelectedNotes = externalSelectedNotes
    ? (notes: PatientNote[]) => onNotesSelectionChange?.(notes)
    : setInternalSelectedNotes;

  useEffect(() => {
    if (title === 'Notes' && patient.id) {
      triggerGetPatientNotes({ id: patient.id, page: 1, isDeleted: false, type: type });
    }
  }, [title, patient.id, triggerGetPatientNotes, refetchNotesCounter]);

  useEffect(() => {
    if (title === 'Notes' && patient.id && modalType === undefined) {
      triggerGetPatientNotes({ id: patient.id, page: 1, isDeleted: false, type: type });
    }
  }, [title, patient.id, modalType, triggerGetPatientNotes]);

  useEffect(() => {
    if (title === 'Notes' && patient.id && notesRefetchTrigger) {
      triggerGetPatientNotes({ id: patient.id, page: 1, isDeleted: false, type: type });
    }
  }, [title, patient.id, notesRefetchTrigger, triggerGetPatientNotes]);

  const handleCheck = (note: PatientNote) => {
    const isNoteExist = selectedNotes.some((selectedNote) => selectedNote.id === note.id);
    if (isNoteExist) {
      const newSelectedNotes = selectedNotes.filter((selectedNote) => selectedNote.id !== note.id);
      setSelectedNotes(newSelectedNotes);
    } else {
      const newSelectedNotes = [...selectedNotes, note];
      setSelectedNotes(newSelectedNotes);
    }
  };

  function formatDOB(dateString: string | null): string {
    if (!dateString) return '-';

    const dateMatch = dateString.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (dateMatch) {
      const [, year, month, day] = dateMatch;
      return `${month}-${day}-${year}`;
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if invalid

    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const year = String(date.getUTCFullYear());

    return `${month}-${day}-${year}`; // Format: MM-DD-YYYY
  }

  const handleEditNote = (note: PatientNote) => {
    dispatch(setPatientNote(note));
    dispatch(setModal({ modalType: 'Edit Patient Note' }));
    if (title === 'Notes') {
      dispatch(setModalType('Chart'));
    }
  };

  const items = useMemo<Item[] | undefined>(() => {
    switch (title) {
      case 'General':
        if (isAdmin) {
          // Admin side - show all fields
          return [
            {
              key: 'First Name',
              value: data?.general?.firstName,
              direction: windowWidth > 576 ? 'column' : 'row',
            },
            {
              key: 'Last Name',
              value: data?.general?.lastName,
              direction: windowWidth > 576 ? 'column' : 'row',
            },
            {
              key: 'Gender',
              value: data?.general?.gender,
              direction: windowWidth > 576 ? 'column' : 'row',
            },
            {
              key: 'Age',
              value: data?.general?.age,
              direction: windowWidth > 576 ? 'column' : 'row',
            },
            {
              key: 'Obesity',
              element: (
                <div className='d-flex align-items-start justify-content-between gap-3'>
                  <span className={`${isAdmin ? 'text-xs' : 'text-sm'} fw-medium`}>{data?.general?.diagnosis}</span>
                  {/* <button className="btn-no-style text-danger">
										<RiDeleteBin5Line />
									</button> */}
                </div>
              ),
              direction: windowWidth > 576 ? 'column' : 'row',
            },
            {
              key: 'State',
              value: data?.address?.shippingAddress?.state || patient.address?.shippingAddress?.state || '-',
              direction: windowWidth > 576 ? 'column' : 'row',
            },
            {
              key: 'Req. Treatment',
              element: (
                <div className='d-flex align-items-start justify-content-between'>
                  <span className={`${isAdmin ? 'text-xs' : 'text-sm'} fw-medium`}>
                    {data?.general?.requiredTreatment}
                  </span>
                  {/* <button className='text-primary p-0 border-0 bg-transparent'>See More</button> */}
                </div>
              ),
              direction: windowWidth > 576 ? 'column' : 'row',
            },
            {
              key: 'Date of Birth',
              value: (data?.general?.dob ?? patient.dob) ? formatDOB(data?.general?.dob ?? patient.dob ?? null) : '-',
              direction: windowWidth > 576 ? 'column' : 'row',
            },
          ];
        } else {
          // Provider side - show only Diagnosis and Req. Treatment
          return [
            {
              key: 'Obesity',
              element: (
                <div className='d-flex align-items-start justify-content-between gap-3'>
                  <span
                    className={`${isAdmin ? 'text-xs' : 'text-sm'} fw-medium ${showDangerClass ? 'text-danger' : ''}`}
                  >
                    {data?.general?.diagnosis}
                  </span>
                </div>
              ),
              direction: windowWidth > 576 ? 'column' : 'row',
            },
            {
              key: 'Req. Treatment',
              element: (
                <div className='d-flex align-items-start justify-content-between'>
                  <span className={`${isAdmin ? 'text-xs' : 'text-sm'} fw-medium`}>
                    {data?.general?.requiredTreatment}
                  </span>
                </div>
              ),
              direction: windowWidth > 576 ? 'column' : 'row',
            },
          ];
        }
      case 'Address':
        return [
          {
            key: 'Address Line 1',
            element: (
              <div className={`${isAdmin ? 'text-xs' : 'text-sm'}`}>
                {data?.address?.shippingAddress?.street || '-'}
                {/* {data?.address?.shippingAddress?.street2 && (
                  <>
                    <br />
                    {data.address.shippingAddress?.street2}
                  </>
                )} */}
              </div>
            ),
          },
          {
            key: 'Address Line 2',
            value: data?.address?.shippingAddress?.street2 || '-',
          },
          {
            key: 'City',
            value: data?.address?.shippingAddress?.city || '-',
          },
          {
            key: 'State',
            value: data?.address?.shippingAddress?.state || '-',
          },
          {
            key: 'Zip Code',
            value: data?.address?.shippingAddress?.zip || '-',
          },
        ];
      case 'Contact Details':
        return [
          {
            key: 'Address',
            value: data?.address?.shippingAddress
              ? `${data.address.shippingAddress.street}${
                  data.address.shippingAddress.street2 ? ', ' + data.address.shippingAddress.street2 : ''
                }, ${data.address.shippingAddress.city}, ${data.address.shippingAddress.state} ${
                  data.address.shippingAddress.zip
                }`
              : '-',
          },
          {
            key: 'Email',
            value: data?.contact?.email,
            className: showEmailClass ? 'text-email' : '',
          },
          {
            key: 'Mobile Number',
            value: formatUSPhoneWithoutPlusOne(data?.contact?.phone ?? ''),
          },
        ];
      case 'Body Metrics':
        return [
          {
            key: 'Height',
            value: `${data?.bio?.height || '0in'}`,
            className: 'text-normal',
          },
          {
            key: 'Weight',
            value: data?.bio?.weight ? `${data?.bio?.weight}lbs` : '-',
          },
          {
            key: 'BMI',
            value: data?.bio?.bmi || 0,
            className: showDangerClass ? 'text-danger' : '',
          },
        ];
      case 'Medical History':
        return [
          {
            key: 'Allergies',
            // element: (
            //   <div className='d-flex align-items-center gap-2 flex-wrap'>
            //     {data?.medicalHistory && data?.medicalHistory.allergies.length > 0
            //       ? data?.medicalHistory?.allergies
            //           .split(',')
            //           .filter((allergy) => allergy.trim() !== '')
            //           .map((pill) => (
            //             <span key={pill} className='border text-xs px-2 py-1 rounded-pill'>
            //               {pill}
            //             </span>
            //           ))
            //       : '-'}
            //   </div>
            // ),
            // direction: 'row',
            value: data?.medicalHistory?.allergies || '-',
          },
          {
            key: 'Medications',
            value: data?.medicalHistory?.medications || '-',
          },
          {
            key: 'Conditions',
            value: data?.medicalHistory?.conditions
              ? data.medicalHistory.conditions
                  .split(',')
                  .map((condition) => `(${condition.trim()})`)
                  .join(', ')
              : '-',
            className: showDangerClass ? 'text-danger' : '',
          },
          {
            key: 'Reaction To',
            value:
              data?.medicalHistory?.reactionTo && data.medicalHistory.reactionTo.length > 0
                ? data.medicalHistory.reactionTo.join(', ')
                : '-',
          },
        ];

      case 'Latest Treatment':
        return [
          {
            key: 'Prescription',
            value: '-',
          },
          {
            key: 'Directions',
            value: '-',
          },
          {
            key: 'Notes',
            value: '-',
          },
        ];
      case 'Notes':
        const filteredNotes = (notesData?.notes?.filter((note) => !note.isDeleted) || []) as PatientNoteWithCreatedBy[];
        const displayedNotes = showAllNotes ? filteredNotes : filteredNotes.slice(0, 5);
        const hasMoreNotes = filteredNotes.length > 5;

        return [
          {
            element: (
              <div className={`${isAdmin ? 'text-xs' : 'text-sm'}`}>
                {isFetchingNotes ? (
                  <div className='text-muted'>Loading notes...</div>
                ) : filteredNotes.length > 0 ? (
                  <div className='d-flex flex-column gap-2 tw-max-h-[200px] tw-overflow-y-auto tw-pr-4'>
                    {displayedNotes.map((note, index) => (
                      <div
                        key={note.id || index}
                        className='d-flex align-items-start gap-3'
                        style={{
                          animation: index >= 5 && showAllNotes ? 'fadeInSlide 0.3s ease-out forwards' : 'none',
                          animationDelay: index >= 5 && showAllNotes ? `${(index - 5) * 0.05}s` : '0s',
                          opacity: index >= 5 && showAllNotes ? 0 : 1,
                        }}
                      >
                        <div className='flex-grow-1'>
                        <div className='d-flex align-items-center justify-content-between text-muted text-xs mt-1 mb-1'>
                            <span>
                              {getCreatorName(note) ? `Added by ${getCreatorName(note)}` : ''}
                            </span>
                            {note.createdAt && <span>{formatUSDateTime(note.createdAt)}</span>}
                          </div>
                          <div className='d-flex align-items-start justify-content-between mb-1'>
                            <div className='fw-medium cursor-pointer' onClick={() => handleEditNote(note)}>
                              <div className='text-muted'>{note.description || 'No description'}</div>
                            </div>
                            {!hideNotesCheckBox && (
                              <input
                                className='c_checkbox flex-shrink-0'
                                type='checkbox'
                                checked={selectedNotes.some((selectedNote) => selectedNote.id === note.id)}
                                onChange={() => {
                                  handleCheck(note);
                                }}
                              />
                            )}
                          </div>
                          {/* Created by info and date */}
                       
                        </div>
                      </div>
                    ))}
                    {hasMoreNotes && (
                      <div
                        className={`text-primary text-xs mt-2 cursor-pointer ${
                          isAdmin ? 'text-xs' : 'text-sm'
                        } bouncing-effect tw-w-fit`}
                        onClick={() => setShowAllNotes(!showAllNotes)}
                        style={{ cursor: 'pointer' }}
                      >
                        <span>{showAllNotes ? 'Show fewer notes' : `+${filteredNotes.length - 5} more notes`}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className='text-muted'>No notes available</div>
                )}
              </div>
            ),
            direction: 'column',
          },
        ];
      case 'Attachments':
        return [
          {
            element: children,
            direction: 'column',
          },
        ];
    }
  }, [patient, data, notesData, isFetchingNotes, selectedNotes, children, showAllNotes]);

  return (
    <div className={'rounded-12 p-12 border border-c-light h-100 ' + className}>
      <div className='mb-4 d-flex align-items-center gap-2 justify-content-between'>
        <span className='fw-medium'>{overrideTitle || (title === 'Notes' ? 'Chart Notes' : title)}</span>
        {actionButton && actionButton}
      </div>
      <div className='row gy-2'>
        {customContent
          ? customContent
          : items &&
            items.map((item, index) => {
              if (item.element && !item.key) {
                return <Fragment key={index}>{item.element}</Fragment>;
              }
              // For General section, force full width for both Obesity and Req. Treatment
              const isGeneralSection = title === 'General';
              const isDiagnosisOrTreatment = item.key === 'Obesity' || item.key === 'Req. Treatment';
              const columnClass =
                isGeneralSection && isDiagnosisOrTreatment ? 'col-12' : fullWidth ? 'col-12' : 'col-sm-6';

              return (
                <div key={index} className={columnClass}>
                  <div
                    className={(item.direction === 'column' ? 'flex-column' : 'flex-row') + ' row gy-2 '}
                    key={index}
                  >
                    <span
                      className={
                        'text-placeholder fw-medium text-xs ' +
                        (item.direction === 'column' ? 'col-12' : windowWidth > 576 ? 'col-4' : 'col-5')
                      }
                    >
                      {item.key}
                    </span>
                    {item.key && item.element ? (
                      <div
                        className={
                          (item.direction === 'column' ? 'col-12' : windowWidth > 576 ? 'col-8' : 'col-7') +
                          ' fw-medium' +
                          `text-placeholder fw-medium ${isAdmin ? 'text-xs' : 'text-sm'} ` +
                          (item?.value?.toString()?.includes('@') ? '' : 'text-capitalize')
                        }
                      >
                        {item.element}
                      </div>
                    ) : (
                      <div
                        className={
                          (item.direction === 'column' ? 'col-12' : windowWidth > 576 ? 'col-8' : 'col-7') +
                          ' fw-medium' +
                          ` ${isAdmin ? 'text-xs' : 'text-sm'} ` +
                          (item?.value?.toString()?.includes('@') ? '' : 'text-capitalize') +
                          ' ' +
                          item?.className
                        }
                      >
                        {item.value && item.value}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
};
