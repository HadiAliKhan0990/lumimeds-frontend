'use client';

import { connectProviderSocket, disconnectProviderSocket } from '@/lib/providerSocket';
import { providerDashboardSocket } from '@/lib/providerDashboardSocket';
import { useGetCalendlyDoctorStatusQuery } from '@/store/slices/calendlyApiSlice';
import {
  setDashboardStats,
  setSocketConnected,
  setSocketError,
  clearSocketError,
  addAppointment as addTelehealthAppointment,
  removeAppointment as removeTelehealthAppointment,
  incrementAppointmentStats,
  decrementAppointmentStats,
  incrementEncounterStats,
  decrementEncounterStats,
  incrementApprovedStats,
  addAdminMessage,
  addPatientMessage,
} from '@/store/slices/providerSlice';
import {
  addAppointment,
  updateAppointment,
  removeAppointment,
  addAppointmentEvent,
  setConnectionStatus as setAppointmentConnectionStatus,
  setError as setAppointmentError,
  clearError as clearAppointmentError,
  triggerRefetch as triggerAppointmentRefetch,
} from '@/store/slices/appointmentsRealTimeSlice';
import {
  addEncounter,
  updateEncounter,
  removeEncounter,
  addEncounterEvent,
  setConnectionStatus as setEncounterConnectionStatus,
  setError as setEncounterError,
  clearError as clearEncounterError,
} from '@/store/slices/encountersRealTimeSlice';
import { useEffect, useRef } from 'react';
import { setCalendlyStatus, setCalendlyLoading } from '@/store/slices/calendlySlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { PendingEncounter } from '@/store/slices/ordersApiSlice';
import { setUser, User } from '@/store/slices/userSlice';
import { toast } from 'react-hot-toast';
import { IPendingrxPatientListInfo } from '@/types/appointment';
import { updateConversationStatusByChatRoomId } from '@/store/slices/chatSlice';

// Transform telehealth appointment data from backend to frontend structure
const transformTelehealthAppointmentData = (appointment: Record<string, unknown>): Record<string, unknown> => {
  const apt = appointment as {
    id?: string;
    startTime?: string;
    scheduledAt?: string;
    endTime?: string;
    endsAt?: string;
    status?: string;
    patient?: {
      id?: string;
      firstName?: string;
      dob?: string;
      gender?: string;
    };
    patientId?: string;
    rescheduleUrl?: string;
    type?: string;
    order?: { type?: string };
  };

  return {
    consultationId: apt.id,
    startTime: apt.startTime || apt.scheduledAt,
    endTime: apt.endTime || apt.endsAt,
    status: apt.status,
    patient: {
      id: apt.patient?.id || apt.patientId,
      firstName: apt.patient?.firstName || 'Unknown',
      dob: apt.patient?.dob || '',
      gender: apt.patient?.gender || 'Unknown',
    },
    rescheduleUrl: apt.rescheduleUrl,
    type: apt.order?.type ?? '',
  };
};

// Transform appointment data from backend to frontend structure
const transformAppointmentData = (appointment: Record<string, unknown>): IPendingrxPatientListInfo => {
  const apt = appointment as {
    id?: string;
    orderId?: string;
    patient?: {
      id?: string;
      firstName?: string;
      lastName?: string;
      dob?: string;
      gender?: string;
      address?: {
        shippingAddress?: {
          state?: string;
          city?: string;
        };
      };
      bio?: {
        weight?: number;
        heightFeet?: string;
        heightInches?: string;
      };
    };
    patientId?: string;
    order?: {
      id?: string;
      productType?: {
        name?: string;
      };
      address?: {
        shippingAddress?: {
          city?: string;
          state?: string;
        };
      };
      type?: string;
    };
    scheduledAt?: string;
    status?: string;
    meetingLink?: string;
    rescheduleUrl?: string;
    cancelUrl?: string;
    createdAt?: string;
    type?: string;
  };

  // Calculate age from DOB
  let actualAge = 0;
  if (apt.patient?.dob) {
    const dob = new Date(apt.patient.dob);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate()) ? age - 1 : age;
  }

  // Extract state from address (nested under order.address)
  const state = apt.order?.address?.shippingAddress?.state || 'N/A';
  const city = apt.order?.address?.shippingAddress?.city || '';
  const location = city && state ? `${city}, ${state}` : state;

  // Calculate BMI from bio data
  const weight = apt.patient?.bio?.weight || 0;
  const heightFeet = parseInt(apt.patient?.bio?.heightFeet || '0');
  const heightInches = parseInt(apt.patient?.bio?.heightInches || '0');
  const totalHeightInches = heightFeet * 12 + heightInches;
  const heightInMeters = totalHeightInches * 0.0254;
  const weightInKg = weight * 0.453592;
  const bmi = heightInMeters > 0 ? (weightInKg / (heightInMeters * heightInMeters)).toFixed(1) : 'N/A';

  return {
    id: apt.orderId || apt.order?.id || apt.id,
    patientInfo: {
      firstName: apt.patient?.firstName || 'Unknown',
      lastName: apt.patient?.lastName || '',
      age: actualAge,
      gender: apt.patient?.gender || 'Unknown',
      state: location,
      weight: weight,
      bmi: bmi,
      id: apt.patient?.id || apt.patientId,
    },
    orderInfo: {
      drugName: apt.order?.productType?.name || 'Unknown Product',
      prescription: `${apt.order?.productType?.name || 'Unknown Product'} - Video Visit`,
      orderType: 'Video Consultation',
    },
    scheduledAt: apt.scheduledAt ?? null,
    rxStatus: (apt.status as IPendingrxPatientListInfo['rxStatus']) || 'pending_confirmation',
    meetingLink: apt.meetingLink,
    rescheduleLink: apt.rescheduleUrl,
    declineLink: apt.cancelUrl,
    createdAt: apt.createdAt ?? null,
    type: apt.order?.type ?? '',
  };
};

// Transform order data from backend to frontend structure
const transformEncounterData = (order: Record<string, unknown>): PendingEncounter => {
  const ord = order as {
    id?: string;
    patient?: {
      id?: string;
      firstName?: string;
      lastName?: string;
      dob?: string;
      gender?: string;
      address?: {
        shippingAddress?: {
          state?: string;
          city?: string;
        };
      };
    };
    // Socket data structure - address is directly on the encounter
    address?: {
      shippingAddress?: {
        state?: string;
        city?: string;
      };
    };
    patientId?: string;
    productType?: {
      name?: string;
    };
    refillType?: string | null;
    subscriptionId?: string | null;
    assignedAt?: string;
    createdAt?: string;
    status?: string;
    isNew?: boolean;
    isExpiring?: boolean;
    type?: string;
  };

  // Calculate age from DOB
  let actualAge = 0;
  if (ord.patient?.dob) {
    const dob = new Date(ord.patient.dob);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate()) ? age - 1 : age;
  }

  // Extract state from address - check both socket data structure and regular API structure
  const state = ord.address?.shippingAddress?.state || '';
  const city = ord.address?.shippingAddress?.city || '';
  const location = city && state ? `${city}, ${state}` : state;

  const transformedEncounter: PendingEncounter = {
    id: ord.id || '',
    patient: {
      firstName: ord.patient?.firstName || 'Unknown',
      lastName: ord.patient?.lastName || '',
      age: actualAge,
      gender: ord.patient?.gender || 'Unknown',
      id: ord.patient?.id || ord.patientId || '',
    },
    ordered: {
      products: ord.productType?.name ? [ord.productType.name] : [],
      subscription: (ord.refillType as 'Order' | 'Subscription') || '',
    },
    state: location,
    assignedAt: ord.assignedAt || ord.createdAt || new Date().toISOString(),
    rxStatus: ord.status || 'Pending',
    isNew: ord.isNew || false,
    isExpiring: ord.isExpiring || false,
    type: ord?.type ?? '',
  };

  return transformedEncounter;
};

export interface ProviderWrapperProps extends React.ComponentPropsWithoutRef<'div'> {
  accessToken?: string | null;
  providerProfile?: User;
}

export default function ProviderWrapper({ children, accessToken, providerProfile }: Readonly<ProviderWrapperProps>) {
  const dispatch = useDispatch();
  const isInitialized = useRef(false);

  const { selectedRole } = useSelector((state: RootState) => state.chat);

  const { data: calendlyStatus, isFetching: isFetchingCalendlyStatus } = useGetCalendlyDoctorStatusQuery(
    providerProfile?.id || '',
    {
      skip: !providerProfile?.id,
      refetchOnMountOrArgChange: true, // Ensure safe refetching
    }
  );

  useEffect(() => {
    if (providerProfile) {
      dispatch(setUser({ ...providerProfile, role: 'provider' }));
    }
  }, [providerProfile, dispatch]);

  useEffect(() => {
    if (calendlyStatus) {
      dispatch(setCalendlyStatus(calendlyStatus));
    }
  }, [calendlyStatus, dispatch]);

  useEffect(() => {
    setCalendlyLoading(isFetchingCalendlyStatus);
  }, [isFetchingCalendlyStatus]);

  const connectExistingProviderSocket = async (token: string) => {
    const providerSocket = connectProviderSocket(token);

    providerSocket.on('connect', async () => {
      // console.log('Provider socket connected');
    });

    providerSocket.on('disconnect', () => {
      // console.log('Provider socket disconnected', reason);
    });
  };

  const connectDashboardSocket = async (token: string) => {
    try {
      dispatch(clearSocketError());
      dispatch(setSocketConnected(false));
      dispatch(setAppointmentConnectionStatus(false));
      dispatch(setEncounterConnectionStatus(false));
      dispatch(clearAppointmentError());
      dispatch(clearEncounterError());

      await providerDashboardSocket.connect(token);

      // Connect to default namespace for message events
      providerDashboardSocket.connectDefaultNamespace(token);

      dispatch(setSocketConnected(true));
      dispatch(setAppointmentConnectionStatus(true));
      dispatch(setEncounterConnectionStatus(true));

      providerDashboardSocket.onDashboardUpdate((data) => {
        const stats = (data as { stats?: Record<string, unknown> }).stats || data;
        dispatch(setDashboardStats(stats as unknown as Parameters<typeof setDashboardStats>[0]));
      });

      // Set up message event listener from default namespace (chat gateway)
      providerDashboardSocket.onNewMessage((message) => {
        // console.log('📨 [PROVIDER_WRAPPER] Received newMessage from chat gateway:', message);

        const messageData = message as unknown as {
          id: string;
          content: string;
          senderId: string;
          receiverId: string;
          chatRoomId: string;
          createdAt: string;
          isRead: boolean;
          notifiedAt: string | null;
          metadata: {
            actualAdminId?: string;
            adminName?: string;
            fileUrl?: string;
            patientName?: string;
            patientFirstName?: string;
            patientLastName?: string;
          };
          sender: {
            id: string;
            firstName?: string;
            lastName?: string;
            email?: string;
            role?: string;
          };
          receiver: {
            id: string;
          };
          // Enhanced message structure from backend
          patient?: {
            id: string;
            firstName: string;
            lastName: string;
            dob: string;
            gender: string;
          };
          admin?: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
          };
        };

        // Determine if this is an admin message based on metadata
        const isAdminMessage = messageData.metadata?.actualAdminId || messageData.metadata?.adminName;

        if (message.chatRoomId || message.chatRoom?.id) {
          const chatRoomId = message.chatRoomId || message.chatRoom?.id || '';

          // Update or add conversation at the top of the appropriate array
          dispatch(
            updateConversationStatusByChatRoomId({
              chatRoomId,
              status: 'unresolved',
              message,
              role: selectedRole, // Pass role to determine which array to update/add to
            })
          );
        }

        if (isAdminMessage) {
          // Normalize socket message to match API structure
          const normalizedMessage = {
            id: messageData.id,
            content: messageData.content,
            metadata: {
              ...messageData.metadata,
              fileUrl: messageData.metadata?.fileUrl || null,
            },
            senderId: messageData.senderId,
            receiverId: messageData.receiverId,
            createdAt: messageData.createdAt,
            isRead: messageData.isRead,
            chatRoomId: messageData.chatRoomId,
            notifiedAt: null,
            admin: {
              id: messageData.metadata?.actualAdminId || messageData.senderId,
              firstName: messageData.metadata?.adminName || 'Admin',
              lastName: '',
              email: '',
            },
          };

          dispatch(addAdminMessage(normalizedMessage));
        } else {
          // Normalize socket message to match API structure
          const normalizedMessage = {
            id: messageData.id,
            content: messageData.content,
            metadata: {
              ...messageData.metadata,
              fileUrl: messageData.metadata?.fileUrl || null,
            },
            senderId: messageData.senderId,
            receiverId: messageData.receiverId,
            createdAt: messageData.createdAt,
            isRead: messageData.isRead,
            chatRoomId: messageData.chatRoomId,
            notifiedAt: messageData.notifiedAt,
            patient: {
              id: messageData.patient?.id || messageData.senderId,
              firstName: messageData.patient?.firstName || 'Patient',
              lastName: messageData.patient?.lastName || '',
              dob: messageData.patient?.dob || '',
              gender: messageData.patient?.gender || '',
            },
          };

          dispatch(addPatientMessage(normalizedMessage));
        }
      });

      // Set up single event listener for both appointments and encounters
      providerDashboardSocket.onAppointmentEvent((data: Record<string, unknown>) => {
        // console.log('[PROVIDER_WRAPPER] Received socket event:', data);
        const { type, event, appointments, encounters } = data as {
          type: string;
          event: string;
          appointments?: Record<string, unknown>[];
          encounters?: Record<string, unknown>[];
        };

        // Handle provider_appointment events
        if (type === 'provider_appointment' && appointments && Array.isArray(appointments)) {
          // console.log('[PROVIDER_WRAPPER] Processing appointment event:', {
          //   type,
          //   event,
          //   appointmentsCount: appointments.length,
          // });

          // Process each appointment in the array
          appointments.forEach((appointment) => {
            const transformedAppointment = transformAppointmentData(appointment);
            const transformedTelehealthAppointment = transformTelehealthAppointmentData(appointment);

            switch (event) {
              case 'assigned':
                dispatch(addAppointment(transformedAppointment));
                dispatch(
                  addAppointmentEvent({
                    type: 'assigned',
                    appointment: transformedAppointment,
                    timestamp: new Date().toISOString(),
                  })
                );

                const assignedStatus = (appointment as { status?: string })?.status?.toLowerCase();
                const hasScheduledTime = !!(appointment as { scheduledAt?: string })?.scheduledAt;

                if (assignedStatus === 'scheduled' || hasScheduledTime) {
                  dispatch(addTelehealthAppointment(transformedTelehealthAppointment));
                }

                dispatch(incrementAppointmentStats());
                dispatch(triggerAppointmentRefetch());
                break;

              case 'scheduled':
                dispatch(updateAppointment(transformedAppointment));

                dispatch(
                  addAppointmentEvent({
                    type: 'created',
                    appointment: transformedAppointment,
                    timestamp: new Date().toISOString(),
                  })
                );

                const appointmentStatus = (appointment as { status?: string })?.status?.toLowerCase();
                if (appointmentStatus === 'scheduled') {
                  dispatch(addTelehealthAppointment(transformedTelehealthAppointment));
                }
                break;

              case 'cancelled':
                if (transformedAppointment.id) {
                  dispatch(removeAppointment(String(transformedAppointment.id)));
                }
                dispatch(
                  addAppointmentEvent({
                    type: 'cancelled',
                    appointment: transformedAppointment,
                    timestamp: new Date().toISOString(),
                  })
                );

                if (transformedTelehealthAppointment.consultationId) {
                  dispatch(removeTelehealthAppointment(String(transformedTelehealthAppointment.consultationId)));
                }
                // Update dashboard stats
                dispatch(decrementAppointmentStats());

                const patientName = transformedAppointment.patientInfo
                  ? `${transformedAppointment.patientInfo.firstName || ''} ${
                      transformedAppointment.patientInfo.lastName || ''
                    }`.trim()
                  : 'Patient';
                toast.success(`Appointment with ${patientName} has been declined successfully`);
                // console.log('❌ [SOCKET] Removed appointment from real-time store:', transformedAppointment.id);
                break;

              case 'declined':
                if (transformedAppointment.id) {
                  dispatch(removeAppointment(String(transformedAppointment.id)));
                }
                dispatch(
                  addAppointmentEvent({
                    type: 'cancelled',
                    appointment: transformedAppointment,
                    timestamp: new Date().toISOString(),
                  })
                );

                if (transformedTelehealthAppointment.consultationId) {
                  dispatch(removeTelehealthAppointment(String(transformedTelehealthAppointment.consultationId)));
                }
                dispatch(decrementAppointmentStats());

                const declinedPatientName = transformedAppointment.patientInfo
                  ? `${transformedAppointment.patientInfo.firstName || ''} ${
                      transformedAppointment.patientInfo.lastName || ''
                    }`.trim()
                  : 'Patient';
                toast.success(`Appointment with ${declinedPatientName} has been declined successfully`);
                break;

              case 'rescheduled':
                dispatch(updateAppointment(transformedAppointment));
                dispatch(
                  addAppointmentEvent({
                    type: 'rescheduled',
                    appointment: transformedAppointment,
                    timestamp: new Date().toISOString(),
                  })
                );

                dispatch(addTelehealthAppointment(transformedTelehealthAppointment));

                const rescheduledPatientName = transformedAppointment.patientInfo
                  ? `${transformedAppointment.patientInfo.firstName || ''} ${
                      transformedAppointment.patientInfo.lastName || ''
                    }`.trim()
                  : 'Patient';
                toast.success(`Appointment with ${rescheduledPatientName} has been rescheduled successfully`);
                break;

              case 'completed':
                if (transformedAppointment.id) {
                  dispatch(removeAppointment(String(transformedAppointment.id)));
                }
                dispatch(
                  addAppointmentEvent({
                    type: 'completed',
                    appointment: transformedAppointment,
                    timestamp: new Date().toISOString(),
                  })
                );

                if (transformedTelehealthAppointment.consultationId) {
                  dispatch(removeTelehealthAppointment(String(transformedTelehealthAppointment.consultationId)));
                }
                dispatch(decrementAppointmentStats());

                break;

              default:
                break;
            }
          });
        }

        // Handle provider_pending_encounter events
        if (type === 'provider_pending_encounter' && encounters && Array.isArray(encounters)) {
          // console.log('[PROVIDER_WRAPPER] Processing encounter event:', {
          //   type,
          //   event,
          //   encountersCount: encounters.length,
          // });

          // Process each encounter in the array
          encounters.forEach((encounter) => {
            // Transform encounter data to match frontend structure
            const transformedEncounter = transformEncounterData(encounter);

            switch (event) {
              case 'pending':
              case 'assigned':
                // Add new encounter
                dispatch(addEncounter(transformedEncounter));
                dispatch(
                  addEncounterEvent({
                    type: 'assigned',
                    encounter: transformedEncounter,
                    timestamp: new Date().toISOString(),
                  })
                );
                // Update dashboard stats
                dispatch(incrementEncounterStats());
                break;

              case 'cancelled':
                // Remove encounter
                if (transformedEncounter.id) {
                  dispatch(removeEncounter(transformedEncounter.id));
                }
                dispatch(
                  addEncounterEvent({
                    type: 'cancelled',
                    encounter: transformedEncounter,
                    timestamp: new Date().toISOString(),
                  })
                );
                // Update dashboard stats
                dispatch(decrementEncounterStats());
                break;

              case 'approved':
                dispatch(updateEncounter(transformedEncounter));
                dispatch(
                  addEncounterEvent({
                    type: 'approved',
                    encounter: transformedEncounter,
                    timestamp: new Date().toISOString(),
                  })
                );
                // Update dashboard stats - decrement pending, increment approved
                dispatch(decrementEncounterStats());
                dispatch(incrementApprovedStats());
                break;

              case 'rejected':
                dispatch(updateEncounter(transformedEncounter));
                dispatch(
                  addEncounterEvent({
                    type: 'rejected',
                    encounter: transformedEncounter,
                    timestamp: new Date().toISOString(),
                  })
                );
                // Update dashboard stats - decrement pending
                dispatch(decrementEncounterStats());
                break;

              default:
                // For any other status changes, just update the encounter
                dispatch(updateEncounter(transformedEncounter));
                dispatch(
                  addEncounterEvent({
                    type: 'updated',
                    encounter: transformedEncounter,
                    timestamp: new Date().toISOString(),
                  })
                );
                break;
            }
          });
        }
      });
    } catch (error) {
      // console.error('Failed to connect dashboard socket:', error);
      dispatch(setSocketError(error instanceof Error ? error.message : 'Connection failed'));
      dispatch(setSocketConnected(false));
      dispatch(setAppointmentConnectionStatus(false));
      dispatch(setEncounterConnectionStatus(false));
      dispatch(setAppointmentError(error instanceof Error ? error.message : 'Connection failed'));
      dispatch(setEncounterError(error instanceof Error ? error.message : 'Connection failed'));
    }
  };

  useEffect(() => {
    if (accessToken && !isInitialized.current) {
      isInitialized.current = true;
      connectExistingProviderSocket(accessToken);
      connectDashboardSocket(accessToken);
    }

    // Cleanup function
    return () => {
      if (isInitialized.current) {
        providerDashboardSocket.disconnect();
        // console.log('Provider stats: Dashboard socket disconnected');
        isInitialized.current = false;

        disconnectProviderSocket();
      }
    };
  }, [accessToken]);

  return children;
}
