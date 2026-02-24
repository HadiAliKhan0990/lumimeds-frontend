'use client';

import { Modal, CircularProgress } from '@/components/elements';
import { useGetMyAssignedOrdersQuery, PendingEncounter } from '@/store/slices/ordersApiSlice';
import { useState, useMemo } from 'react';
import { Form } from 'react-bootstrap';
import { formatDateWithTime, getAppointmentTypeColor } from '@/lib/helper';
import { abbreviateLocationState } from '@/helpers/stateHelpers';
import { formatUSDateTime } from '@/helpers/dateFormatter';
import { transformApiResponseToUI } from '@/modules/protected/provider/appointments/AppointmentsData';
import { IPendingrxPatientListInfo } from '@/types/appointment';
import { PatientWithOrder } from '@/store/slices/patientsApiSlice';

interface OrderSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  onConfirm: (selectedOrderIds: string[]) => void;
  isLoading?: boolean;
}

export function OrderSelectionModal({
  isOpen,
  onClose,
  patientId,
  onConfirm,
  isLoading = false,
}: OrderSelectionModalProps) {
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());

  const { data, isFetching, isError } = useGetMyAssignedOrdersQuery(patientId);

  // Transform encounters to PendingEncounter format
  const encounters: PendingEncounter[] = useMemo(() => {
    if (!data?.encounters) return [];
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.encounters.map((encounter: any) => {
      // Calculate age from DOB
      let age = 0;
      if (encounter.patient?.dob) {
        const dob = new Date(encounter.patient.dob);
        const today = new Date();
        age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
          age--;
        }
      }

      return {
        id: encounter.id,
        patient: {
          id: encounter.patient?.id || '',
          firstName: encounter.patient?.firstName || '',
          lastName: encounter.patient?.lastName || '',
          age: age,
          gender: encounter.patient?.gender || '',
        },
        ordered: {
          products: [encounter.productType?.name || 'Unknown Product'],
          subscription: encounter.type || null,
        },
        state: `${encounter.address?.shippingAddress?.city || ''}, ${encounter.address?.shippingAddress?.state || ''}`,
        assignedAt: encounter.assignedAt || encounter.createdAt || '',
        rxStatus: encounter.status || '',
        isNew: false,
        isExpiring: false,
        type: encounter.type || null,
      };
    });
  }, [data?.encounters]);

  // Transform appointments to IPendingrxPatientListInfo format
  const appointments: IPendingrxPatientListInfo[] = useMemo(() => {
    if (!data?.appointments) return [];
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    const appointmentsAsPatientWithOrder: PatientWithOrder[] = data.appointments.map((apt: any) => ({
      patientId: apt.patientId || apt.patient?.id || '',
      firstName: apt.firstName || apt.patient?.firstName || '',
      lastName: apt.lastName || apt.patient?.lastName || '',
      dob: apt.dob || apt.patient?.dob || null,
      gender: apt.gender || apt.patient?.gender || '',
      address: apt.address || null,
      bio: apt.bio || apt.patient?.bio || null,
      orderId: apt.orderId || apt.id || '',
      product: apt.product || apt.productType?.name || 'Unknown Product',
      visitType: apt.visitType || 'video',
      status: apt.status || 'pending_confirmation',
      scheduledAt: apt.scheduledAt || null,
      type: apt.type || null,
      reason: apt.reason || null,
      meetingLink: apt.meetingLink || null,
      rescheduleLink: apt.rescheduleLink || null,
      declineLink: apt.declineLink || null,
      createdAt: apt.createdAt || null,
      dateReceived: apt.dateReceived || apt.createdAt || new Date().toISOString(),
    }));
    return transformApiResponseToUI({ appointments: appointmentsAsPatientWithOrder, todayCount: 0 });
  }, [data?.appointments]);

  // Combine all order IDs for selection
  const allOrderIds = useMemo(() => {
    const encounterIds = encounters.map((e) => e.id).filter(Boolean);
    const appointmentIds = appointments.map((a) => a.id).filter((id): id is string => typeof id === 'string' && !!id);
    return [...encounterIds, ...appointmentIds];
  }, [encounters, appointments]);

  const totalItems = encounters.length + appointments.length;

  const handleToggleOrder = (orderId: string) => {
    setSelectedOrderIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedOrderIds.size === totalItems) {
      setSelectedOrderIds(new Set());
    } else {
      setSelectedOrderIds(new Set(allOrderIds));
    }
  };

  const handleConfirm = () => {
    if (selectedOrderIds.size === 0) {
      return;
    }
    onConfirm(Array.from(selectedOrderIds));
  };

  const handleClose = () => {
    setSelectedOrderIds(new Set());
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title='Select Orders to Triage'
      size='lg'
      isLoading={isLoading}
      loadingText='Processing...'
      footer={
        <div className='tw-flex tw-gap-3 tw-justify-end tw-w-full'>
          <button
            type='button'
            className='btn btn-outline-secondary btn-sm'
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type='button'
            className='btn btn-primary btn-sm'
            onClick={handleConfirm}
            disabled={isLoading || selectedOrderIds.size === 0}
          >
            Continue ({selectedOrderIds.size})
          </button>
        </div>
      }
      showFooter={true}
    >
      <div className='tw-max-h-96 tw-overflow-y-auto'>
        {isFetching ? (
          <div className='tw-flex tw-justify-center tw-items-center tw-py-8'>
            <CircularProgress className='!tw-w-8 !tw-h-8' />
          </div>
        ) : isError || totalItems === 0 ? (
          <div className='tw-text-center tw-py-8 tw-text-gray-500'>
            {isError ? 'Failed to load orders' : 'No orders found for this patient'}
          </div>
        ) : (
          <>
            <div className='tw-flex tw-items-center tw-justify-between tw-mb-3 tw-pb-2 tw-border-b'>
              <Form.Check
                type='checkbox'
                label={`Select All (${totalItems})`}
                checked={selectedOrderIds.size === totalItems && totalItems > 0}
                onChange={handleSelectAll}
                className='tw-font-medium'
              />
            </div>

            {/* Pending Encounters Section */}
            {encounters.length > 0 && (
              <div className='tw-mb-4'>
                <div className='tw-font-semibold tw-text-sm tw-mb-2 tw-text-gray-700'>Pending Encounters</div>
                <div className='tw-space-y-2'>
                  {encounters.map((encounter) => {
                    const orderId = encounter.id;
                    if (!orderId) return null;

                    const { month, day, year } = formatDateWithTime(encounter.assignedAt) ?? {};

                    return (
                      <div
                        key={orderId}
                        className='tw-flex tw-items-start tw-gap-3 tw-p-3 tw-border tw-rounded tw-cursor-pointer hover:tw-bg-gray-50'
                        onClick={() => handleToggleOrder(orderId)}
                      >
                        <Form.Check
                          type='checkbox'
                          checked={selectedOrderIds.has(orderId)}
                          onChange={() => handleToggleOrder(orderId)}
                          onClick={(e) => e.stopPropagation()}
                          className='tw-flex-shrink-0 tw-mt-1'
                        />
                        <div className='tw-flex-1 tw-min-w-0'>
                          <div className='tw-flex tw-justify-between tw-items-start tw-gap-2'>
                            <div className='tw-flex-1'>
                              <div className='tw-font-medium tw-text-sm'>
                                {encounter.patient.firstName} {encounter.patient.lastName}
                              </div>
                              <div className='tw-text-xs tw-text-gray-500 tw-mt-1'>
                                {encounter.patient.age}Y, {encounter.patient.gender}
                              </div>
                              <div className='tw-text-xs tw-text-gray-600 tw-mt-1'>
                                {encounter.ordered.products.join(', ')}
                              </div>
                              {encounter.type && (
                                <div className='tw-mt-2 tw-inline-flex tw-items-center tw-gap-1 tw-px-2 tw-py-1 tw-rounded tw-bg-gray-100'>
                                  <span className='tw-text-xs'>{encounter.type}</span>
                                  <span
                                    style={{ backgroundColor: getAppointmentTypeColor(encounter.type) }}
                                    className='tw-w-2 tw-h-2 tw-rounded-full'
                                  />
                                </div>
                              )}
                            </div>
                            <div className='tw-text-right tw-text-xs tw-text-gray-500'>
                              <div>{abbreviateLocationState(encounter.state)}</div>
                              {month && day && year && (
                                <div className='tw-mt-1'>
                                  {month} {day}, {year}
                                </div>
                              )}
                              <div className={`tw-mt-1 tw-inline-block tw-px-2 tw-py-0.5 tw-rounded tw-text-xs custom-badge custom-badge-${encounter.rxStatus?.toLowerCase()}`}>
                                {encounter.rxStatus?.split('_')?.join(' ') || 'Unknown'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Appointments Section */}
            {appointments.length > 0 && (
              <div>
                <div className='tw-font-semibold tw-text-sm tw-mb-2 tw-text-gray-700'>Appointments</div>
                <div className='tw-space-y-2'>
                  {appointments.map((appointment) => {
                    const orderId = appointment.id;
                    if (!orderId) return null;

                    return (
                      <div
                        key={orderId}
                        className='tw-flex tw-items-start tw-gap-3 tw-p-3 tw-border tw-rounded tw-cursor-pointer hover:tw-bg-gray-50'
                        onClick={() => handleToggleOrder(String(orderId))}
                      >
                        <Form.Check
                          type='checkbox'
                          checked={selectedOrderIds.has(String(orderId))}
                          onChange={() => handleToggleOrder(String(orderId))}
                          onClick={(e) => e.stopPropagation()}
                          className='tw-flex-shrink-0 tw-mt-1'
                        />
                        <div className='tw-flex-1 tw-min-w-0'>
                          <div className='tw-flex tw-justify-between tw-items-start tw-gap-2'>
                            <div className='tw-flex-1'>
                              <div className='tw-font-medium tw-text-sm'>
                                {appointment.patientInfo.firstName} {appointment.patientInfo.lastName}
                              </div>
                              <div className='tw-text-xs tw-text-gray-500 tw-mt-1'>
                                {appointment.patientInfo.age}Y, {appointment.patientInfo.gender}
                              </div>
                              {appointment.patientInfo.weight && appointment.patientInfo.bmi && (
                                <div className='tw-flex tw-gap-1 tw-mt-1'>
                                  <span
                                    className='tw-rounded tw-px-2 tw-text-xs'
                                    style={{ background: '#FFF9EB', color: '#8F6734', border: 'solid 1px #FFE6B1' }}
                                  >
                                    {appointment.patientInfo.weight} lbs
                                  </span>
                                  <span
                                    className='tw-rounded tw-px-2 tw-text-xs'
                                    style={{ background: '#FFF9EB', color: '#8F6734', border: 'solid 1px #FFE6B1' }}
                                  >
                                    BMI {appointment.patientInfo.bmi}
                                  </span>
                                </div>
                              )}
                              <div className='tw-text-xs tw-text-gray-600 tw-mt-1'>
                                {appointment.orderInfo.drugName}
                              </div>
                              {appointment.orderInfo.orderType && (
                                <div className='tw-mt-2 tw-inline-flex tw-items-center tw-gap-1 tw-px-2 tw-py-1 tw-rounded tw-bg-gray-100'>
                                  <span className='tw-text-xs'>{appointment.orderInfo.orderType}</span>
                                  <span
                                    style={{
                                      backgroundColor: getAppointmentTypeColor(appointment.orderInfo.orderType),
                                    }}
                                    className='tw-w-2 tw-h-2 tw-rounded-full'
                                  />
                                </div>
                              )}
                            </div>
                            <div className='tw-text-right tw-text-xs tw-text-gray-500'>
                              <div>{appointment.patientInfo.state}</div>
                              {appointment.scheduledAt && (
                                <div className='tw-mt-1'>{formatUSDateTime(appointment.scheduledAt)}</div>
                              )}
                              <div
                                className={`tw-mt-1 tw-inline-block tw-px-2 tw-py-0.5 tw-rounded tw-text-xs custom-badge custom-badge-${appointment.rxStatus?.toLowerCase()}`}
                              >
                                {appointment.rxStatus === 'pending_confirmation'
                                  ? 'Pending'
                                  : appointment.rxStatus || 'Unknown'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
