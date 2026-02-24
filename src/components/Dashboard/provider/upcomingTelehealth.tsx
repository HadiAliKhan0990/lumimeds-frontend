'use client';

import { useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { removeAppointment } from '@/store/slices/providerSlice';
import ConfirmationModal from '@/components/ConfirmationModal';
import { useRevertOrdersToAdminMutation } from '@/store/slices/ordersApiSlice';
import { toast } from 'react-hot-toast';
import {
  calculateAge,
  getTimeRemaining,
  formatAppointmentDate,
  formatAppointmentTime,
} from '@/lib/utils/dashboardUtils';
import { ProviderDashboardStats } from '@/lib/types/providerDashboard';
import calendarIcon from '@/assets/doctor-portal/calendar.svg';
import clockIcon from '@/assets/doctor-portal/clock.svg';
import { ROUTES } from '@/constants';
import { useWindowWidth } from '@/hooks/useWindowWidth';
import { getAppointmentTypeColor } from '@/lib/helper';
import { isAxiosError } from 'axios';
import { Error } from '@/lib/types';

interface AppointmentCardProps {
  appointment: {
    rescheduleUrl?: string;
    consultationId: string;
    orderId: string;
    startTime: string;
    endTime: string;
    status?: string;
    patient: {
      id: string;
      firstName: string;
      lastName?: string;
      dob: string;
      gender: string;
    };
    rescheduleLink?: string;
    type?: string;
    orderType?: string;
  };
  onReschedule: (id: string, link?: string) => void;
  onTriage: (id: string) => void;
  onViewChart: (id: string) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, onTriage }) => {
  const patientAge = appointment.patient.dob ? calculateAge(appointment.patient.dob) : 0;
  const timeRemaining = getTimeRemaining(appointment.startTime);
  const formattedDate = formatAppointmentDate(appointment.startTime);
  const formattedTime = formatAppointmentTime(appointment.startTime);

  return (
    <div className='rounded py-3'>
      <div className='tw-flex tw-items-start  tw-gap-x-10'>
        {/* Left Section - Date and Time */}
        <div className='tw-flex-shrink-0 d-flex flex-column gap-1'>
          <div className='d-flex align-items-center gap-1'>
            <Image src={calendarIcon} alt='Calendar' width={16} height={16} />
            <span className='text-muted small'>{formattedDate}</span>
          </div>
          <div className='d-flex align-items-center gap-1'>
            <Image src={clockIcon} alt='Clock' width={16} height={16} />
            <span className='text-muted small'>{formattedTime}</span>
          </div>
          <div className='d-flex align-items-center gap-1'>
            <span className='text-muted small'>{timeRemaining}</span>
          </div>
        </div>

        {/* Middle Section - Patient Details and Appointment Type */}
        <div className='tw-flex tw-flex-col sm:tw-flex-row lg:flex-col xl:tw-flex-row tw-items-start tw-gap-2 tw-flex-grow tw-flex-wrap tw-justify-between'>
          <div className='tw-flex tw-items-baseline tw-gap-x-2'>
            <div className='d-flex flex-column gap-2'>
              <span className='fw-medium text-dark-gray small'>
                {appointment.patient.firstName} {appointment.patient.lastName} – {patientAge}Y,{' '}
                {appointment?.patient?.gender
                  ? appointment?.patient?.gender?.charAt(0)?.toUpperCase() + appointment?.patient?.gender?.slice(1)
                  : ''}
              </span>
              <div>
                {appointment.status && (
                  <span
                    className={`custom-badge custom-badge-${appointment.status.toLowerCase().replace(/\s+/g, '_')}`}
                  >
                    {appointment.status}
                  </span>
                )}
              </div>

              {/* <div className='mt-2'>
                <Button
                  variant='outline-secondary'
                  size='sm'
                  className='py-1 px-2 border-gray-medium font-inter fw-medium text-xs'
                  onClick={() => onViewChart(appointment.consultationId)}
                >
                  View Patient Chart
                </Button>
              </div> */}
            </div>

            {appointment?.type || appointment?.orderType ? (
              <div className='custom-badge custom-badge-sm custom-badge-gray-neutral'>
                <span>{appointment.type || appointment.orderType}</span>
                <span
                  style={{
                    backgroundColor: getAppointmentTypeColor(
                      (appointment.type || appointment.orderType) ?? 'Subscription'
                    ),
                  }}
                  className='tw-ml-2 tw-w-2 tw-h-2 tw-rounded-full'
                ></span>
              </div>
            ) : null}
          </div>
          <div className='tw-flex  sm:tw-flex-col tw-gap-2 sm:tw-gap-2'>
            <Button
              variant='link'
              className='text-primary p-0 text-decoration-none border-0 fw-medium'
              style={{ fontSize: '13px', textAlign: 'right' }}
              onClick={() => window.open(appointment?.rescheduleUrl, '_blank')}
            >
              Reschedule
            </Button>
            <Button
              variant='link'
              className='text-primary p-0 text-decoration-none border-0 fw-medium'
              style={{ fontSize: '13px', textAlign: 'right' }}
              onClick={() => onTriage(appointment.orderId)}
            >
              Triage
            </Button>
          </div>
        </div>

        {/* Right Section - Action Buttons */}
      </div>

      {/* View Patient Chart Button - Below if exists */}
      {/* {appointment.hasPatientChart && (
          <div className='mt-2'>
            <Button
              variant='outline-secondary'
              size='sm'
              className='py-1 px-2'
              style={{ fontSize: '10px' }}
              onClick={() => onViewChart(appointment.consultationId)}
            >
              View Patient Chart
            </Button>
          </div>
        )} */}
    </div>
  );
};

interface UpcomingTelehealthProps {
  dashboardStats: ProviderDashboardStats | undefined;
}

const UpcomingTelehealth: React.FC<UpcomingTelehealthProps> = ({ dashboardStats }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [showTriageModal, setShowTriageModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>('');
  const [revertOrders, { isLoading: isRevertingOrders }] = useRevertOrdersToAdminMutation();

  // Get real-time stats from Redux
  const realTimeStats = useSelector((state: RootState) => state.provider.dashboardStats);

  // Use real-time data if available, fallback to props
  const stats = realTimeStats || dashboardStats;

  const { windowWidth } = useWindowWidth();

  const isLargeScreen = windowWidth >= 992;

  // Event handlers
  const handleReschedule = (id: string, link?: string) => {
    console.log('Reschedule appointment:', id);
    if (link) {
      // Redirect to the meeting link from existing data
      window.open(link, '_blank');
    } else {
      console.error('No reschedule link available');
    }
  };

  const handleTriage = (id: string) => {
    setSelectedAppointmentId(id);
    setShowTriageModal(true);
  };

  const handleCloseModal = () => {
    setShowTriageModal(false);
    setNotes('');
    setSelectedAppointmentId('');
  };

  const handleConfirmTriage = async () => {
    try {
      const result = await revertOrders({
        orderIds: [selectedAppointmentId],
        notes,
      }).unwrap();

      // Access the response data with proper typing
      const responseData = (result as { data?: { message?: string; revertedOrders?: number } })?.data;
      const apiMessage =
        responseData?.message || (result as { message?: string })?.message || 'Appointment processed successfully';

      // Show the API message in toast and close modal
      if (responseData?.revertedOrders && responseData.revertedOrders > 0) {
        toast.success(apiMessage);

        const appointmentToRemove = appointments.find((apt) => apt.orderId === selectedAppointmentId);
        if (appointmentToRemove) {
          dispatch(removeAppointment(appointmentToRemove.consultationId));
        }
      } else {
        toast(apiMessage);
      }

      // Clear selections and close modal
      setShowTriageModal(false);
      setNotes('');
      setSelectedAppointmentId('');
    } catch (error) {
      toast.error(
        isAxiosError(error)
          ? error.response?.data?.message
          : (error as Error).data.message || 'Failed to triage appointment to admin'
      );
    }
  };

  const handleViewChart = (id: string) => {
    console.log('View patient chart:', id);
    // TODO: Implement view chart logic
  };

  const handleStartTelehealth = () => {
    console.log('Start telehealth appointment');
    // Navigate to appointments route
    router.push(ROUTES.PROVIDER_APPOINTMENTS);
  };

  const appointments = stats?.telehealthUpcomingAppointments ?? [];
  const newAppointmentsCount = appointments.length;

  return (
    <>
      <ConfirmationModal
        show={showTriageModal}
        onHide={handleCloseModal}
        onConfirm={handleConfirmTriage}
        loading={isRevertingOrders}
        title='Triage Appointment'
        message={
          <div className='form-group'>
            <label htmlFor='notes' className='form-label text-start w-100'>
              Notes <span className='text-danger'>*</span>
            </label>
            <textarea
              id='notes'
              className='form-control text-start'
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder='Enter triage notes here...'
              required
            />
          </div>
        }
        confirmLabel='Yes, Triage'
        cancelLabel='Cancel'
      />
      <Card className={`${isLargeScreen ? 'max-w-half' : ''} flex-grow-1 border border-primary-light rounded-12`}>
        <Card.Body className='p-3 p-lg-4 d-flex flex-column' style={{ minHeight: '16.5rem' }}>
          {/* Header */}
          <div className='d-flex justify-content-between align-items-center'>
            <div className='d-flex flex-wrap align-items-center gap-2 mb-4'>
              <h6 className='fw-medium text-dark mb-0 fs-5 DM-Sans  w-230-mobile'>Upcoming Sync Appointments</h6>
              <div className='d-flex align-items-center gap-2 flex-shrink-0'>
                <div
                  className='rounded-circle bg-notification-orange'
                  style={{
                    width: '8px',
                    height: '8px',
                    boxShadow: '0 0 0 0.125rem rgba(255, 107, 53, 0.3)',
                  }}
                />
                <span className='fw-bold small text-notification-orange'>{newAppointmentsCount} New</span>
              </div>
            </div>
          </div>

          {/* Appointments List */}
          <div className='mb-3 flex-grow-1'>
            {appointments.length > 0 ? (
              appointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.consultationId}
                  appointment={appointment}
                  onReschedule={handleReschedule}
                  onTriage={handleTriage}
                  onViewChart={handleViewChart}
                />
              ))
            ) : (
              <div className='text-center text-muted py-4'>No upcoming appointments</div>
            )}
          </div>

          {/* Start Sync Button */}
          <div className='d-flex justify-content-end mt-auto'>
            <Button variant='primary' size='sm' onClick={handleStartTelehealth} className='px-3 py-2'>
              Start Sync Appointment
            </Button>
          </div>
        </Card.Body>
      </Card>
    </>
  );
};

export default UpcomingTelehealth;
