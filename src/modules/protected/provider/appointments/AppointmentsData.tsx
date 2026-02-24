import { PatientWithOrder } from '@/store/slices/patientsApiSlice';
import { formatCityState } from '@/helpers/stateHelpers';
import { IPendingrxPatientListInfo } from '@/types/appointment';

// Utility function to transform API response to UI format

export const transformApiResponseToUI = (
  apiData: { appointments: PatientWithOrder[]; todayCount: number } | undefined | null
): IPendingrxPatientListInfo[] => {
  // Handle cases where apiData or appointments is not available
  if (!apiData || !apiData.appointments) {
    return [];
  }

  return apiData.appointments.map((patient) => {
    // Calculate age from DOB - use a fixed date to prevent hydration issues
    let actualAge = 0;
    if (patient.dob) {
      const dob = new Date(patient.dob);
      const today = new Date('2025-01-01'); // Use fixed date to prevent hydration issues
      const age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate()) ? age - 1 : age;
    }

    // Extract state from address (handle null address)
    const state = patient.address?.shippingAddress?.state || 'N/A';
    const city = patient.address?.shippingAddress?.city || '';
    const location = formatCityState(city, state);

    // Calculate BMI from bio data (handle missing bio data)
    const weight = patient.bio?.weight || 0;
    const heightFeet = parseInt(patient.bio?.heightFeet || '0');
    const heightInches = parseInt(patient.bio?.heightInches || '0');
    const totalHeightInches = heightFeet * 12 + heightInches;
    const heightInMeters = totalHeightInches * 0.0254;
    const weightInKg = weight * 0.453592;
    const bmi = heightInMeters > 0 ? (weightInKg / (heightInMeters * heightInMeters)).toFixed(1) : 'N/A';

    return {
      id: patient.orderId,
      patientInfo: {
        firstName: patient.firstName,
        lastName: patient.lastName,
        age: actualAge,
        gender: patient.gender,
        state: location,
        // Add weight and BMI for UI display
        weight: weight,
        bmi: bmi,
        id: patient.patientId,
      },
      orderInfo: {
        drugName: patient.product,
        prescription: `${patient.product} - ${patient.visitType || 'Video Visit'}`,
        orderType: patient.visitType === 'video' ? 'Video Consultation' : 'In-Person',
      },
      scheduledAt: patient.scheduledAt ?? null,
      rxStatus: patient.status as IPendingrxPatientListInfo['rxStatus'],
      reason: patient.reason ?? null,
      meetingLink: patient.meetingLink,
      rescheduleLink: patient.rescheduleLink,
      declineLink: patient.declineLink,
      createdAt: patient.createdAt ?? null,
      type: patient.type ?? '',
    };
  });
};
